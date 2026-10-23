import { useEngine, useEngineState } from '@/engine';
import { useBunnyCatch } from '../store';
import styles from './BunnyHud.module.css';

/** HUD и меню паузы — обычный React поверх канваса. Pixi-объектов здесь нет и быть не должно. */
export function BunnyHud() {
  const engine = useEngine();
  const scene = useEngineState((s) => s.scene);
  const paused = useEngineState((s) => s.paused);
  const score = useBunnyCatch((s) => s.score);
  const lives = useBunnyCatch((s) => s.lives);

  if (scene !== 'play') return null;

  return (
    <>
      <div className={styles.bar}>
        <span>Счёт: {score}</span>
        <span className={styles.lives}>{'♥'.repeat(lives)}</span>
        <button className={styles.button} onClick={() => engine.pause()} aria-label="Пауза">
          ❚❚
        </button>
      </div>

      {paused && (
        <div className={styles.overlay}>
          <h2>Пауза</h2>
          <button className={styles.button} onClick={() => engine.resume()}>
            Продолжить
          </button>
          <button
            className={styles.button}
            onClick={() => {
              engine.resume();
              void engine.goto('menu');
            }}
          >
            В меню
          </button>
        </div>
      )}
    </>
  );
}
