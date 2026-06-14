import { Container, Graphics } from 'pixi.js'

export function createBoardLayer(rows: number, cols: number, cellSize: number): Container {
  const container = new Container()
  const halfCell = cellSize / 2

  const frame = new Graphics()
  const boardWidth = cols * cellSize
  const boardHeight = rows * cellSize
  frame.roundRect(-6, -6, boardWidth + 12, boardHeight + 12, 16)
  frame.fill({ color: 0x131326 })
  frame.stroke({ color: 0xaa3bff, width: 2, alpha: 0.3 })
  container.addChild(frame)

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tile = new Graphics()

      const isEven = (r + c) % 2 === 0
      const color = isEven ? 0x21213d : 0x1b1b33

      const padding = 3
      const tileSize = cellSize - padding * 2

      tile.roundRect(-tileSize / 2, -tileSize / 2, tileSize, tileSize, 12)
      tile.fill({ color })
      tile.stroke({ color: 0x2e2e54, width: 1 })

      tile.x = c * cellSize + halfCell
      tile.y = r * cellSize + halfCell

      container.addChild(tile)
    }
  }

  return container
}
