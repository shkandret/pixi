import type { GameDefinition } from '@/engine';
import { manifest } from './assets';
import { PondScene } from './scenes/PondScene';

/** Минимальная «игра»: одна сцена, тяжёлые удалённые ассеты, режим expand, без UI. */
const fishpond: GameDefinition = {
  id: 'fishpond',
  title: 'Fish Pond',
  viewport: { width: 1280, height: 720, mode: 'expand' },
  background: 0x1099bb,
  assets: manifest,
  scenes: { pond: () => new PondScene() },
  initialScene: 'pond',
};

export default fishpond;
