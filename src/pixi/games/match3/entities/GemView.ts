import { Container, Graphics, Application } from 'pixi.js'
import { GAME_SETTINGS } from '../config'

export class GemView extends Container {
  public id: string
  public type: number
  private app: Application
  private shadowGraphics: Graphics
  private gemGraphics: Graphics
  private highlightGraphics: Graphics
  private isSelected: boolean = false
  private pulseTick?: (ticker: any) => void
  private cellSize: number

  constructor(id: string, type: number, app: Application, cellSize: number) {
    super()
    this.id = id
    this.type = type
    this.app = app
    this.cellSize = cellSize

    this.shadowGraphics = new Graphics()
    this.gemGraphics = new Graphics()
    this.highlightGraphics = new Graphics()
    this.addChild(this.shadowGraphics)
    this.addChild(this.gemGraphics)
    this.addChild(this.highlightGraphics)

    this.draw()
  }

  private drawShape(g: Graphics, radius: number) {
    switch (this.type) {
      case 1:
        g.circle(0, 0, radius)
        break
      case 2:
        g.moveTo(0, -radius)
        g.lineTo(radius, 0)
        g.lineTo(0, radius)
        g.lineTo(-radius, 0)
        g.closePath()
        break
      case 3:
        g.roundRect(-radius, -radius, radius * 2, radius * 2, 8)
        break
      case 4:
        g.moveTo(0, -radius)
        g.lineTo(radius, radius * 0.8)
        g.lineTo(-radius, radius * 0.8)
        g.closePath()
        break
      case 5:
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3 - Math.PI / 2
          const x = radius * Math.cos(angle)
          const y = radius * Math.sin(angle)
          if (i === 0) g.moveTo(x, y)
          else g.lineTo(x, y)
        }
        g.closePath()
        break
      case 6:
      default:
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4 - Math.PI / 8
          const x = radius * Math.cos(angle)
          const y = radius * Math.sin(angle)
          if (i === 0) g.moveTo(x, y)
          else g.lineTo(x, y)
        }
        g.closePath()
        break
    }
  }

  private draw() {
    const size = this.cellSize
    const color = GAME_SETTINGS.colors[this.type - 1] || 0xFFFFFF
    const radius = size * 0.38

    this.shadowGraphics.clear()
    this.gemGraphics.clear()
    this.highlightGraphics.clear()

    this.shadowGraphics.x = 0
    this.shadowGraphics.y = 3
    this.drawShape(this.shadowGraphics, radius)
    this.shadowGraphics.fill({ color: 0x000000, alpha: 0.25 })

    this.gemGraphics.x = 0
    this.gemGraphics.y = 0
    this.drawShape(this.gemGraphics, radius)
    this.gemGraphics.fill({ color })

    this.highlightGraphics
      .circle(-radius * 0.3, -radius * 0.3, radius * 0.25)
      .fill({ color: 0xFFFFFF, alpha: 0.45 })
  }

  public animateMoveTo(tx: number, ty: number, durationMs: number): Promise<void> {
    return new Promise((resolve) => {
      const startX = this.x
      const startY = this.y
      const diffX = tx - startX
      const diffY = ty - startY
      let elapsed = 0

      const tick = (ticker: any) => {
        elapsed += ticker.deltaTime * (1000 / 60)
        const progress = Math.min(1, elapsed / durationMs)

        const ease = 1 - Math.pow(1 - progress, 3)

        this.x = startX + diffX * ease
        this.y = startY + diffY * ease

        if (progress >= 1) {
          this.app.ticker.remove(tick)
          this.x = tx
          this.y = ty
          resolve()
        }
      }

      this.app.ticker.add(tick)
    })
  }

  public animateSpawn(durationMs: number): Promise<void> {
    return new Promise((resolve) => {
      this.scale.set(0)
      let elapsed = 0

      const tick = (ticker: any) => {
        elapsed += ticker.deltaTime * (1000 / 60)
        const progress = Math.min(1, elapsed / durationMs)

        const c1 = 1.70158
        const c3 = c1 + 1
        const ease = 1 + c3 * Math.pow(progress - 1, 3) + c1 * Math.pow(progress - 1, 2)

        this.scale.set(Math.max(0, ease))

        if (progress >= 1) {
          this.app.ticker.remove(tick)
          this.scale.set(1)
          resolve()
        }
      }

      this.app.ticker.add(tick)
    })
  }

  public animateDestroy(durationMs: number): Promise<void> {
    return new Promise((resolve) => {
      const startScale = this.scale.x
      const startAlpha = this.alpha
      let elapsed = 0

      const tick = (ticker: any) => {
        elapsed += ticker.deltaTime * (1000 / 60)
        const progress = Math.min(1, elapsed / durationMs)

        const ease = Math.pow(progress, 3)

        this.scale.set(startScale * (1 - ease))
        this.alpha = startAlpha * (1 - ease)

        if (progress >= 1) {
          this.app.ticker.remove(tick)
          this.destroy({ children: true })
          resolve()
        }
      }

      this.app.ticker.add(tick)
    })
  }

  public setSelected(selected: boolean) {
    if (this.isSelected === selected) return
    this.isSelected = selected

    if (selected) {
      this.scale.set(1.1)
      let elapsed = 0

      this.pulseTick = (ticker) => {
        elapsed += ticker.deltaTime * 0.1
        const s = 1.1 + Math.sin(elapsed) * 0.05
        this.scale.set(s)
      }
      this.app.ticker.add(this.pulseTick)
    } else {
      if (this.pulseTick) {
        this.app.ticker.remove(this.pulseTick)
        this.pulseTick = undefined
      }
      this.scale.set(1)
    }
  }

  public cleanup() {
    if (this.pulseTick) {
      this.app.ticker.remove(this.pulseTick)
      this.pulseTick = undefined
    }
  }
}
