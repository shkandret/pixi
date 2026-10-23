'use client'

import * as PIXI from 'pixi.js'
import { assets } from './assets'

export const BunnyRotate = async (app: PIXI.Application) => {

  await PIXI.Assets.load(assets)

  // --
  const container = new PIXI.Container();
  app.stage.addChild(container)

  for (let i = 0; i < 25; i++) {
    const bunny = PIXI.Sprite.from('bunny-bunny')

    bunny.x = (i % 5) * 40;
    bunny.y = Math.floor(i / 5) * 40;
    container.addChild(bunny);
  }

  // Move the container to the center
  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;

  // Center the bunny sprites in local container coordinates
  container.pivot.x = container.width / 2;
  container.pivot.y = container.height / 2;

  // Listen for animate update
  app.ticker.add((time) => {
    // Continuously rotate the container!
    // * use delta to create frame-independent transform *
    container.rotation -= 0.01 * time.deltaTime;
  });

  // return <div id="pixi-container" />
}