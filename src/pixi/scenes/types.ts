import { Application } from 'pixi.js'
import type { Container } from 'pixi.js'

/**
 * Контекст, который получает каждая сцена при инициализации.
 * Через него сцена имеет доступ к Pixi Application.
 */
export interface SceneContext {
  app: Application
}

/**
 * Функция инициализации сцены.
 * Получает контекст, возвращает корневой Container сцены.
 */
export type SceneSetup = (ctx: SceneContext) => Container | Promise<Container>

/**
 * Опциональная функция очистки сцены.
 * Вызывается перед уничтожением Application.
 */
export type SceneCleanup = (ctx: SceneContext) => void

/**
 * Описание сцены — объект с функциями setup и опциональной cleanup.
 */
export interface SceneDescriptor {
  setup: SceneSetup
  cleanup?: SceneCleanup
}
