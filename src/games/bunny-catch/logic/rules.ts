// Правила и баланс. Чистые функции без Pixi и React: их легко тестировать и крутить цифры.

export const START_LIVES = 3;

/** Секунд между появлениями кроликов. Чем выше счёт, тем чаще. */
export function spawnInterval(score: number): number {
  return Math.max(0.35, 1.1 - score * 0.025);
}

/** Скорость падения в единицах мира в секунду. */
export function fallSpeed(score: number): number {
  return 220 + score * 10 + Math.random() * 60;
}
