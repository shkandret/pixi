import { useEffect, useState } from 'react';
import { GameHost, type GameDefinition } from '@/engine';
import { gameIds, games, isGameId, type GameId } from '@/games/registry';
import styles from './App.module.css';

/**
 * Какую игру запускать:
 *   1. ?game=<id> в адресе (удобно в разработке);
 *   2. VITE_GAME из .env / окружения сборки (для релизной сборки одной игры под Electron/Capacitor);
 *   3. первая игра из реестра.
 */
function initialGameId(): GameId {
  const fromUrl = new URLSearchParams(window.location.search).get('game');
  if (isGameId(fromUrl)) return fromUrl;
  const fromEnv = import.meta.env.VITE_GAME as string | undefined;
  if (isGameId(fromEnv)) return fromEnv;
  return gameIds[0];
}

export function App() {
  const [gameId, setGameId] = useState<GameId>(initialGameId);
  const [game, setGame] = useState<GameDefinition | null>(null);

  useEffect(() => {
    let alive = true;
    games[gameId]().then((definition) => alive && setGame(definition), console.error);
    return () => {
      alive = false;
    };
  }, [gameId]);

  const switchGame = (id: GameId) => {
    const url = new URL(window.location.href);
    url.searchParams.set('game', id);
    window.history.replaceState(null, '', url);
    setGameId(id);
  };

  return (
    <>
      {game && <GameHost game={game} />}
      {import.meta.env.DEV && (
        <select className={styles.devSwitcher} value={gameId} onChange={(e) => switchGame(e.target.value as GameId)}>
          {gameIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      )}
    </>
  );
}
