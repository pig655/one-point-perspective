/**
 * 預設範例場景資料 (基礎練習與室內空間)
 */

import { SceneObject, PerspectiveCamera, ViewSettings } from './types';
import { DEFAULT_ROOM_FRAME, DEFAULT_ROOM_COLORS } from '../core/roomGeometry';

export const DEFAULT_CAMERA: PerspectiveCamera = {
  vpX: 500,
  vpY: 320,
  focalLength: 550,
  canvasWidth: 1000,
  canvasHeight: 650
};

export const DEFAULT_VIEW_SETTINGS: ViewSettings = {
  showHorizonLine: true,
  showVanishingPoint: true,
  showPerspectiveLines: true,
  showGroundGrid: true,
  showFloorLines: true,
  showCeilingLines: true,
  showWallLines: true,
  renderStyle: 'colored',
  gridSpacing: 50,
  gridDepthLines: 8
};

/**
 * 預設室內空間物件 (已佈置好掛畫、窗戶與家具的精緻房間)
 */
export const DEFAULT_ROOM_OBJECTS: SceneObject[] = [
  // 後牆橫向風景掛畫
  {
    id: 'room-art-back',
    name: '後牆風景掛畫',
    category: 'wall',
    x: 500,
    y: 260,
    z: 750,
    dimensions: { width: 140, height: 85, depth: 5 },
    color: '#0284c7',
    secondaryColor: '#fef08a',
    geometryType: 'landscape-painting',
    order: 1,
    wallAnchor: {
      wall: 'back',
      u: 0.35,
      v: 0.45,
      widthU: 0.3,
      heightV: 0.32
    }
  },
  // 左牆景觀窗戶
  {
    id: 'room-window-left',
    name: '左側景觀窗',
    category: 'wall',
    x: 200,
    y: 280,
    z: 400,
    dimensions: { width: 110, height: 110, depth: 8 },
    color: '#60a5fa',
    secondaryColor: '#ffffff',
    geometryType: 'room-window',
    order: 2,
    wallAnchor: {
      wall: 'left',
      u: 0.35,
      v: 0.38,
      widthU: 0.32,
      heightV: 0.46
    }
  },
  // 地板書桌
  {
    id: 'room-desk-main',
    name: '原木書桌',
    category: 'furniture',
    x: 680,
    y: 480,
    z: 450,
    dimensions: { width: 140, height: 85, depth: 90 },
    color: '#d97706',
    geometryType: 'room-desk',
    order: 3,
    roomFloorX: 0.68,
    roomFloorZ: 0.45
  },
  // 地板靠背椅
  {
    id: 'room-chair-main',
    name: '舒適休閒椅',
    category: 'furniture',
    x: 680,
    y: 520,
    z: 220,
    dimensions: { width: 60, height: 90, depth: 60 },
    color: '#92400e',
    geometryType: 'room-chair',
    order: 4,
    roomFloorX: 0.68,
    roomFloorZ: 0.22
  },
  // 地板綠意盆栽
  {
    id: 'room-plant-corner',
    name: '窗邊綠意盆栽',
    category: 'nature',
    x: 250,
    y: 520,
    z: 280,
    dimensions: { width: 55, height: 85, depth: 55 },
    color: '#16a34a',
    geometryType: 'room-potted-plant',
    order: 5,
    roomFloorX: 0.24,
    roomFloorZ: 0.28
  }
];

/**
 * 基礎透視練習預設物件
 */
export const DEFAULT_BASIC_OBJECTS: SceneObject[] = [
  {
    id: 'basic-demo-cube',
    name: '近處透視正方體',
    category: 'geometric',
    x: 400,
    y: 480,
    z: 80,
    dimensions: { width: 90, height: 90, depth: 90 },
    color: '#3b82f6',
    geometryType: 'cube',
    order: 1,
    showGuidelines: true
  },
  {
    id: 'basic-far-cube',
    name: '遠處透視正方體',
    category: 'geometric',
    x: 650,
    y: 440,
    z: 320,
    dimensions: { width: 90, height: 90, depth: 90 },
    color: '#10b981',
    geometryType: 'cube',
    order: 2,
    showGuidelines: true
  }
];

export { DEFAULT_ROOM_FRAME, DEFAULT_ROOM_COLORS };
