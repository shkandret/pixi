import type { AssetsManifest } from 'pixi.js';

/**
 * Бандл = набор ассетов, нужных одной или нескольким сценам. Сцена объявляет свои бандлы в `bundles`,
 * движок грузит их перед enter() под экраном загрузки.
 *
 * alias пишем коротко ('bunny') — движок сам добавит неймспейс игры.
 * src: локальные файлы — из public/ относительным путём; удалённые — полным URL (CDN/бэкенд).
 */
export const manifest: AssetsManifest = {
  bundles: [
    {
      name: 'menu',
      assets: [{ alias: 'carrot', src: 'assets/bunny-catch/carrot.svg' }],
    },
    {
      name: 'game',
      assets: [{ alias: 'bunny', src: 'https://pixijs.com/assets/bunny.png' }],
    },
  ],
};
