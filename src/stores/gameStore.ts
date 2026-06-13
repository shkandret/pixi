import { create } from 'zustand'

export interface GameState {
  score: number
  highScore: number
  level: number
  movesLeft: number
  targetScore: number
  isGameOver: boolean
  isGameWin: boolean
  isPlaying: boolean
  isPaused: boolean
  restartEpoch: number

  setScore: (score: number) => void
  addScore: (delta: number) => void
  useMove: () => void
  initLevelState: (level: number, movesLimit: number, targetScore: number) => void
  setIsPlaying: (isPlaying: boolean) => void
  setIsPaused: (isPaused: boolean) => void
  setGameWin: (isWin: boolean) => void
  setGameOver: (isOver: boolean) => void
  reset: () => void
}

const initialState = {
  score: 0,
  highScore: 0,
  level: 1,
  movesLeft: 20,
  targetScore: 1000,
  isGameOver: false,
  isGameWin: false,
  isPlaying: true,
  isPaused: false,
  restartEpoch: 0,
}

export const useGameStore = create<GameState>()((set) => ({
  ...initialState,

  setScore: (score) => set((s) => {
    const newHighScore = score > s.highScore ? score : s.highScore
    return { score, highScore: newHighScore }
  }),
  addScore: (delta) => set((s) => {
    const newScore = s.score + delta
    const newHighScore = newScore > s.highScore ? newScore : s.highScore
    return {
      score: newScore,
      highScore: newHighScore
    }
  }),
  useMove: () => set((s) => {
    if (s.targetScore === Infinity) return {}
    const remaining = Math.max(0, s.movesLeft - 1)
    return {
      movesLeft: remaining
    }
  }),
  initLevelState: (level, movesLimit, targetScore) => set((s) => ({
    level,
    movesLeft: movesLimit,
    targetScore,
    score: 0,
    isGameOver: false,
    isGameWin: false,
    isPlaying: true,
    isPaused: false,
    restartEpoch: s.restartEpoch + 1
  })),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsPaused: (isPaused) => set({ isPaused }),
  setGameWin: (isGameWin) => set({ isGameWin }),
  setGameOver: (isGameOver) => set({ isGameOver }),
  reset: () => set((s) => ({
    ...initialState,
    highScore: s.highScore,
    restartEpoch: s.restartEpoch + 1
  })),
}))
