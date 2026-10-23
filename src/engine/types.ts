import type { Application, AssetsManifest, ColorSource } from 'pixi.js';
import type { ComponentType } from 'react';
import type { AssetService } from './assets/AssetService';
import type { Keyboard } from './input/Keyboard';
import type { GameStorage } from './platform/GameStorage';
import type { Platform } from './platform/Platform';
import type { LoadingScene, Scene } from './scene/Scene';
import type { Viewport } from './viewport/Viewport';

/** Фабрика сцены. Сцена создаётся заново при каждом переходе на неё. */
export type SceneFactory = () => Scene<never>;

/**
 * Как дизайн-разрешение вписывается в экран.
 * - `fit`    — показываем ровно width×height, по краям поля (suika, plinko, пазлы).
 * - `expand` — минимум width×height гарантированно виден, остальное — дополнительная область
 *              мира (survivors, «бесконечные» фоны). Сцена обязана уметь растягиваться в resize().
 */
export type ViewportMode = 'fit' | 'expand';

export interface ViewportConfig {
  width: number;
  height: number;
  mode: ViewportMode;
}

/**
 * Описание игры — единственное, что игра отдаёт движку.
 * Движок ничего не знает об игре, кроме этого объекта.
 */
export interface GameDefinition {
  /** Уникальный id. Используется как неймспейс ассетов и сохранений. */
  id: string;
  title: string;
  viewport: ViewportConfig;
  background?: ColorSource;
  /** Манифест ассетов, либо функция, которая его получает (например, с бэкенда). */
  assets?: AssetsManifest | (() => Promise<AssetsManifest>);
  /** Все сцены игры. Ключ — имя для ctx.goto(). */
  scenes: Record<string, SceneFactory>;
  initialScene: string;
  /** Свой экран загрузки. По умолчанию — DefaultLoadingScene движка. */
  loadingScene?: () => LoadingScene;
  /** Бандлы, которые начинают качаться в фоне сразу после старта первой сцены. */
  backgroundBundles?: string[];
  /** React-оверлей поверх канваса (HUD, меню, попапы). */
  ui?: ComponentType;
  /** Вызывается один раз до первой сцены: загрузить сохранение, сбросить стор и т.п. */
  setup?(ctx: GameContext): void | Promise<void>;
  /** Вызывается при остановке игры. */
  teardown?(ctx: GameContext): void;
}

/** Всё, что доступно сценам через `this.ctx`. Это единственная точка доступа к движку из игры. */
export interface GameContext {
  readonly game: GameDefinition;
  readonly assets: AssetService;
  readonly viewport: Viewport;
  readonly keyboard: Keyboard;
  readonly platform: Platform;
  /** Хранилище, автоматически изолированное по game.id. */
  readonly storage: GameStorage;
  /** Перейти на сцену. Старая сцена уничтожается, ассеты новой догружаются под экраном загрузки. */
  goto(scene: string, params?: unknown): Promise<void>;
  pause(): void;
  resume(): void;
  isPaused(): boolean;
  /**
   * Аварийный доступ к Pixi Application (renderer.extract, generateTexture и т.п.).
   * НЕ использовать app.stage и app.ticker — для этого есть scene.root и update().
   */
  readonly app: Application;
}
