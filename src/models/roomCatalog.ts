/**
 * 室內空間透視素材庫定義 (Room Asset Templates)
 */

import { ObjectCategory, ObjectDimensions, WallAnchor } from './types';

export interface RoomAssetTemplate {
  type: string;
  name: string;
  category: ObjectCategory;
  description: string;
  defaultDimensions: ObjectDimensions;
  defaultColor: string;
  secondaryColor?: string;
  iconName: string;
  isWallObject?: boolean;
  defaultWallAnchor?: WallAnchor;
  imageUrl?: string;
}

export const ROOM_ASSET_CATALOG: RoomAssetTemplate[] = [
  // === 牆面物件 (實木油畫、採光窗、實木門、壁鐘) ===
  {
    type: 'landscape-painting',
    name: '橫向古典油畫',
    category: 'wall',
    description: '實木金邊畫框與古典風景油畫，增添室內空間美感。',
    defaultDimensions: { width: 140, height: 85, depth: 5 },
    defaultColor: '#0284c7',
    secondaryColor: '#d97706',
    iconName: 'Image',
    isWallObject: true,
    defaultWallAnchor: {
      wall: 'back',
      u: 0.35,
      v: 0.45,
      widthU: 0.3,
      heightV: 0.32
    }
  },
  {
    type: 'portrait-painting',
    name: '直向藝術油畫',
    category: 'wall',
    description: '直式高雅油畫框，精緻木框線條適合裝飾側牆。',
    defaultDimensions: { width: 75, height: 120, depth: 5 },
    defaultColor: '#a855f7',
    secondaryColor: '#f59e0b',
    iconName: 'Frame',
    isWallObject: true,
    defaultWallAnchor: {
      wall: 'right',
      u: 0.3,
      v: 0.35,
      widthU: 0.25,
      heightV: 0.45
    }
  },
  {
    type: 'room-window',
    name: '牆面景觀採光窗',
    category: 'wall',
    description: '室內明亮採光窗，帶有十字窗欞與逼真天藍玻璃反光。',
    defaultDimensions: { width: 110, height: 110, depth: 8 },
    defaultColor: '#60a5fa',
    secondaryColor: '#ffffff',
    iconName: 'AppWindow',
    isWallObject: true,
    defaultWallAnchor: {
      wall: 'left',
      u: 0.35,
      v: 0.4,
      widthU: 0.3,
      heightV: 0.45
    }
  },
  {
    type: 'room-door',
    name: '室內實木門',
    category: 'wall',
    description: '通往走廊的雙嵌板實木門，帶有金屬門把手。',
    defaultDimensions: { width: 90, height: 180, depth: 8 },
    defaultColor: '#b45309',
    secondaryColor: '#f59e0b',
    iconName: 'DoorClosed',
    isWallObject: true,
    defaultWallAnchor: {
      wall: 'left',
      u: 0.15,
      v: 0.0,
      widthU: 0.25,
      heightV: 0.72
    }
  },
  {
    type: 'wall-clock',
    name: '圓形壁掛時鐘',
    category: 'wall',
    description: '簡約大方的刻度壁鐘，指針朝向透視深度方向。',
    defaultDimensions: { width: 50, height: 50, depth: 5 },
    defaultColor: '#ef4444',
    secondaryColor: '#ffffff',
    iconName: 'Clock',
    isWallObject: true,
    defaultWallAnchor: {
      wall: 'back',
      u: 0.12,
      v: 0.7,
      widthU: 0.12,
      heightV: 0.18
    }
  },

  // === 地面家具與織品 ===
  {
    type: 'room-rug',
    name: '幾何織品地毯',
    category: 'furniture',
    description: '鋪設於地板的純羊毛織品地毯，具有菱形織紋與流蘇邊飾。',
    defaultDimensions: { width: 140, height: 5, depth: 140 },
    defaultColor: '#fef3c7',
    secondaryColor: '#b45309',
    iconName: 'Shapes',
    isWallObject: false
  },

  // === 室內家具 (地面立體物件) ===
  {
    type: 'room-desk',
    name: '書桌 / 課桌',
    category: 'furniture',
    description: '穩重寬敞的學習書桌，四隻立體桌腳牢固錨定於地板。',
    defaultDimensions: { width: 140, height: 85, depth: 90 },
    defaultColor: '#D97706',
    iconName: 'Table',
    isWallObject: false
  },
  {
    type: 'room-chair',
    name: '舒適靠背椅',
    category: 'furniture',
    description: '搭配書桌的休閒椅，坐墊與椅背呈現精確的深度比例。',
    defaultDimensions: { width: 60, height: 90, depth: 60 },
    defaultColor: '#92400E',
    iconName: 'Armchair',
    isWallObject: false
  },
  {
    type: 'room-bookshelf',
    name: '三層實木書架',
    category: 'furniture',
    description: '靠牆放置的大型書架，收納整齊豐富的讀物。',
    defaultDimensions: { width: 110, height: 160, depth: 65 },
    defaultColor: '#0369A1',
    iconName: 'Archive',
    isWallObject: false
  },
  {
    type: 'room-bed',
    name: '溫馨單人床',
    category: 'furniture',
    description: '擺放在房間角落的床鋪，長邊沿著透視線向後方延伸。',
    defaultDimensions: { width: 130, height: 55, depth: 180 },
    defaultColor: '#4F46E5',
    iconName: 'Bed',
    isWallObject: false
  },
  {
    type: 'room-sofa',
    name: '客廳舒適沙發',
    category: 'furniture',
    description: '柔軟的雙人沙發，讓室內空間更顯溫馨與生活感。',
    defaultDimensions: { width: 160, height: 75, depth: 85 },
    defaultColor: '#059669',
    iconName: 'Sofa',
    isWallObject: false
  },

  // === 角色與自然植物 ===
  {
    type: 'room-potted-plant',
    name: '綠意盆栽',
    category: 'nature',
    description: '窗邊或桌旁的花盆綠植，為房間注入自然生機。',
    defaultDimensions: { width: 55, height: 85, depth: 55 },
    defaultColor: '#16A34A',
    iconName: 'Flower2',
    isWallObject: false
  },
  {
    type: 'room-student',
    name: '五年級小學生',
    category: 'nature',
    description: '正在房間裡探索透視的學生，依真實人體透視比例縮放。',
    defaultDimensions: { width: 45, height: 125, depth: 25 },
    defaultColor: '#EA580C',
    iconName: 'User',
    isWallObject: false
  },

  // === 幾何方塊 ===
  {
    type: 'room-cube',
    name: '透視正方體',
    category: 'geometric',
    description: '放置在地板上的正方體，便於觀察各面在房間光影下的變化。',
    defaultDimensions: { width: 80, height: 80, depth: 80 },
    defaultColor: '#2563EB',
    iconName: 'Box',
    isWallObject: false
  }
];
