import { create } from 'zustand';
import { START_LIVES } from './logic/rules';

/**
 * Мост между сценами (Pixi) и UI (React).
 * Сцены пишут через useBunnyCatch.getState().action(), React читает через useBunnyCatch(selector).
 * Здесь только то, что нужно показать в UI или пережить смену сцены, — не позиции спрайтов.
 */
interface BunnyCatchState {
  score: number;
  lives: number;
  best: number;
  startRun(): void;
  catchBunny(): void;
  missBunny(): void;
  setBest(best: number): void;
}

export const useBunnyCatch = create<BunnyCatchState>()((set) => ({
  score: 0,
  lives: START_LIVES,
  best: 0,
  startRun: () => set({ score: 0, lives: START_LIVES }),
  catchBunny: () => set((s) => ({ score: s.score + 1 })),
  missBunny: () => set((s) => ({ lives: Math.max(0, s.lives - 1) })),
  setBest: (best) => set({ best }),
}));
