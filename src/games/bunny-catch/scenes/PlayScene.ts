import { Container, Graphics, Sprite } from 'pixi.js';
import { Scene, type ViewportSize } from '@/engine';
import { fallSpeed, spawnInterval } from '../logic/rules';
import { useBunnyCatch } from '../store';

interface FallingBunny {
  sprite: Sprite;
  speed: number;
  spin: number;
}

const MARGIN = 60;

export class PlayScene extends Scene {
  readonly bundles = ['game'];

  private readonly field = new Graphics();
  private readonly layer = new Container();
  private bunnies: FallingBunny[] = [];
  private spawnTimer = 0;
  private over = false;

  enter(): void {
    useBunnyCatch.getState().startRun();
    this.root.addChild(this.field, this.layer);
  }

  /** Симуляция — в fixedUpdate: одинаково на 60 и 144 Гц. */
  fixedUpdate(dt: number): void {
    if (this.over) return;
    const store = useBunnyCatch.getState();

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawn(store.score);
      this.spawnTimer = spawnInterval(store.score);
    }

    const bottom = this.ctx.viewport.height + MARGIN;
    for (let i = this.bunnies.length - 1; i >= 0; i--) {
      const bunny = this.bunnies[i];
      bunny.sprite.y += bunny.speed * dt;
      if (bunny.sprite.y > bottom) {
        this.remove(bunny);
        store.missBunny();
        if (useBunnyCatch.getState().lives === 0) return this.gameOver();
      }
    }
  }

  /** Чисто визуальное — в update. */
  update(dt: number): void {
    for (const bunny of this.bunnies) bunny.sprite.rotation += bunny.spin * dt;
  }

  resize({ width, height }: ViewportSize): void {
    // Перерисовка Graphics допустима здесь: resize вызывается редко, а не каждый кадр.
    this.field.clear().rect(0, 0, width, height).fill(0x1d6fa5);
  }

  /** Свернули приложение посреди раунда — ставим паузу, игрок вернётся в меню паузы. */
  onHidden(): void {
    this.ctx.pause();
  }

  private spawn(score: number): void {
    const sprite = new Sprite(this.ctx.assets.texture('bunny'));
    sprite.anchor.set(0.5);
    sprite.scale.set(2.2);
    sprite.position.set(MARGIN + Math.random() * (this.ctx.viewport.width - MARGIN * 2), -MARGIN);
    sprite.eventMode = 'static';
    sprite.cursor = 'pointer';

    const bunny: FallingBunny = { sprite, speed: fallSpeed(score), spin: (Math.random() - 0.5) * 3 };
    sprite.on('pointerdown', () => {
      if (this.over || this.ctx.isPaused()) return;
      this.remove(bunny);
      useBunnyCatch.getState().catchBunny();
    });

    this.layer.addChild(sprite);
    this.bunnies.push(bunny);
  }

  private remove(bunny: FallingBunny): void {
    this.bunnies = this.bunnies.filter((b) => b !== bunny);
    // destroy() снимает и обработчики событий. Текстуру не трогаем — она принадлежит AssetService.
    bunny.sprite.destroy();
  }

  private gameOver(): void {
    this.over = true;
    const { score, best, setBest } = useBunnyCatch.getState();
    if (score > best) {
      setBest(score);
      void this.ctx.storage.save('best', score);
    }
    void this.ctx.goto('menu', { lastScore: score });
  }
}
