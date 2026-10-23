/**
 * Слой платформы: всё, что различается между браузером, Electron (.exe) и Capacitor (iOS/Android).
 * Игры и сцены НИКОГДА не обращаются к localStorage / window.Capacitor / electron напрямую —
 * только через ctx.platform и ctx.storage. Тогда перенос на новую платформу = новая реализация здесь.
 */
export type PlatformKind = 'web' | 'electron' | 'capacitor';

/** Асинхронный key-value: в Capacitor это @capacitor/preferences, в Electron — файл, в вебе — localStorage. */
export interface KeyValueStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

export interface Platform {
  readonly kind: PlatformKind;
  readonly isTouch: boolean;
  readonly storage: KeyValueStorage;
}

declare global {
  interface Window {
    Capacitor?: { isNativePlatform(): boolean };
  }
}

function detectKind(): PlatformKind {
  if (window.Capacitor?.isNativePlatform()) return 'capacitor';
  if (navigator.userAgent.includes('Electron')) return 'electron';
  return 'web';
}

const localStorageAdapter: KeyValueStorage = {
  async get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // приватный режим / квота — сохранение не критично для работы игры
    }
  },
  async remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // см. set()
    }
  },
};

export function createPlatform(): Platform {
  return {
    kind: detectKind(),
    isTouch: navigator.maxTouchPoints > 0,
    // TODO(capacitor): iOS может очищать localStorage WebView — подключить @capacitor/preferences.
    // TODO(electron): писать в app.getPath('userData') через preload-мост, чтобы сейвы переживали переустановку.
    storage: localStorageAdapter,
  };
}
