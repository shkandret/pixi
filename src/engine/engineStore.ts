import { createStore } from 'zustand/vanilla';

/** Состояние движка для React-UI. Только чтение из UI; пишет только Engine. */
export interface EngineState {
  status: 'idle' | 'starting' | 'running' | 'error';
  gameId: string | null;
  /** Ключ активной сцены, null во время перехода. */
  scene: string | null;
  loading: boolean;
  progress: number;
  paused: boolean;
  error: string | null;
}

export const initialEngineState: EngineState = {
  status: 'idle',
  gameId: null,
  scene: null,
  loading: false,
  progress: 0,
  paused: false,
  error: null,
};

export const createEngineStore = () => createStore<EngineState>()(() => initialEngineState);
export type EngineStore = ReturnType<typeof createEngineStore>;
