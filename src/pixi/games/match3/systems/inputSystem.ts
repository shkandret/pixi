import { FederatedPointerEvent } from 'pixi.js'
import type { Board } from '../entities/Board'
import type { GemsLayer } from '../layers/gemsLayer'

export class InputSystem {
  private board: Board
  private gemsLayer: GemsLayer
  private onSwapRequest: (r1: number, c1: number, r2: number, c2: number) => void

  private selectedRow: number = -1
  private selectedCol: number = -1
  private isDragging: boolean = false
  private dragStartPos: { x: number; y: number } | null = null
  private dragStartGrid: { row: number; col: number } | null = null

  private enabled: boolean = true
  private dragThreshold: number = 25

  constructor(
    board: Board,
    gemsLayer: GemsLayer,
    onSwapRequest: (r1: number, c1: number, r2: number, c2: number) => void
  ) {
    this.board = board
    this.gemsLayer = gemsLayer
    this.onSwapRequest = onSwapRequest

    this.setupEvents()
  }

  private setupEvents() {
    this.gemsLayer.eventMode = 'static'
    this.gemsLayer.on('pointerdown', this.onPointerDown, this)
    this.gemsLayer.on('pointermove', this.onPointerMove, this)
    this.gemsLayer.on('pointerup', this.onPointerUp, this)
    this.gemsLayer.on('pointerupoutside', this.onPointerUp, this)
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled
    if (!enabled) {
      this.clearSelection()
      this.resetDrag()
    }
  }

  private onPointerDown(e: FederatedPointerEvent) {
    if (!this.enabled) return

    const localPos = e.getLocalPosition(this.gemsLayer)
    const grid = this.gemsLayer.getGridCoords(localPos.x, localPos.y)

    if (!grid) return
    const { row, col } = grid

    const gem = this.board.getGem(row, col)
    if (!gem) return

    this.isDragging = true
    this.dragStartPos = { x: localPos.x, y: localPos.y }
    this.dragStartGrid = { row, col }

    if (this.selectedRow === -1 && this.selectedCol === -1) {
      this.selectGem(row, col)
    } else {
      const isAdjacent = Math.abs(this.selectedRow - row) + Math.abs(this.selectedCol - col) === 1

      if (isAdjacent) {
        const r1 = this.selectedRow
        const c1 = this.selectedCol
        this.clearSelection()
        this.onSwapRequest(r1, c1, row, col)
      } else {
        this.selectGem(row, col)
      }
    }
  }

  private onPointerMove(e: FederatedPointerEvent) {
    if (!this.enabled || !this.isDragging || !this.dragStartPos || !this.dragStartGrid) return

    const localPos = e.getLocalPosition(this.gemsLayer)
    const dx = localPos.x - this.dragStartPos.x
    const dy = localPos.y - this.dragStartPos.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist >= this.dragThreshold) {
      let targetRow = this.dragStartGrid.row
      let targetCol = this.dragStartGrid.col

      if (Math.abs(dx) > Math.abs(dy)) {
        targetCol += dx > 0 ? 1 : -1
      } else {
        targetRow += dy > 0 ? 1 : -1
      }

      if (
        targetRow >= 0 &&
        targetRow < this.board.rows &&
        targetCol >= 0 &&
        targetCol < this.board.cols
      ) {
        const r1 = this.dragStartGrid.row
        const c1 = this.dragStartGrid.col
        this.clearSelection()
        this.resetDrag()
        this.onSwapRequest(r1, c1, targetRow, targetCol)
      } else {
        this.resetDrag()
      }
    }
  }

  private onPointerUp() {
    this.resetDrag()
  }

  private selectGem(row: number, col: number) {
    this.clearSelection()

    this.selectedRow = row
    this.selectedCol = col

    const gem = this.board.getGem(row, col)
    if (gem) {
      const gemView = this.gemsLayer.getGemView(gem.id)
      gemView?.setSelected(true)
    }
  }

  private clearSelection() {
    if (this.selectedRow !== -1 && this.selectedCol !== -1) {
      const gem = this.board.getGem(this.selectedRow, this.selectedCol)
      if (gem) {
        const gemView = this.gemsLayer.getGemView(gem.id)
        gemView?.setSelected(false)
      }
    }
    this.selectedRow = -1
    this.selectedCol = -1
  }

  private resetDrag() {
    this.isDragging = false
    this.dragStartPos = null
    this.dragStartGrid = null
  }

  public cleanup() {
    this.gemsLayer.off('pointerdown', this.onPointerDown, this)
    this.gemsLayer.off('pointermove', this.onPointerMove, this)
    this.gemsLayer.off('pointerup', this.onPointerUp, this)
    this.gemsLayer.off('pointerupoutside', this.onPointerUp, this)
  }
}
