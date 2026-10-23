import { Container } from 'pixi.js';
import type { GameContext } from '../types';
import type { ViewportSize } from '../viewport/Viewport';

/**
 * Сцена — один экран игры (меню, геймплей, магазин, экран загрузки).
 *
 * Жизненный цикл (вызывает SceneManager, никогда не вызывай сам):
 *   constructor → [загрузка bundles] → load(params) → enter(params) → resize(size)
 *   → update(dt) / fixedUpdate(dt) каждый кадр, resize(size) при изменении экрана
 *   → exit() → уничтожение root и всех disposers.
 *
 * Правила:
 *   - Всё, что рисует сцена, живёт в `this.root`. Не трогай app.stage.
 *   - Всё, что подписывается на что-то снаружи (store.subscribe, window events, gsap),
 *     регистрирует отписку через `this.addDisposer()`.
 *   - В конструкторе ctx ещё нет — создавай объекты в enter().
 */
export abstract class Scene<P = void> {
  /** Корень сцены. Добавляется в мир движком, уничтожается вместе со сценой. */
  readonly root = new Container();
  /** Бандлы из манифеста игры, которые должны быть загружены до enter(). */
  readonly bundles: readonly string[] = [];

  private context: GameContext | null = null;
  private disposers: Array<() => void> = [];
  private entered = false;

  protected get ctx(): GameContext {
    if (!this.context) throw new Error(`${this.constructor.name}: ctx недоступен в конструкторе, используй enter()`);
    return this.context;
  }

  /** Асинхронная подготовка после загрузки бандлов: данные уровня с бэкенда и т.п. Идёт под экраном загрузки. */
  load?(params: P): Promise<void>;
  /** Построить сцену. Размеры экрана — в this.ctx.viewport. */
  abstract enter(params: P): void;
  /** Каждый кадр, dt в секундах (переменный). Анимации, визуал, ввод. */
  update?(dt: number): void;
  /** С фиксированным шагом (1/60 с). Физика и детерминированная симуляция. */
  fixedUpdate?(dt: number): void;
  /** Видимая область мира изменилась. Вызывается сразу после enter() и при каждом ресайзе. */
  resize?(size: ViewportSize): void;
  /** Приложение ушло в фон (свернули вкладку / телефон заблокирован). */
  onHidden?(): void;
  /** Приложение вернулось из фона. */
  onVisible?(): void;
  /** Перед уничтожением. Всё, что добавлено через addDisposer, очистится само. */
  exit?(): void;

  protected addDisposer(dispose: () => void): void {
    this.disposers.push(dispose);
  }

  /** @internal — только для SceneManager */
  _attach(ctx: GameContext): void {
    this.context = ctx;
  }

  /** @internal — только для SceneManager */
  _enter(params: P): void {
    this.entered = true;
    this.enter(params);
  }

  /** @internal — только для SceneManager */
  _dispose(): void {
    if (this.entered) this.exit?.();
    for (const dispose of this.disposers.reverse()) dispose();
    this.disposers = [];
    // Текстуры принадлежат AssetService и не уничтожаются вместе со сценой.
    this.root.destroy({ children: true });
    this.context = null;
  }
}

/** Экран загрузки. Должен показываться мгновенно, поэтому bundles обычно пустые. */
export abstract class LoadingScene extends Scene {
  /** Прогресс от 0 до 1. */
  abstract setProgress(progress: number): void;
}
