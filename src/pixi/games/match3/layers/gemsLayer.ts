import { Container, Application } from 'pixi.js'
import { GemView } from '../entities/GemView'
import { GAME_SETTINGS } from '../config'

/**
 * Container layer that holds and manages all visual GemViews.
 */
export class GemsLayer extends Container {
  private app: Application
  private gemViewsMap = new Map<string, GemView>()

  constructor(app: Application) {
    super()
    this.app = app
  }

  public getGemView(id: string): GemView | undefined {
    return this.gemViewsMap.get(id)
  }

  /**
   * Spawns a new gem view at a starting row (can be negative for dropping in).
   */
  public spawnGem(id: string, type: number, _targetRow: number, col: number, startRow: number): GemView {
    const cellSize = GAME_SETTINGS.cellSize
    const halfCell = cellSize / 2

    const gemView = new GemView(id, type, this.app)
    gemView.x = col * cellSize + halfCell
    gemView.y = startRow * cellSize + halfCell
    
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
    const cellSize = GAME_SETTINGS.cellSize
    const col = Math.floor(x / cellSize)
    const row = Math.floor(y / cellSize)
    return { row, col }
  }

  /**
   * Converts board grid coordinates to local screen position (x, y) centered on the cell.
   */
  public getScreenCoords(row: number, col: number): { x: number; y: number } {
    const cellSize = GAME_SETTINGS.cellSize
    const halfCell = cellSize / 2
    return {
      x: col * cellSize + halfCell,
      y: row * cellSize + halfCell,
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
