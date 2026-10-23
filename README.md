# mainpixi

Веб-игры на Pixi.js v8 + React + Vite. Один движок-хост, много игр; позже — Electron (.exe) и Capacitor (телефоны).

```bash
yarn
yarn dev              # http://localhost:5173/?game=bunny-catch
yarn verify            # typecheck + lint + build
VITE_GAME=fishpond yarn build   # релизная сборка, стартующая с конкретной игры → dist/
```

- [ARCHITECTURE.md](ARCHITECTURE.md) — идея архитектуры и почему она такая.
- [CLAUDE.md](CLAUDE.md) — правила и рецепты для работы с кодом (для людей и моделей).

Игры: `bunny-catch` — эталон со всеми слоями (меню, геймплей, HUD на React, сохранения);
`fishpond` — одна сцена с тяжёлыми удалёнными ассетами.

`legacy-next/` — старая версия на Next.js, вне сборки; можно удалить.
