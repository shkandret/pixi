import { Graphics, Text } from 'pixi.js';
import type { ViewportSize } from '../viewport/Viewport';
import { LoadingScene } from './Scene';

const BAR_WIDTH = 360;
const BAR_HEIGHT = 12;

/** Экран загрузки по умолчанию. Игра может подменить его через GameDefinition.loadingScene. */
export class DefaultLoadingScene extends LoadingScene {
  private readonly track = new Graphics();
  private readonly fill = new Graphics();
  private readonly label = new Text({
    text: 'Загрузка…',
    style: { fill: 0xffffff, fontSize: 24, fontFamily: 'system-ui, sans-serif' },
  });
  private shown = 0;
  private target = 0;

  enter(): void {
    // Graphics рисуем один раз, а прогресс показываем через scale — перерисовка геометрии каждый кадр дорогая.
    this.track.rect(0, 0, BAR_WIDTH, BAR_HEIGHT).fill({ color: 0xffffff, alpha: 0.15 });
    this.fill.rect(0, 0, BAR_WIDTH, BAR_HEIGHT).fill(0xffffff);
    this.fill.scale.x = 0;
    this.label.anchor.set(0.5, 1);
    this.root.addChild(this.track, this.fill, this.label);
  }

  setProgress(progress: number): void {
    this.target = progress;
    const text = `Загрузка… ${Math.round(progress * 100)}%`;
    if (this.label.text !== text) this.label.text = text;
  }

  update(dt: number): void {
    // Плавно догоняем реальный прогресс, чтобы полоса не дёргалась.
    this.shown += (this.target - this.shown) * Math.min(1, dt * 12);
    this.fill.scale.x = this.shown;
  }

  resize({ width, height }: ViewportSize): void {
    this.track.position.set((width - BAR_WIDTH) / 2, height / 2);
    this.fill.position.copyFrom(this.track.position);
    this.label.position.set(width / 2, height / 2 - 16);
  }
}
