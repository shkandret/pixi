export interface LevelConfig {
  id: number
  rows: number
  cols: number
  gemTypesCount: number // Number of different gem colors (max 6)
  movesLimit: number
  targetScore: number
  // Optional pre-configured layout.
  // 0 represents random gem, numbers 1-6 represent specific gem types.
  initialLayout?: number[][]
}

export interface GameSettings {
  animSpeed: number // Transition speed in ms
  fallSpeed: number // Falling animation duration in ms
  colors: number[] // Colors for gem types 1 to 6
}

/** Target board area in pixels — cells adapt to fill this */
export const BOARD_TARGET_SIZE = 600

/** Extra padding around the board for the PixiJS frame */
export const CANVAS_PADDING = 24

/** Fixed canvas dimensions */
export const CANVAS_SIZE = BOARD_TARGET_SIZE + CANVAS_PADDING

/** Computes adaptive cellSize so the board fills the target area */
export function computeCellSize(rows: number, cols: number): number {
  return Math.floor(Math.min(BOARD_TARGET_SIZE / cols, BOARD_TARGET_SIZE / rows))
}

export const GAME_SETTINGS: GameSettings = {
  animSpeed: 200,
  fallSpeed: 250,
  colors: [
    0xFF4B4B, // 1: Red
    0x3B82F6, // 2: Blue
    0x10B981, // 3: Green
    0xF59E0B, // 4: Yellow
    0x8B5CF6, // 5: Purple
    0xEC4899, // 6: Pink
  ]
}

export const LEVELS: Record<number, LevelConfig> = {
  0: {
    id: 0,
    rows: 8,
    cols: 8,
    gemTypesCount: 5,
    movesLimit: Infinity, // Infinite moves
    targetScore: Infinity, // Infinite target score
  },
  1: {
    id: 1,
    rows: 6,
    cols: 6,
    gemTypesCount: 4,
    movesLimit: 20,
    targetScore: 1000,
    // A nice symmetrical layout for demonstration
    initialLayout: [
      [1, 2, 1, 2, 1, 2],
      [2, 1, 2, 1, 2, 1],
      [3, 4, 3, 4, 3, 4],
      [4, 3, 4, 3, 4, 3],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ]
  },
  2: {
    id: 2,
    rows: 8,
    cols: 8,
    gemTypesCount: 5,
    movesLimit: 25,
    targetScore: 2000,
    // Random board generator will be used if initialLayout is not specified
  },
  3: {
    id: 3,
    rows: 7,
    cols: 9,
    gemTypesCount: 6,
    movesLimit: 30,
    targetScore: 3500,
  }
}
