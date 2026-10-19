/**
 * 預設範例場景資料
 */

import { SceneObject, PerspectiveCamera, ViewSettings } from './types';

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
  showDepthMarkers: true,
  gridSpacing: 50,
  gridDepthLines: 8
};

/**
 * 預設單點透視教室範例場景
 */
export const DEFAULT_CLASSROOM_OBJECTS: SceneObject[] = [
  // 左側教室窗戶
  {
    id: 'obj-window-1',
    name: '教室景觀窗',
    category: 'furniture',
    x: 200,
    y: 280,
    z: 220,
    dimensions: { width: 90, height: 110, depth: 15 },
    color: '#38BDF8',
    geometryType: 'window',
    order: 1,
    showGuidelines: false
  },
  // 左側置物櫃
  {
    id: 'obj-cabinet-1',
    name: '置物收納櫃',
    category: 'furniture',
    x: 230,
    y: 490,
    z: 160,
    dimensions: { width: 110, height: 130, depth: 60 },
    color: '#0284C7',
    geometryType: 'cabinet',
    order: 2,
    showGuidelines: false
  },
  // 中央示範教學方塊
  {
    id: 'obj-demo-cube',
    name: '探索透視方塊',
    category: 'geometric',
    x: 500,
    y: 460,
    z: 120,
    dimensions: { width: 85, height: 85, depth: 85 },
    color: '#3B82F6',
    geometryType: 'cube',
    order: 3,
    showGuidelines: true // 預設展示輔助線
  },
  // 右前方學生課桌
  {
    id: 'obj-desk-1',
    name: '前排課桌',
    category: 'furniture',
    x: 750,
    y: 530,
    z: 50,
    dimensions: { width: 115, height: 80, depth: 85 },
    color: '#D97706',
    geometryType: 'desk',
    order: 4,
    showGuidelines: false
  },
  // 課桌椅搭配
  {
    id: 'obj-chair-1',
    name: '前排學生椅',
    category: 'furniture',
    x: 750,
    y: 540,
    z: 0,
    dimensions: { width: 55, height: 85, depth: 55 },
    color: '#B45309',
    geometryType: 'chair',
    order: 5,
    showGuidelines: false
  }
];

/**
 * 簡易空白初始場景
 */
export const STARTER_CUBE_OBJECTS: SceneObject[] = [
  {
    id: 'starter-cube',
    name: '單點透視正方體',
    category: 'geometric',
    x: 500,
    y: 480,
    z: 100,
    dimensions: { width: 100, height: 100, depth: 100 },
    color: '#3B82F6',
    geometryType: 'cube',
    order: 1,
    showGuidelines: true
  }
];
