import { Container, Application } from 'pixi.js'
import { GemView } from '../entities/GemView'

/**
 * Container layer that holds and manages all visual GemViews.
 */
export class GemsLayer extends Container {
  private app: Application
  private cellSize: number
  private gemViewsMap = new Map<string, GemView>()

  constructor(app: Application, cellSize: number) {
    super()
    this.app = app
    this.cellSize = cellSize
  }

  public getGemView(id: string): GemView | undefined {
    return this.gemViewsMap.get(id)
  }

  /**
   * Spawns a new gem view at a starting row (can be negative for dropping in).
   */
  public spawnGem(id: string, type: number, _targetRow: number, col: number, startRow: number): GemView {
    const halfCell = this.cellSize / 2

    const gemView = new GemView(id, type, this.app, this.cellSize)
    gemView.x = col * this.cellSize + halfCell
    gemView.y = startRow * this.cellSize + halfCell

    this.addChild(gemView)
    this.gemViewsMap.set(id, gemView)

    return gemView
  }

  /**
   * Deregisters a gem view (the view will destroy itself at the end of its destruction animation).
   */
  public removeGem(id: string) {
    const gemView = this.gemViewsMap.get(id)
    if (gemView) {
      gemView.cleanup()
      this.gemViewsMap.delete(id)
    }
  }

  /**
   * Converts local coordinates inside this layer to board grid coordinates.
   */
  public getGridCoords(x: number, y: number): { row: number; col: number } | null {
    const col = Math.floor(x / this.cellSize)
    const row = Math.floor(y / this.cellSize)
    return { row, col }
  }

  /**
   * Converts board grid coordinates to local screen position (x, y) centered on the cell.
   */
  public getScreenCoords(row: number, col: number): { x: number; y: number } {
    const halfCell = this.cellSize / 2
    return {
      x: col * this.cellSize + halfCell,
      y: row * this.cellSize + halfCell,
    }
  }

  /**
   * Cleans up all active gem views.
   */
  public clearAll() {
    this.gemViewsMap.forEach((gemView) => {
      gemView.cleanup()
      gemView.destroy({ children: true })
    })
    this.gemViewsMap.clear()
    this.removeChildren()
  }
}
