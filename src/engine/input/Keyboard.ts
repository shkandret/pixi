/**
 * Состояние клавиатуры, опрашиваемое из update(). Коды — KeyboardEvent.code ('KeyW', 'Space', 'ArrowLeft').
 * Для кликов и тапов используй события Pixi (eventMode = 'static' + on('pointerdown')).
 */
export class Keyboard {
  private readonly down = new Set<string>();
  private readonly pressed = new Set<string>();

  isDown(code: string): boolean {
    return this.down.has(code);
  }

  /** true ровно в тот кадр, когда клавишу нажали. */
  justPressed(code: string): boolean {
    return this.pressed.has(code);
  }

  /** @internal */
  attach(target: Window): () => void {
    const onDown = (e: KeyboardEvent) => {
      if (!e.repeat) this.pressed.add(e.code);
      this.down.add(e.code);
    };
    const onUp = (e: KeyboardEvent) => this.down.delete(e.code);
    const onBlur = () => this.reset();
    target.addEventListener('keydown', onDown);
    target.addEventListener('keyup', onUp);
    target.addEventListener('blur', onBlur);
    return () => {
      target.removeEventListener('keydown', onDown);
      target.removeEventListener('keyup', onUp);
      target.removeEventListener('blur', onBlur);
    };
  }

  /** @internal — движок вызывает в конце кадра */
  endFrame(): void {
    this.pressed.clear();
  }

  /** @internal */
  reset(): void {
    this.down.clear();
    this.pressed.clear();
  }
}
