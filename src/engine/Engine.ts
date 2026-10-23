import { Application, Container, type Ticker } from 'pixi.js';
import { AssetService } from './assets/AssetService';
import { createEngineStore, initialEngineState } from './engineStore';
import { Keyboard } from './input/Keyboard';
import { GameStorage } from './platform/GameStorage';
import { createPlatform } from './platform/Platform';
import { DefaultLoadingScene } from './scene/DefaultLoadingScene';
import { SceneManager } from './scene/SceneManager';
import type { GameContext, GameDefinition } from './types';
import { Viewport } from './viewport/Viewport';

const FIXED_DT = 1 / 60;
/** Не больше стольких шагов физики за кадр, иначе на слабом устройстве — «спираль смерти». */
const MAX_FIXED_STEPS = 5;
/** После лага или возврата из фона не прыгаем вперёд больше чем на 100 мс. */
const MAX_DT = 0.1;
const DEFAULT_BACKGROUND = 0x0a0a0a;

interface RunningGame {
  definition: GameDefinition;
  ctx: GameContext;
  scenes: SceneManager;
  assets: AssetService;
  layer: Container;
}

/**
 * Движок: владеет Pixi Application, игровым циклом, вьюпортом и жизнью ОДНОЙ запущенной игры.
 * Не зависит от React — GameHost лишь создаёт его и передаёт DOM-элемент.
 *
 * Все операции жизненного цикла (init / runGame / stopGame / destroy) идут через очередь:
 * React StrictMode и быстрые переключения игр не могут их перемешать.
 */
export class Engine {
  readonly app = new Application();
  readonly state = createEngineStore();
  readonly viewport = new Viewport();
  readonly keyboard = new Keyboard();
  readonly platform = createPlatform();

  /** Всё, что рисует игра, лежит в world: он масштабируется под экран. */
  private readonly world = new Container();
  private game: RunningGame | null = null;
  private queue: Promise<void> = Promise.resolve();
  private cleanups: Array<() => void> = [];
  private accumulator = 0;
  private initialized = false;

  init(mount: HTMLElement): Promise<void> {
    return this.enqueue(async () => {
      await this.app.init({
        background: DEFAULT_BACKGROUND,
        antialias: true,
        // Выше 2 разница не видна, а нагрузка на телефонах с DPR 3 растёт в 2+ раза.
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
        // WebGPU в мобильных WebView ещё нестабилен.
        preference: 'webgl',
        width: mount.clientWidth || 1,
        height: mount.clientHeight || 1,
      });
      mount.appendChild(this.app.canvas);
      this.app.stage.addChild(this.world);
      this.app.ticker.add(this.tick);

      const observer = new ResizeObserver(() => this.resize(mount.clientWidth, mount.clientHeight));
      observer.observe(mount);
      const onVisibility = () => this.onVisibilityChange(document.visibilityState === 'visible');
      document.addEventListener('visibilitychange', onVisibility);
      this.cleanups.push(
        () => observer.disconnect(),
        () => document.removeEventListener('visibilitychange', onVisibility),
        this.keyboard.attach(window),
      );
      this.resize(mount.clientWidth, mount.clientHeight);
      this.initialized = true;
    });
  }

  /** Остановить текущую игру (если есть) и запустить новую. */
  runGame(definition: GameDefinition): Promise<void> {
    return this.enqueue(async () => {
      await this.stopCurrentGame();
      await this.startGame(definition);
    });
  }

  stopGame(): Promise<void> {
    return this.enqueue(() => this.stopCurrentGame());
  }

  destroy(): Promise<void> {
    return this.enqueue(async () => {
      await this.stopCurrentGame();
      for (const cleanup of this.cleanups) cleanup();
      this.cleanups = [];
      if (this.initialized) this.app.destroy({ removeView: true }, { children: true });
      this.initialized = false;
    });
  }

  goto(scene: string, params?: unknown): Promise<void> {
    if (!this.game) return Promise.reject(new Error('Нет запущенной игры'));
    return this.game.scenes.goto(scene, params);
  }

  /** Пауза игровой логики: update/fixedUpdate не вызываются, рендер продолжается (видно меню паузы). */
  pause(): void {
    this.state.setState({ paused: true });
  }

  resume(): void {
    this.accumulator = 0;
    this.state.setState({ paused: false });
  }

  get paused(): boolean {
    return this.state.getState().paused;
  }

  private async startGame(definition: GameDefinition): Promise<void> {
    this.state.setState({ ...initialEngineState, status: 'starting', gameId: definition.id });
    try {
      this.app.renderer.background.color = definition.background ?? DEFAULT_BACKGROUND;
      this.viewport.configure(definition.viewport);
      this.resize(this.app.screen.width, this.app.screen.height);

      const assets = new AssetService(definition.id);
      const manifest = typeof definition.assets === 'function' ? await definition.assets() : definition.assets;
      if (manifest) assets.register(manifest);

      const layer = new Container();
      this.world.addChild(layer);

      const ctx: GameContext = {
        game: definition,
        app: this.app,
        assets,
        viewport: this.viewport,
        keyboard: this.keyboard,
        platform: this.platform,
        storage: new GameStorage(this.platform.storage, definition.id),
        goto: (scene, params) => scenes.goto(scene, params),
        pause: () => this.pause(),
        resume: () => this.resume(),
        isPaused: () => this.paused,
      };
      const scenes = new SceneManager({
        layer,
        ctx,
        assets,
        scenes: definition.scenes,
        loadingScene: definition.loadingScene ?? (() => new DefaultLoadingScene()),
        viewport: this.viewport,
        onChange: (s) => this.state.setState(s),
      });
      this.game = { definition, ctx, scenes, assets, layer };

      await definition.setup?.(ctx);
      await scenes.goto(definition.initialScene);
      if (definition.backgroundBundles) assets.backgroundLoad(definition.backgroundBundles);
      this.state.setState({ status: 'running' });
    } catch (error) {
      console.error(`[engine] игра "${definition.id}" не запустилась`, error);
      this.state.setState({ status: 'error', error: error instanceof Error ? error.message : String(error) });
    }
  }

  private async stopCurrentGame(): Promise<void> {
    const game = this.game;
    if (!game) return;
    this.game = null;
    game.definition.teardown?.(game.ctx);
    game.scenes.destroy();
    game.layer.destroy({ children: true });
    await game.assets.unloadAll();
    this.keyboard.reset();
    this.accumulator = 0;
    this.state.setState(initialEngineState);
  }

  private tick = (ticker: Ticker): void => {
    const scenes = this.game?.scenes;
    if (!scenes) return;
    const dt = Math.min(ticker.deltaMS / 1000, MAX_DT);

    if (!this.paused) {
      this.accumulator += dt;
      let steps = 0;
      while (this.accumulator >= FIXED_DT && steps < MAX_FIXED_STEPS) {
        scenes.fixedUpdate(FIXED_DT);
        this.accumulator -= FIXED_DT;
        steps++;
      }
      if (steps === MAX_FIXED_STEPS) this.accumulator = 0;
      scenes.update(dt);
    }
    scenes.updateLoading(dt);
    this.keyboard.endFrame();
  };

  private resize(width: number, height: number): void {
    if (width === 0 || height === 0) return;
    this.app.renderer.resize(width, height);
    this.viewport.update(width, height);
    this.viewport.apply(this.world);
    this.game?.scenes.resize();
  }

  private onVisibilityChange(visible: boolean): void {
    // В фоне браузер и так не вызывает requestAnimationFrame; останавливаем тикер явно,
    // чтобы после возврата не получить огромный dt, и даём сцене шанс поставить паузу / посчитать оффлайн-прогресс.
    if (visible) this.app.ticker.start();
    else this.app.ticker.stop();
    this.keyboard.reset();
    this.game?.scenes.visibilityChanged(visible);
  }

  private enqueue(task: () => Promise<void>): Promise<void> {
    const run = this.queue.then(task);
    this.queue = run.catch((error) => console.error('[engine]', error));
    return run;
  }
}
