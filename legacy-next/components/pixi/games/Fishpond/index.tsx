// 'use client'

// import * as PIXI from 'pixi.js';
// import { useEffect, useRef } from 'react';

// // Импорты модулей
// import { addBackground } from './modules/addBackground';
// import { addFishes, animateFishes } from './modules/addFishes';
// import { addWaterOverlay, animateWaterOverlay } from './modules/addWaterOverlay';
// import { addDisplacementEffect } from './modules/addDisplacementEffect';
// import { assets } from './assets';

// const fishes: PIXI.Sprite[] = [];

// export const Fishpond = () => {
//     const tickerRef = useRef<PIXI.Ticker | null>(null);

//     useEffect(() => {
//         const setupPixi = async () => {
//             const container = document.getElementById('pixi-container');
//             if (!container) return

//             // const rect = container.getBoundingClientRect()
//             const app = new PIXI.Application();
//             // await app.init({ width: rect.width, height: rect.height });
//             await app.init({ width: 800, height: 600 });

//             await PIXI.Assets.load(assets);

//             // Инициализация сцены
//             addBackground(app);
//             addFishes(app, fishes);
//             addWaterOverlay(app);
//             addDisplacementEffect(app);

//             // Анимация
//             tickerRef.current = app.ticker;
//             app.ticker.add((time) => {
//                 animateFishes(app, fishes, time);
//                 animateWaterOverlay(app, time);
//             });

//             // Вставка canvas в div
//             container.appendChild(app.canvas);
//         };

//         setupPixi();

//         return () => {
//             if (tickerRef.current) {
//                 tickerRef.current.stop();
//             }
//         };
//     }, []);

//     return (
//         // <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
//         //     <div style={{
//         //         height: '150px',
//         //         background: 'red',
//         //         opacity: 0.2,
//         //         flexShrink: 0,
//         //     }}>TOP PANEL</div>

//         // <div id="pixi-container" style={{
//         //     overflow: 'hidden',
//         //     width: '100%',
//         //     height: '100%',
//         // }} />
//         <div id="pixi-container" />

//         //     <div style={{
//         //         height: '200px',
//         //         background: 'red',
//         //         opacity: 0.2,
//         //         flexShrink: 0,
//         //     }}>BOTTOM PANEL</div>
//         // </div>
//     );
// };

'use client'

import * as PIXI from 'pixi.js';

// Импорты модулей
import { addBackground } from './modules/addBackground';
import { addFishes, animateFishes } from './modules/addFishes';
import { addWaterOverlay, animateWaterOverlay } from './modules/addWaterOverlay';
import { addDisplacementEffect } from './modules/addDisplacementEffect';
import { assets } from './assets';

const fishes: PIXI.Sprite[] = [];

export const Fishpond = async (app: PIXI.Application) => {
    await PIXI.Assets.load(assets);
    // await app.assets.load(assets)
    // await app.loader.add

    addBackground(app)
    addFishes(app, fishes)
    addWaterOverlay(app)
    addDisplacementEffect(app)

    app.ticker.add((time) => {
        animateFishes(app, fishes)
        animateWaterOverlay(time)
    })
}