import * as PIXI from 'pixi.js'

// Reference to the water overlay.
let overlay: PIXI.TilingSprite;

export function addWaterOverlay(app: PIXI.Application) {
    // Create a water texture object.
    const texture = PIXI.Texture.from('fishpond-overlay');

    // Create a tiling sprite with the water texture and specify the dimensions.
    overlay = new PIXI.TilingSprite({
        texture,
        width: app.screen.width,
        height: app.screen.height,
    });

    // Add the overlay to the stage.
    app.stage.addChild(overlay);
}

export function animateWaterOverlay(time) {
    // Extract the delta time from the Ticker object.
    const delta = time.deltaTime;

    // Animate the overlay.
    overlay.tilePosition.x -= delta;
    overlay.tilePosition.y -= delta;
}
