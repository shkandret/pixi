import type { Container } from 'pixi.js';
import type { ViewportConfig } from '../types';

export interface ViewportSize {
  width: number;
  height: number;
}

/**
 * Переводит реальный размер экрана в координаты мира.
 * Сцены работают ТОЛЬКО в координатах мира (дизайн-разрешение игры) и не знают
 * ни про devicePixelRatio, ни про реальные пиксели экрана.
 */
export class Viewport {
  /** Видимая ширина мира. В режиме fit всегда = config.width. */
  width = 0;
  /** Видимая высота мира. В режиме fit всегда = config.height. */
  height = 0;
  /** Сколько CSS-пикселей в одной единице мира. */
  scale = 1;
  private offsetX = 0;
  private offsetY = 0;
  private config: ViewportConfig = { width: 1280, height: 720, mode: 'expand' };

  get size(): ViewportSize {
    return { width: this.width, height: this.height };
  }

  configure(config: ViewportConfig): void {
    this.config = config;
  }

  update(screenWidth: number, screenHeight: number): void {
    const { width, height, mode } = this.config;
    this.scale = Math.min(screenWidth / width, screenHeight / height) || 1;
    if (mode === 'fit') {
      this.width = width;
      this.height = height;
      this.offsetX = (screenWidth - width * this.scale) / 2;
      this.offsetY = (screenHeight - height * this.scale) / 2;
    } else {
      this.width = screenWidth / this.scale;
      this.height = screenHeight / this.scale;
      this.offsetX = 0;
      this.offsetY = 0;
    }
  }

  apply(world: Container): void {
    world.scale.set(this.scale);
    world.position.set(this.offsetX, this.offsetY);
  }
}
