import type { AssetsManifest } from 'pixi.js';

const CDN = 'https://pixijs.com/assets/tutorials/fish-pond';

export const manifest: AssetsManifest = {
  bundles: [
    {
      name: 'pond',
      assets: [
        { alias: 'background', src: `${CDN}/pond_background.jpg` },
        { alias: 'fish1', src: `${CDN}/fish1.png` },
        { alias: 'fish2', src: `${CDN}/fish2.png` },
        { alias: 'fish3', src: `${CDN}/fish3.png` },
        { alias: 'fish4', src: `${CDN}/fish4.png` },
        { alias: 'fish5', src: `${CDN}/fish5.png` },
        { alias: 'overlay', src: `${CDN}/wave_overlay.png` },
        { alias: 'displacement', src: `${CDN}/displacement_map.png` },
      ],
    },
  ],
};
