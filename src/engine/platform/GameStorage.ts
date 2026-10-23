import type { KeyValueStorage } from './Platform';

/** JSON-сохранения игры. Ключи автоматически изолированы по game.id. */
export class GameStorage {
  constructor(
    private readonly storage: KeyValueStorage,
    private readonly namespace: string,
  ) {}

  async load<T>(key: string, fallback: T): Promise<T> {
    const raw = await this.storage.get(this.key(key));
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  save<T>(key: string, value: T): Promise<void> {
    return this.storage.set(this.key(key), JSON.stringify(value));
  }

  remove(key: string): Promise<void> {
    return this.storage.remove(this.key(key));
  }

  private key(key: string): string {
    return `game:${this.namespace}:${key}`;
  }
}
