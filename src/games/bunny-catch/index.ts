import type { GameDefinition } from '@/engine';
import { manifest } from './assets';
import { MenuScene } from './scenes/MenuScene';
import { PlayScene } from './scenes/PlayScene';
import { useBunnyCatch } from './store';
import { BunnyHud } from './ui/BunnyHud';

/**
 * Эталонная игра: показывает все слои архитектуры.
 * Портретная, режим fit (как suika/plinko): на широком экране по бокам поля.
 */
const bunnyCatch: GameDefinition = {
  id: 'bunny-catch',
  title: 'Bunny Catch',
  viewport: { width: 720, height: 1280, mode: 'fit' },
  background: 0x0b1d2b,
  assets: manifest,
  scenes: {
    menu: () => new MenuScene(),
    play: () => new PlayScene(),
  },
  initialScene: 'menu',
  // Пока игрок смотрит на меню, геймплейные ассеты уже качаются — переход в игру мгновенный.
  backgroundBundles: ['game'],
  ui: BunnyHud,
  async setup(ctx) {
    const best = await ctx.storage.load('best', 0);
    useBunnyCatch.setState({ best });
  },
};

export default bunnyCatch;
