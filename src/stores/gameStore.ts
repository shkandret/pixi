import { create } from 'zustand'

/**
 * Общий стор для обмена данными между React UI и Pixi-сценами.
 *
 * React-компоненты используют хук:
 *   const score = useGameStore((s) => s.score)
 *
 * Pixi-сцены (вне React) используют напрямую:
 *   const { score, setScore } = useGameStore.getState()
 *   useGameStore.subscribe((state) => { ... })
 */

interface GameState {
  // --- State ---
  score: number
  lives: number
  isPlaying: boolean
  isPaused: boolean

  // --- Actions ---
  setScore: (score: number) => void
  addScore: (delta: number) => void
  setLives: (lives: number) => void
  setIsPlaying: (isPlaying: boolean) => void
  setIsPaused: (isPaused: boolean) => void
  reset: () => void
}

const initialState = {
  score: 0,
  lives: 3,
  isPlaying: false,
  isPaused: false,
}

export const useGameStore = create<GameState>()((set) => ({
  ...initialState,

  setScore: (score) => set({ score }),
  addScore: (delta) => set((s) => ({ score: s.score + delta })),
  setLives: (lives) => set({ lives }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsPaused: (isPaused) => set({ isPaused }),
  reset: () => set(initialState),
}))
