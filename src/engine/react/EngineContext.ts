import { createContext, useContext } from 'react';
import { useStore } from 'zustand';
import type { Engine } from '../Engine';
import type { EngineState } from '../engineStore';

export const EngineContext = createContext<Engine | null>(null);

/** Команды движку из React-UI: engine.pause(), engine.resume(), engine.goto('menu'). */
export function useEngine(): Engine {
  const engine = useContext(EngineContext);
  if (!engine) throw new Error('useEngine() вызван вне <GameHost>');
  return engine;
}

/** Подписка на состояние движка: useEngineState((s) => s.scene). */
export function useEngineState<T>(selector: (state: EngineState) => T): T {
  return useStore(useEngine().state, selector);
}
