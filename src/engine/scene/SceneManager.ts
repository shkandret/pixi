import type { Container } from 'pixi.js';
import type { AssetService } from '../assets/AssetService';
import type { GameContext, SceneFactory } from '../types';
import type { Viewport } from '../viewport/Viewport';
import type { LoadingScene, Scene } from './Scene';

interface SceneManagerOptions {
  layer: Container;
  ctx: GameContext;
  scenes: Record<string, SceneFactory>;
  loadingScene: () => LoadingScene;
  assets: AssetService;
  viewport: Viewport;
  onChange(state: { scene: string | null; loading: boolean; progress: number }): void;
}

/**
 * Держит ровно одну активную сцену. Переход:
 *   старая сцена уничтожается → (если нужно) экран загрузки → бандлы + scene.load() → новая сцена enter().
 *
 * Загрузчик — не «сцена игры», а состояние перехода. Игра лишь объявляет, ЧТО нужно сцене
 * (scene.bundles), а КОГДА и КАК это грузить с прогрессом — решает менеджер.
 */
export class SceneManager {
  private current: Scene<never> | null = null;
  private currentKey: string | null = null;
  private loading: LoadingScene | null = null;
  /** Номер последнего перехода: если во время загрузки вызвали goto() ещё раз, старый переход отменяется. */
  private transition = 0;

  constructor(private readonly options: SceneManagerOptions) {}

  get key(): string | null {
    return this.currentKey;
  }

  async goto(key: string, params?: unknown): Promise<void> {
    const { scenes, ctx, assets, layer } = this.options;
    const factory = scenes[key];
    if (!factory) {
      throw new Error(`Сцена "${key}" не найдена в игре "${ctx.game.id}". Есть: ${Object.keys(scenes).join(', ')}`);
    }

    const transition = ++this.transition;
    const isStale = () => transition !== this.transition;
    // goto() часто зовут из update()/обработчика клика самой сцены. Уничтожаем её не посреди
    // её же кода, а после того, как текущий кадр закончится (микротаска).
    await Promise.resolve();
    if (isStale()) return;
    this.disposeCurrent();

    const next = factory();
    next._attach(ctx);

    const needsLoading = !assets.isLoaded(next.bundles) || next.load !== undefined;
    try {
      if (needsLoading) await this.showLoading();
      if (isStale()) return next._dispose();

      // Бандлы — 90% прогресса, если у сцены есть load(); иначе все 100%.
      const share = next.load ? 0.9 : 1;
      await assets.loadBundles(next.bundles, (p) => this.setProgress(p * share));
      if (isStale()) return next._dispose();

      await next.load?.(params as never);
      if (isStale()) return next._dispose();
    } catch (error) {
      next._dispose();
      if (!isStale()) this.hideLoading();
      throw error;
    }

    this.hideLoading();
    this.current = next;
    this.currentKey = key;
    layer.addChild(next.root);
    next._enter(params as never);
    next.resize?.(this.options.viewport.size);
    this.notify();
  }

  update(dt: number): void {
    this.current?.update?.(dt);
  }

  fixedUpdate(dt: number): void {
    this.current?.fixedUpdate?.(dt);
  }

  /** Экран загрузки анимируется даже на паузе. */
  updateLoading(dt: number): void {
    this.loading?.update?.(dt);
  }

  resize(): void {
    const size = this.options.viewport.size;
    this.current?.resize?.(size);
    this.loading?.resize?.(size);
  }

  visibilityChanged(visible: boolean): void {
    if (visible) this.current?.onVisible?.();
    else this.current?.onHidden?.();
  }

  destroy(): void {
    this.transition++;
    this.disposeCurrent();
    this.hideLoading();
  }

  private disposeCurrent(): void {
    this.current?._dispose();
    this.current = null;
    this.currentKey = null;
  }

  private async showLoading(): Promise<void> {
    if (this.loading) return this.setProgress(0);
    const scene = this.options.loadingScene();
    scene._attach(this.options.ctx);
    await this.options.assets.loadBundles(scene.bundles);
    this.loading = scene;
    this.options.layer.addChild(scene.root);
    scene._enter();
    scene.resize?.(this.options.viewport.size);
    this.setProgress(0);
  }

  private hideLoading(): void {
    this.loading?._dispose();
    this.loading = null;
    this.notify();
  }

  private setProgress(progress: number): void {
    this.loading?.setProgress(progress);
    this.options.onChange({ scene: this.currentKey, loading: true, progress });
  }

  private notify(): void {
    this.options.onChange({ scene: this.currentKey, loading: this.loading !== null, progress: this.loading ? 0 : 1 });
  }
}
