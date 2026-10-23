'use client';

import * as PIXI from 'pixi.js';
import { addBaseBlock } from './modules/addBaseBlock';

export const TowerBlock = async (app: PIXI.Application) => {
  // Пока что нет внешних ресурсов, поэтому сразу добавляем блок
  addBaseBlock(app);
};