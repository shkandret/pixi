// Публичный API движка. Игры импортируют ТОЛЬКО отсюда: `import { Scene } from '@/engine'`.
export { Engine } from './Engine';
export type { EngineState } from './engineStore';
export type { AssetService } from './assets/AssetService';
export type { Keyboard } from './input/Keyboard';
export type { GameStorage } from './platform/GameStorage';
export type { Platform, PlatformKind } from './platform/Platform';
export { DefaultLoadingScene } from './scene/DefaultLoadingScene';
export { LoadingScene, Scene } from './scene/Scene';
export type { ViewportSize } from './viewport/Viewport';
export type { GameContext, GameDefinition, SceneFactory, ViewportConfig, ViewportMode } from './types';
export { GameHost } from './react/GameHost';
export { useEngine, useEngineState } from './react/EngineContext';
