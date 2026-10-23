import type { GameDefinition } from '@/engine';

/**
 * Все игры проекта. Ленивые импорты: код и ассеты игры попадают в отдельный чанк
 * и не скачиваются, пока игру не запустили.
 */
export const games = {
  'bunny-catch': () => import('./bunny-catch').then((m) => m.default),
  fishpond: () => import('./fishpond').then((m) => m.default),
} satisfies Record<string, () => Promise<GameDefinition>>;

export type GameId = keyof typeof games;

export const gameIds = Object.keys(games) as GameId[];

export function isGameId(id: string | null | undefined): id is GameId {
  return !!id && id in games;
}
