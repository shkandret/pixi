import { Container, DisplacementFilter, Sprite, TilingSprite } from 'pixi.js';
import { Scene, type ViewportSize } from '@/engine';

interface Fish {
  sprite: Sprite;
  direction: number;
  speed: number;
  turnSpeed: number;
}

const FISH_COUNT = 20;
const PADDING = 100;

/** Порт туториала Pixi «Fish Pond» на архитектуру сцен. Режим expand: пруд заполняет любой экран. */
export class PondScene extends Scene {
  readonly bundles = ['pond'];

  private background!: Sprite;
  private overlay!: TilingSprite;
  private readonly fishLayer = new Container();
  private fishes: Fish[] = [];

  enter(): void {
    const { assets, viewport } = this.ctx;

    this.background = new Sprite(assets.texture('background'));
    this.background.anchor.set(0.5);

    for (let i = 0; i < FISH_COUNT; i++) {
      const sprite = new Sprite(assets.texture(`fish${(i % 5) + 1}`));
      sprite.anchor.set(0.5);
      sprite.scale.set(0.5 + Math.random() * 0.2);
      sprite.position.set(Math.random() * viewport.width, Math.random() * viewport.height);
      this.fishLayer.addChild(sprite);
      this.fishes.push({
        sprite,
        direction: Math.random() * Math.PI * 2,
        speed: 120 + Math.random() * 120,
        turnSpeed: Math.random() - 0.8,
      });
    }

    this.overlay = new TilingSprite({ texture: assets.texture('overlay') });

    const displacement = new Sprite(assets.texture('displacement'));
    displacement.texture.source.addressMode = 'repeat';
    // Фильтр вешаем на root сцены, а не на app.stage — он уйдёт вместе со сценой.
    const filter = new DisplacementFilter({ sprite: displacement, scale: 50 });
    this.root.filters = [filter];
    // Спрайт карты смещения не в дереве root, поэтому сам он не уничтожится — регистрируем очистку.
    this.addDisposer(() => {
      filter.destroy();
      displacement.destroy();
    });

    this.root.addChild(this.background, this.fishLayer, this.overlay);
  }

  update(dt: number): void {
    const { width, height } = this.ctx.viewport;
    for (const fish of this.fishes) {
      fish.direction += fish.turnSpeed * 0.6 * dt;
      fish.sprite.x += Math.sin(fish.direction) * fish.speed * dt;
      fish.sprite.y += Math.cos(fish.direction) * fish.speed * dt;
      fish.sprite.rotation = -fish.direction - Math.PI / 2;

      if (fish.sprite.x < -PADDING) fish.sprite.x += width + PADDING * 2;
      if (fish.sprite.x > width + PADDING) fish.sprite.x -= width + PADDING * 2;
      if (fish.sprite.y < -PADDING) fish.sprite.y += height + PADDING * 2;
      if (fish.sprite.y > height + PADDING) fish.sprite.y -= height + PADDING * 2;
    }
    this.overlay.tilePosition.x -= 60 * dt;
    this.overlay.tilePosition.y -= 60 * dt;
  }

  resize({ width, height }: ViewportSize): void {
    // cover: фон всегда закрывает экран с запасом под искажение фильтра.
    const tex = this.background.texture;
    this.background.scale.set(Math.max(width / tex.width, height / tex.height) * 1.2);
    this.background.position.set(width / 2, height / 2);
    this.overlay.width = width;
    this.overlay.height = height;
  }
}
