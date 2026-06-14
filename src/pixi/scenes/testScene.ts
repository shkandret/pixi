import { Container, Graphics, Text } from 'pixi.js'

import type { SceneDescriptor } from './types'

export const testScene: SceneDescriptor = {
  setup({ app }) {
    const root = new Container()

    const bg = new Graphics()
      .roundRect(0, 0, app.screen.width, app.screen.height, 0)
      .fill({ color: 0x1a1a2e })
    root.addChild(bg)

    const square = new Graphics()
      .roundRect(-40, -40, 80, 80, 8)
      .fill({ color: 0xaa3bff })
    square.x = app.screen.width / 2
    square.y = app.screen.height / 2
    root.addChild(square)

    const label = new Text({
      text: 'PixiJS работает!',
      style: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 24,
        fill: 0xffffff,
        align: 'center',
      },
    })
    label.anchor.set(0.5)
    label.x = app.screen.width / 2
    label.y = app.screen.height / 2 + 80
    root.addChild(label)

    app.ticker.add((ticker) => {
      square.rotation += 0.02 * ticker.deltaTime
    })

    return root
  },
}
