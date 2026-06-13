# Архитектура проекта: React + PixiJS

## Структура папок

```
src/
├── app/
│   └── router.tsx                # Конфигурация маршрутов
│
├── components/
│   └── PixiCanvas/
│       └── index.tsx             # Переиспользуемый React-компонент для Pixi-сцен
│
├── pages/
│   ├── HomePage.tsx              # /
│   ├── TestPage.tsx              # /test
│   └── GamePage.tsx              # /game
│
├── pixi/
│   ├── shared/                   # Общее для ВСЕХ игр
│   │   ├── types.ts              # SceneDescriptor, SceneContext
│   │   └── index.ts              # Barrel-экспорт
│   │
│   └── games/                    # Каждая игра — изолированный модуль
│       ├── test/                 # Игра: test (пример)
│       │   ├── scene.ts          # SceneDescriptor — точка входа сцены
│       │   ├── entities/         # Сущности этой игры
│       │   ├── systems/          # Системы этой игры
│       │   ├── layers/           # Слои этой игры
│       │   ├── assets/           # Ассеты этой игры
│       │   └── index.ts          # Barrel — экспортирует сцену наружу
│       │
│       ├── snake/                # Игра: snake (пример)
│       │   ├── scene.ts
│       │   ├── entities/
│       │   │   ├── Snake.ts
│       │   │   └── Food.ts
│       │   ├── systems/
│       │   │   └── movementSystem.ts
│       │   ├── assets/
│       │   │   └── manifest.ts   # Манифест ассетов для этой игры
│       │   └── index.ts
│       │
│       └── ...                   # Другие игры
│
├── stores/
│   └── gameStore.ts              # Zustand — мост между React и Pixi
│
└── theme/                        # Chakra UI тема
```

---

## Принцип изоляции игр

Каждая игра — **самодостаточный модуль** в `pixi/games/<gameName>/`. Она содержит:

- **Свои** сцены, сущности, системы, слои
- **Свои** ассеты (загружаются только когда игра активна)
- **Один** barrel-файл `index.ts`, экспортирующий `SceneDescriptor`

```
pixi/games/snake/        ← всё про змейку живёт здесь
pixi/games/tetris/       ← всё про тетрис живёт здесь
```

> Игра A **не импортирует** ничего из игры B. Ассеты одной игры не загружаются другой.

Общие утилиты и типы — в `pixi/shared/`.

---

## PixiCanvas — единая точка рендеринга

Компонент `<PixiCanvas>` — обёртка над `pixi.js Application`. Он:

- Создаёт `Application` при mount, уничтожает при unmount
- Принимает `SceneDescriptor` и вызывает `setup()` для инициализации
- **Никогда** не рендерится параллельно в двух местах

```tsx
import { PixiCanvas } from '@/components/PixiCanvas'
import { testScene } from '@/pixi/games/test'

function TestPage() {
  return <PixiCanvas scene={testScene} width={800} height={600} />
}
```

---

## SceneDescriptor — описание сцены

Каждая сцена — объект с `setup()`, который получает `SceneContext` и возвращает корневой `Container`:

```ts
// pixi/games/myGame/scene.ts
import { Container, Graphics } from 'pixi.js'
import type { SceneDescriptor } from '@/pixi/shared'

export const myGameScene: SceneDescriptor = {
  setup({ app }) {
    const root = new Container()

    const bg = new Graphics()
      .roundRect(0, 0, app.screen.width, app.screen.height, 0)
      .fill({ color: 0x1a1a2e })
    root.addChild(bg)

    app.ticker.add((ticker) => {
      // игровой цикл
    })

    return root
  },

  cleanup({ app }) {
    // очистка подписок, таймеров и т.д.
  },
}
```

---

## Слои (layers) внутри игры

Слои — `Container`-ы, которые упорядочивают визуальные элементы сцены. Каждая игра хранит свои слои:

```ts
// pixi/games/snake/layers/backgroundLayer.ts
import { Container, Graphics } from 'pixi.js'
import type { Application } from 'pixi.js'

export function createBackgroundLayer(app: Application): Container {
  const layer = new Container()
  const bg = new Graphics()
    .roundRect(0, 0, app.screen.width, app.screen.height, 0)
    .fill({ color: 0x0f0f23 })
  layer.addChild(bg)
  return layer
}
```

Использование в сцене:

```ts
// pixi/games/snake/scene.ts
setup({ app }) {
  const root = new Container()
  root.addChild(createBackgroundLayer(app))  // слой 0: фон
  root.addChild(createGameLayer(app))        // слой 1: игровые объекты
  root.addChild(createParticleLayer(app))    // слой 2: частицы
  return root
}
```

---

## Ассеты — ленивая загрузка per-game

Ассеты загружаются **только при запуске конкретной игры**, внутри `setup()`:

```ts
// pixi/games/snake/assets/manifest.ts
export const snakeAssets = {
  head: '/games/snake/head.png',
  body: '/games/snake/body.png',
  food: '/games/snake/food.png',
} as const

// pixi/games/snake/scene.ts
import { Assets } from 'pixi.js'
import { snakeAssets } from './assets/manifest'

export const snakeScene: SceneDescriptor = {
  async setup({ app }) {
    // Загрузка только ассетов змейки
    const textures = await Assets.load(Object.values(snakeAssets))

    const root = new Container()
    // ... используем textures
    return root
  },
}
```

Статические файлы кладутся в `public/games/<gameName>/`:
```
public/
└── games/
    ├── snake/
    │   ├── head.png
    │   └── food.png
    └── tetris/
        └── blocks.png
```

---

## React ↔ Pixi: обмен данными через Zustand

Zustand-стор — единственный канал связи между React UI и Pixi-логикой.

### Из React (через хук):

```tsx
import { useGameStore } from '@/stores/gameStore'

function ScoreDisplay() {
  const score = useGameStore((s) => s.score)
  return <Text>{score}</Text>
}
```

### Из Pixi (напрямую, без хуков):

```ts
import { useGameStore } from '@/stores/gameStore'

// Чтение
const { score } = useGameStore.getState()

// Запись
useGameStore.getState().addScore(10)

// Подписка на изменения
const unsubscribe = useGameStore.subscribe((state) => {
  if (state.isPaused) app.ticker.stop()
  else app.ticker.start()
})
```

### Поток данных:

```
┌──────────┐     getState() / subscribe()     ┌──────────┐
│          │ ◄──────────────────────────────── │          │
│  React   │          Zustand Store            │  PixiJS  │
│   UI     │ ────────────────────────────────► │  Scene   │
│          │     setState() (actions)          │          │
└──────────┘                                   └──────────┘
```

---

## Добавление новой игры — чеклист

1. Создать папку `src/pixi/games/<gameName>/`
2. Создать `scene.ts` с `SceneDescriptor`
3. Создать `index.ts` с barrel-экспортом сцены
4. Если нужны ассеты — создать `assets/manifest.ts` и папку `public/games/<gameName>/`
5. Создать страницу `src/pages/<GameName>Page.tsx` с `<PixiCanvas scene={...} />`
6. Добавить маршрут в `src/app/router.tsx`

---

## Важные правила

1. **Каждая игра изолирована** в `pixi/games/<name>/` — свои сущности, системы, ассеты
2. **Игры не импортируют друг друга** — только `pixi/shared/`
3. **Ассеты грузятся лениво** внутри `setup()` через `Assets.load()`
4. **Весь UI (меню, HUD, настройки) — React + Chakra UI**, не на Pixi-canvas
5. **Zustand — единственный мост** между React и Pixi
6. **Одна сцена в один момент** — PixiCanvas монтируется/размонтируется при навигации
