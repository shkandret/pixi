# Гайд для моделей: как работать в этом репозитории

Веб-игры на **Pixi.js v8 + React 19 + TypeScript + Vite + zustand**. Позже оборачиваются в Electron (Windows)
и Capacitor (iOS/Android). Зачем всё устроено именно так — [ARCHITECTURE.md](ARCHITECTURE.md).
Прочитай этот файл целиком перед первой правкой. Отвечай пользователю по-русски.

## Команды

```bash
yarn dev          # http://localhost:5173, ?game=<id> выбирает игру
yarn typecheck    # tsc
yarn lint         # eslint, включая правила границ слоёв
yarn verify        # typecheck + lint + build — обязательно перед тем, как сказать «готово»
```

## Карта

```
src/
  engine/                  ОБЩИЙ движок. Не знает ни об одной игре.
    index.ts               публичный API — игры импортируют только '@/engine'
    Engine.ts              Pixi Application, цикл, вьюпорт, запуск/остановка игры
    scene/Scene.ts         базовый класс сцены (+ LoadingScene)
    scene/SceneManager.ts  переходы и экран загрузки
    assets/AssetService.ts бандлы и неймспейсы ассетов
    viewport/, input/, platform/, react/
  games/
    registry.ts            список игр (ленивые импорты)
    <game-id>/
      index.ts             GameDefinition (default export)
      assets.ts            манифест: бандлы → ассеты
      store.ts             zustand-стор: мост сцены ↔ React UI
      logic/               чистый TS: правила, баланс, симуляция. Без pixi/react/engine
      scenes/              классы Scene
      view/                (по желанию) фабрики Pixi-объектов, переиспользуемые сценами
      ui/                  React-компоненты HUD/меню (+ *.module.css)
public/assets/<game-id>/   локальные файлы ассетов
legacy-next/               старый код на Next.js, вне сборки. Не трогать, не импортировать.
```

Эталон — `src/games/bunny-catch`. Прежде чем писать новое, посмотри, как это сделано там.

## Железные правила

1. **Сцена рисует только в `this.root`.** Никогда `app.stage.addChild`, никогда фильтры на `app.stage`.
2. **Никогда `app.ticker.add`.** Логика кадра — в `update(dt)`, физика/симуляция — в `fixedUpdate(dt)`.
   `dt` — секунды. Скорости пиши в единицах/секунду: `x += speed * dt`.
3. **Никаких `setTimeout`/`setInterval` в сценах.** Таймеры — счётчиками в `update`/`fixedUpdate`
   (они автоматически встают на паузу). Если очень нужно — очистка через `addDisposer`.
4. **Всё, на что подписался, — отписать через `this.addDisposer(fn)`**: `store.subscribe`, `window.addEventListener`,
   gsap-твины, объекты вне `root`. Дети `root` и их обработчики событий уничтожаются автоматически.
5. **Никакого состояния на уровне модуля** (`let overlay`, `const enemies = []` вне класса). Только поля сцены
   или стор. Иначе второй запуск игры увидит мусор первого.
6. **Ассеты — только через манифест и `this.ctx.assets`.** Никаких `Assets.load`, `Sprite.from('url')`,
   `Texture.from` в играх. Сцена объявляет `readonly bundles = ['имя']`; движок загрузит их до `enter()`.
7. **В конструкторе сцены `ctx` нет.** Объекты, которым нужен `ctx`, создавай в `enter()`.
   Поля вида `new Container()` / `new Graphics()` можно инициализировать прямо в объявлении.
8. **Раскладка — в `resize(size)`.** Он вызывается сразу после `enter()` и при каждом изменении экрана.
   Размеры — `this.ctx.viewport.width/height` (координаты мира, не пиксели экрана).
9. **React не трогает Pixi, Pixi не трогает React.** UI читает стор (`useXStore(selector)`) и состояние движка
   (`useEngineState`), команды — `useEngine().pause()/resume()/goto()` или экшены стора.
   Сцена пишет в стор через `useXStore.getState().action()`. Хуки (`useXStore(...)`) в сценах — нельзя.
10. **`logic/` — чистый TypeScript.** Без `pixi.js`, `react`, `@/engine`. Только данные и функции.
11. **Игры не импортируют друг друга и внутренности движка** (`@/engine/scene/...` — нельзя, только `@/engine`).
    Нужен общий код для нескольких игр — сначала спроси пользователя, куда его класть.
12. **Платформа — только через `ctx`.** Никаких `localStorage`, `window.Capacitor`, `require('electron')` в играх.
    Сохранения: `await this.ctx.storage.load(key, fallback)`, `this.ctx.storage.save(key, value)`.
13. **Не меняй движок ради одной игры.** Если кажется, что без правки `src/engine` не обойтись, — остановись
    и опиши пользователю, что и зачем хочешь поменять. Изменения движка затрагивают все игры.

Правила 6, 10, 11 и часть 9 проверяет `yarn lint`. Остальные — твоя ответственность.

## Рецепты

### Новая игра

1. `src/games/<id>/` — `id` в kebab-case, совпадает с ключом в реестре и папкой в `public/assets/`.
2. `assets.ts`:
   ```ts
   export const manifest: AssetsManifest = {
     bundles: [
       { name: 'menu', assets: [{ alias: 'logo', src: 'assets/<id>/logo.png' }] },
       { name: 'game', assets: [{ alias: 'hero', src: 'assets/<id>/hero.png' }] },
     ],
   };
   ```
   `src` локальных файлов — **без** ведущего `/` (иначе сломается в Electron). alias — короткий, без префикса игры.
3. Сцены в `scenes/` (см. ниже), стор в `store.ts`, UI в `ui/`.
4. `index.ts`:
   ```ts
   const game: GameDefinition = {
     id: '<id>',
     title: 'Название',
     viewport: { width: 720, height: 1280, mode: 'fit' }, // портрет: suika/plinko. Ландшафт survivors: 1280×720 'expand'
     assets: manifest,
     scenes: { menu: () => new MenuScene(), play: () => new PlayScene() },
     initialScene: 'menu',
     backgroundBundles: ['game'],
     ui: GameHud,
     async setup(ctx) { /* загрузить сейв в стор, сбросить стор */ },
   };
   export default game;
   ```
5. Добавь строку в `src/games/registry.ts`.
6. `yarn verify`, затем открой `?game=<id>` и проверь руками.

### Новая сцена

```ts
import { Container, Sprite } from 'pixi.js';
import { Scene, type ViewportSize } from '@/engine';

interface PlayParams { level: number }

export class PlayScene extends Scene<PlayParams> {
  readonly bundles = ['game'];             // что загрузить до enter()

  private readonly layer = new Container(); // можно: не требует ctx
  private hero!: Sprite;                    // создаём в enter()

  async load({ level }: PlayParams) {       // опционально: данные с сервера, под экраном загрузки
    // this.levelData = await fetch(...)
  }

  enter({ level }: PlayParams) {
    this.hero = new Sprite(this.ctx.assets.texture('hero'));
    this.root.addChild(this.layer, this.hero);
    // Реакция на действия из React-UI (например, купили апгрейд). Отписка — обязательно.
    this.addDisposer(useGameStore.subscribe((s, prev) => {
      if (s.upgrades !== prev.upgrades) this.applyUpgrades(s.upgrades);
    }));
  }

  fixedUpdate(dt: number) { /* движение, физика, спавн */ }
  update(dt: number) { /* анимации, ввод: this.ctx.keyboard.isDown('KeyW') */ }
  resize({ width, height }: ViewportSize) { this.hero.position.set(width / 2, height / 2); }
  onHidden() { this.ctx.pause(); }          // геймплей: пауза при сворачивании
}
```

Переход: `void this.ctx.goto('menu', { lastScore })`. Безопасно звать из `update` и обработчиков кликов:
старая сцена уничтожится после текущего кадра. После вызова `goto` не трогай объекты сцены — выставь
флаг (`this.over = true`) и выйди из метода. Параметры приходят в `enter(params)`/`load(params)` новой сцены.

### Ввод

- Клик/тап по объекту: `obj.eventMode = 'static'; obj.cursor = 'pointer'; obj.on('pointerdown', ...)`.
- Тап по всему экрану: `this.root.eventMode = 'static'` + `this.root.hitArea = new Rectangle(0, 0, w, h)` в `resize`.
- Клавиатура: `this.ctx.keyboard.isDown('KeyA')`, `justPressed('Space')` — опрашивать в `update`, не в `fixedUpdate`.

### UI (React)

- Компонент в `ui/`, подключается через `ui:` в `GameDefinition`. Показывай по сцене:
  `const scene = useEngineState((s) => s.scene); if (scene !== 'play') return null;`
- Слой UI прозрачен для кликов. Каждому кликабельному элементу — `pointer-events: auto` в CSS.
- Стили — CSS-модули рядом с компонентом. Отступы от краёв — с учётом `env(safe-area-inset-*)`.
- Меню паузы, магазины, попапы, настройки — это React, не Pixi-сцены.

### Стор

```ts
export const useGameStore = create<State>()((set) => ({
  coins: 0,
  addCoins: (n) => set((s) => ({ coins: s.coins + n })),
}));
```
В сцене: `useGameStore.getState().addCoins(5)`. В React: `const coins = useGameStore((s) => s.coins)`.
Не клади в стор то, что меняется каждый кадр для сотен объектов (позиции врагов) — это убьёт React.
Часто меняющиеся числа для HUD (таймер) — пиши в стор не чаще ~10 раз в секунду.

### Ассеты с бэкенда

- Отдельные файлы: полный URL в `src` манифеста.
- Весь манифест: `assets: async () => (await fetch(URL)).json()` в `GameDefinition`.
- Данные уровня/профиля: `async load(params)` у сцены.
- Спрайтшиты: в манифест кладётся `.json` атласа, кадр — `this.ctx.assets.get<Spritesheet>('atlas').textures['frame.png']`.

### Производительность (особенно survivors)

- Много одинаковых объектов → один атлас + `Sprite`, для тысяч — `ParticleContainer`.
- Пул объектов вместо `new`/`destroy` каждый кадр.
- `Graphics` рисуй один раз; меняй `position/scale/tint/alpha`, а не перерисовывай каждый кадр.
- `Text` не пересоздавай; меняй `.text` только когда значение реально изменилось.
- Коллизии многих-со-многими — spatial hash/сетка, не O(n²).

### Физика (suika, plinko)

Библиотека ставится в игру (`yarn add matter-js`), мир создаётся в `enter()`, уничтожается через `addDisposer`.
Шаг — только в `fixedUpdate(dt)`. Синхронизация спрайтов с телами — в `update`.

## Типичные ошибки (не делай так)

| Плохо | Хорошо |
|---|---|
| `app.ticker.add(() => ...)` | `update(dt) { ... }` |
| `x += 2` (пикселей за кадр) | `x += 120 * dt` |
| `PIXI.Assets.load([...])` в сцене | `readonly bundles = ['game']` + `this.ctx.assets.texture('x')` |
| `Sprite.from('fishpond-fish1')` | `new Sprite(this.ctx.assets.texture('fish1'))` |
| `import * as PIXI from 'pixi.js'` | именованные импорты: `import { Sprite } from 'pixi.js'` |
| `let score = 0` на уровне модуля | поле сцены или стор |
| `useGameStore()` внутри сцены | `useGameStore.getState()` |
| `document.getElementById` / DOM в сцене | React-компонент в `ui/` |
| `window.addEventListener` без отписки | `addEventListener` + `this.addDisposer(() => removeEventListener(...))` |
| Создание объектов в конструкторе с `this.ctx` | в `enter()` |
| `localStorage.setItem` | `this.ctx.storage.save(key, value)` |
| Правка `src/engine` «чтобы заработало» | спросить пользователя |

## Definition of done

- [ ] `yarn verify` проходит без ошибок и предупреждений.
- [ ] Игра открыта в браузере (`?game=<id>`), сценарий пройден руками: вход в сцену, переход назад, повторный вход.
- [ ] В консоли нет ошибок и предупреждений Pixi.
- [ ] Повторный вход в сцену/игру не ускоряет анимации и не плодит объекты (признак утечки подписок).
- [ ] На мобильном размере (375×812) всё влезает и нажимается.
- [ ] Новые правила/исключения из этого гайда — согласованы с пользователем и дописаны сюда.
