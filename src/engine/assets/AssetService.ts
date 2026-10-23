import { Assets, Cache, type AssetsManifest, type Texture, type UnresolvedAsset } from 'pixi.js';

type BundleAssets = AssetsManifest['bundles'][number]['assets'];

/**
 * Pixi Assets — глобальный синглтон, а игры в одном хосте меняются.
 * Поэтому все бандлы и alias'ы игры автоматически получают префикс `${gameId}/`:
 * игра пишет `texture('bunny')`, а в кеше Pixi лежит `bunny-catch/bunny`.
 * Две игры с одинаковыми именами ассетов не конфликтуют, а при остановке игры
 * всё её добро выгружается одним вызовом.
 */
const registeredBundles = new Set<string>();

export class AssetService {
  private readonly bundles = new Set<string>();
  private readonly loaded = new Set<string>();

  constructor(private readonly namespace: string) {}

  /** Регистрирует бандлы манифеста. Ничего не скачивает. */
  register(manifest: AssetsManifest): void {
    for (const bundle of manifest.bundles) {
      const id = this.id(bundle.name);
      // Повторный addBundle того же id засоряет консоль предупреждениями Pixi — регистрируем один раз за жизнь страницы.
      if (!registeredBundles.has(id)) {
        Assets.addBundle(id, this.prefixAliases(bundle.assets));
        registeredBundles.add(id);
      }
      this.bundles.add(bundle.name);
    }
  }

  isLoaded(bundles: readonly string[]): boolean {
    return bundles.every((name) => this.loaded.has(name));
  }

  async loadBundles(bundles: readonly string[], onProgress?: (progress: number) => void): Promise<void> {
    if (bundles.length === 0) return onProgress?.(1);
    for (const name of bundles) {
      if (!this.bundles.has(name)) {
        throw new Error(`Бандл "${name}" не объявлен в манифесте игры "${this.namespace}". Есть: ${[...this.bundles].join(', ')}`);
      }
    }
    await Assets.loadBundle(bundles.map((name) => this.id(name)), onProgress);
    for (const name of bundles) this.loaded.add(name);
  }

  /** Начать качать бандлы в фоне (например, геймплей, пока игрок в меню). */
  backgroundLoad(bundles: readonly string[]): void {
    void Assets.backgroundLoadBundle(bundles.map((name) => this.id(name)));
  }

  /** Любой загруженный ассет по alias из манифеста: Texture, Spritesheet, JSON, звук… */
  get<T>(alias: string): T {
    const key = this.key(alias);
    if (!Cache.has(key)) {
      throw new Error(`Ассет "${alias}" игры "${this.namespace}" не загружен. Его бандл указан в scene.bundles?`);
    }
    return Cache.get<T>(key);
  }

  texture(alias: string): Texture {
    return this.get<Texture>(alias);
  }

  /** Выгрузить всё, что загрузила игра. Вызывает движок при остановке игры. */
  async unloadAll(): Promise<void> {
    const ids = [...this.loaded].map((name) => this.id(name));
    this.loaded.clear();
    if (ids.length > 0) await Assets.unloadBundle(ids);
  }

  private id(bundle: string): string {
    return `${this.namespace}/${bundle}`;
  }

  private key(alias: string): string {
    return `${this.namespace}/${alias}`;
  }

  private prefixAliases(assets: BundleAssets): BundleAssets {
    const prefix = (alias: string | string[] | undefined) =>
      alias === undefined ? undefined : Array.isArray(alias) ? alias.map((a) => this.key(a)) : this.key(alias);

    if (Array.isArray(assets)) {
      return assets.map((asset): UnresolvedAsset => ({ ...asset, alias: prefix(asset.alias) }));
    }
    return Object.fromEntries(
      Object.entries(assets).map(([alias, value]) => [
        this.key(alias),
        typeof value === 'string' || Array.isArray(value) ? value : { ...value, alias: prefix(value.alias) },
      ]),
    );
  }
}
