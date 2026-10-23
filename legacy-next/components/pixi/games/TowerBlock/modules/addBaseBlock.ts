import * as PIXI from 'pixi.js';

export const addBaseBlock = (app: PIXI.Application) => {
  // Создаем черный квадрат размером 100x100
  const baseBlock = new PIXI.Graphics();

  // Устанавливаем стиль заливки и рисуем прямоугольник
  baseBlock.rect(0, 0, 300, 100)
    .fill({ color: 0x000000 }); // Черный цвет

  // Центрируем квадрат по горизонтали, устанавливаем его внизу экрана
  baseBlock.x = app.renderer.width / 2 - 150;
  baseBlock.y = app.renderer.height - 100;

  // Добавляем на сцену
  app.stage.addChild(baseBlock);
};