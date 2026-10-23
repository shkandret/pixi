import { useEffect, useRef, useState } from 'react';
import { Engine } from '../Engine';
import type { GameDefinition } from '../types';
import { EngineContext, useEngineState } from './EngineContext';
import styles from './GameHost.module.css';

interface GameHostProps {
  game: GameDefinition;
}

/**
 * Единственный React-компонент, который знает про Pixi.
 * Живёт всё время приложения: создаёт Engine один раз, а смена `game` перезапускает только игру —
 * WebGL-контекст и канвас переиспользуются.
 *
 * Слои: [canvas Pixi] → [React UI игры (game.ui)] → [ошибки движка].
 */
export function GameHost({ game }: GameHostProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<Engine | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const instance = new Engine();
    let alive = true;
    // init асинхронный: в StrictMode cleanup может прийти раньше, чем init закончится.
    // Engine ставит destroy() в очередь после init, поэтому утечки канваса нет.
    instance.init(mount).then(() => alive && setEngine(instance), console.error);
    return () => {
      alive = false;
      setEngine(null);
      void instance.destroy();
    };
  }, []);

  useEffect(() => {
    if (!engine) return;
    void engine.runGame(game);
    return () => void engine.stopGame();
  }, [engine, game]);

  const GameUi = game.ui;
  return (
    <div className={styles.host}>
      <div ref={mountRef} className={styles.canvas} />
      {engine && (
        <EngineContext.Provider value={engine}>
          <div className={styles.ui}>
            {GameUi && <GameUi />}
            <EngineError />
          </div>
        </EngineContext.Provider>
      )}
    </div>
  );
}

function EngineError() {
  const error = useEngineState((s) => s.error);
  if (!error) return null;
  return <div className={styles.error}>{error}</div>;
}
