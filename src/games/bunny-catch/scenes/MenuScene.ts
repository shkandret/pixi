import { Rectangle, Sprite, Text } from 'pixi.js';
import { Scene, type ViewportSize } from '@/engine';
import { useBunnyCatch } from '../store';

export interface MenuParams {
  lastScore?: number;
}

export class MenuScene extends Scene<MenuParams | undefined> {
  readonly bundles = ['menu'];

  private carrot!: Sprite;
  private title!: Text;
  private hint!: Text;
  private time = 0;
  private leaving = false;

  enter(params?: MenuParams): void {
    const { best } = useBunnyCatch.getState();
    const result = params?.lastScore !== undefined ? `Счёт: ${params.lastScore}   ·   ` : '';

    this.carrot = new Sprite(this.ctx.assets.texture('carrot'));
    this.carrot.anchor.set(0.5);
    this.title = new Text({
      text: 'Bunny Catch',
      style: { fill: 0xffffff, fontSize: 72, fontWeight: '800', fontFamily: 'system-ui, sans-serif' },
    });
    this.title.anchor.set(0.5);
    this.hint = new Text({
      text: `${result}Рекорд: ${best}\n\nТапни или нажми пробел`,
      style: { fill: 0xd6ecff, fontSize: 32, align: 'center', fontFamily: 'system-ui, sans-serif' },
    });
    this.hint.anchor.set(0.5, 0);
    this.root.addChild(this.carrot, this.title, this.hint);

    // Тап по любому месту экрана. hitArea задаём в resize(), т.к. он зависит от размера.
    this.root.eventMode = 'static';
    this.root.cursor = 'pointer';
    this.root.on('pointertap', () => this.start());
  }

  update(dt: number): void {
    this.time += dt;
    this.carrot.y = this.ctx.viewport.height * 0.3 + Math.sin(this.time * 2) * 12;
    this.carrot.rotation = Math.sin(this.time * 1.3) * 0.1;
    if (this.ctx.keyboard.justPressed('Space') || this.ctx.keyboard.justPressed('Enter')) this.start();
  }

  resize({ width, height }: ViewportSize): void {
    this.root.hitArea = new Rectangle(0, 0, width, height);
    this.carrot.x = width / 2;
    this.title.position.set(width / 2, height * 0.48);
    this.hint.position.set(width / 2, height * 0.56);
  }

  private start(): void {
    if (this.leaving) return;
    this.leaving = true;
    void this.ctx.goto('play');
  }
}
