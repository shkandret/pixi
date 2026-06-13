import type { Gem } from './Gem'
import type { LevelConfig } from '../config'

export interface BoardMoveInfo {
  gemId: string
  fromRow: number
  fromCol: number
  toRow: number
  toCol: number
}

export interface BoardSpawnInfo {
  id: string
  type: number
  fromRow: number
  toRow: number
  col: number
}

export class Board {
  public rows: number
  public cols: number
  public gemTypesCount: number
  public grid: (Gem | null)[][]
  private idCounter: number = 0

  constructor(config: LevelConfig) {
    this.rows = config.rows
    this.cols = config.cols
    this.gemTypesCount = config.gemTypesCount
    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(null))
    this.generate(config.initialLayout)
  }

  private generateId(): string {
    this.idCounter++
    return `gem_${this.idCounter}_${Math.random().toString(36).substring(2, 9)}`
  }

  public generate(initialLayout?: number[][]) {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (initialLayout && initialLayout[r] && initialLayout[r][c] !== undefined && initialLayout[r][c] !== 0) {
          this.grid[r][c] = {
            id: this.generateId(),
            type: initialLayout[r][c],
            row: r,
            col: c
          }
        } else {
          const validTypes: number[] = []
          for (let type = 1; type <= this.gemTypesCount; type++) {
            const wouldMatchHorizontal = c >= 2 &&
              this.grid[r][c - 1]?.type === type &&
              this.grid[r][c - 2]?.type === type
            const wouldMatchVertical = r >= 2 &&
              this.grid[r - 1][c]?.type === type &&
              this.grid[r - 2][c]?.type === type

            if (!wouldMatchHorizontal && !wouldMatchVertical) {
              validTypes.push(type)
            }
          }

          const chosenType = validTypes.length > 0
            ? validTypes[Math.floor(Math.random() * validTypes.length)]
            : Math.floor(Math.random() * this.gemTypesCount) + 1

          this.grid[r][c] = {
            id: this.generateId(),
            type: chosenType,
            row: r,
            col: c
          }
        }
      }
    }
  }

  public getGem(row: number, col: number): Gem | null {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return null
    return this.grid[row][col]
  }

  public swapGems(r1: number, c1: number, r2: number, c2: number) {
    const gem1 = this.grid[r1][c1]
    const gem2 = this.grid[r2][c2]
    if (!gem1 || !gem2) return

    this.grid[r1][c1] = gem2
    this.grid[r2][c2] = gem1

    gem1.row = r2
    gem1.col = c2
    gem2.row = r1
    gem2.col = c1
  }

  public findMatches(): Gem[] {
    const matchedGems = new Set<Gem>()

    for (let r = 0; r < this.rows; r++) {
      let matchCount = 1
      let matchType = -1
      let startCol = 0

      for (let c = 0; c < this.cols; c++) {
        const gem = this.grid[r][c]
        const type = gem ? gem.type : -2

        if (type === matchType && type !== -2) {
          matchCount++
        } else {
          if (matchCount >= 3) {
            for (let i = startCol; i < c; i++) {
              const matchedGem = this.grid[r][i]
              if (matchedGem) matchedGems.add(matchedGem)
            }
          }
          matchType = type
          matchCount = 1
          startCol = c
        }
      }
      if (matchCount >= 3) {
        for (let i = startCol; i < this.cols; i++) {
          const matchedGem = this.grid[r][i]
          if (matchedGem) matchedGems.add(matchedGem)
        }
      }
    }

    for (let c = 0; c < this.cols; c++) {
      let matchCount = 1
      let matchType = -1
      let startRow = 0

      for (let r = 0; r < this.rows; r++) {
        const gem = this.grid[r][c]
        const type = gem ? gem.type : -2

        if (type === matchType && type !== -2) {
          matchCount++
        } else {
          if (matchCount >= 3) {
            for (let i = startRow; i < r; i++) {
              const matchedGem = this.grid[i][c]
              if (matchedGem) matchedGems.add(matchedGem)
            }
          }
          matchType = type
          matchCount = 1
          startRow = r
        }
      }
      if (matchCount >= 3) {
        for (let i = startRow; i < this.rows; i++) {
          const matchedGem = this.grid[i][c]
          if (matchedGem) matchedGems.add(matchedGem)
        }
      }
    }

    return Array.from(matchedGems)
  }

  public removeGems(gems: Gem[]) {
    for (const gem of gems) {
      this.grid[gem.row][gem.col] = null
    }
  }

  public applyGravityAndFill(): { moves: BoardMoveInfo[]; spawns: BoardSpawnInfo[] } {
    const moves: BoardMoveInfo[] = []
    const spawns: BoardSpawnInfo[] = []

    for (let c = 0; c < this.cols; c++) {
      let writeRow = this.rows - 1
      for (let r = this.rows - 1; r >= 0; r--) {
        const gem = this.grid[r][c]
        if (gem !== null) {
          if (r !== writeRow) {
            const fromRow = r
            this.grid[writeRow][c] = gem
            gem.row = writeRow
            this.grid[r][c] = null

            moves.push({
              gemId: gem.id,
              fromRow,
              fromCol: c,
              toRow: writeRow,
              toCol: c
            })
          }
          writeRow--
        }
      }

      let spawnOffset = -1
      for (let r = writeRow; r >= 0; r--) {
        const newType = Math.floor(Math.random() * this.gemTypesCount) + 1
        const newId = this.generateId()
        const fromRow = spawnOffset

        const newGem: Gem = {
          id: newId,
          type: newType,
          row: r,
          col: c
        }

        this.grid[r][c] = newGem
        spawns.push({
          id: newId,
          type: newType,
          fromRow,
          toRow: r,
          col: c
        })

        spawnOffset--
      }
    }

    return { moves, spawns }
  }

  public hasPossibleMoves(): boolean {
    const directions = [
      [0, 1],
      [1, 0],
    ]

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const gem = this.grid[r][c]
        if (!gem) continue

        for (const [dr, dc] of directions) {
          const nr = r + dr
          const nc = c + dc

          if (nr < this.rows && nc < this.cols) {
            const other = this.grid[nr][nc]
            if (other) {
              this.swapGems(r, c, nr, nc)
              const matches = this.findMatches()
              this.swapGems(r, c, nr, nc)

              if (matches.length > 0) {
                return true
              }
            }
          }
        }
      }
    }
    return false
  }
}
