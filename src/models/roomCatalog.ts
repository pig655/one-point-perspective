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
  // === 童趣故事插畫掛畫 (Nano Banana 繪本藝術) ===
  {
    type: 'cat-space-painting',
    name: '🐱 太空喵喵冒險掛畫',
    category: 'wall',
    description: '由 Nano Banana 生成的可愛太空貓咪繪本插畫，掛在牆上超吸睛！',
    defaultDimensions: { width: 140, height: 95, depth: 5 },
    defaultColor: '#1e1b4b',
    secondaryColor: '#f59e0b',
    iconName: 'Image',
    isWallObject: true,
    imageUrl: '/assets/images/painting_cat_astronaut.jpg',
    defaultWallAnchor: {
      wall: 'back',
      u: 0.35,
      v: 0.45,
      widthU: 0.32,
      heightV: 0.35
    }
  },
  {
    type: 'dino-party-painting',
    name: '🦖 派對小恐龍掛畫',
    category: 'wall',
    description: '由 Nano Banana 生成的可愛恐龍派對繪本插畫，給房間滿滿活力！',
    defaultDimensions: { width: 90, height: 130, depth: 5 },
    defaultColor: '#064e3b',
    secondaryColor: '#fbbf24',
    iconName: 'Frame',
    isWallObject: true,
    imageUrl: '/assets/images/painting_cute_dino.jpg',
    defaultWallAnchor: {
      wall: 'right',
      u: 0.3,
      v: 0.35,
      widthU: 0.25,
      heightV: 0.45
    }
  },
  {
    type: 'rainbow-window',
    name: '🌈 彩虹草原景觀窗',
    category: 'wall',
    description: '窗外能看到美麗的陽光彩虹與綠油油大草原，好想跳出去玩！',
    defaultDimensions: { width: 120, height: 120, depth: 8 },
    defaultColor: '#38bdf8',
    secondaryColor: '#ffffff',
    iconName: 'AppWindow',
    isWallObject: true,
    imageUrl: '/assets/images/window_rainbow_meadow.jpg',
    defaultWallAnchor: {
      wall: 'left',
      u: 0.35,
      v: 0.4,
      widthU: 0.32,
      heightV: 0.45
    }
  },
  {
    type: 'bear-rug',
    name: '🐻 萌萌小熊圓地毯',
    category: 'furniture',
    description: '鋪在房間地板上的溫暖小熊地毯，讓房間變得超級溫馨可愛！',
    defaultDimensions: { width: 130, height: 10, depth: 130 },
    defaultColor: '#fef3c7',
    secondaryColor: '#b45309',
    iconName: 'Shapes',
    imageUrl: '/assets/images/rug_cute_bear.jpg'
  },

  // === 牆面物件 (掛畫、門窗、時鐘) ===
  {
    type: 'landscape-painting',
    name: '橫向風景掛畫',
    category: 'wall',
    description: '經典橫向藝術掛畫，掛在後牆或側牆，增添室內空間美感。',
    defaultDimensions: { width: 140, height: 85, depth: 5 },
    defaultColor: '#38BDF8',
    secondaryColor: '#D97706',
    iconName: 'Image',
    isWallObject: true,
    imageUrl: '/assets/images/painting_cat_astronaut.jpg',
    defaultWallAnchor: {
      wall: 'back',
      u: 0.35,
      v: 0.45,
      widthU: 0.3,
      heightV: 0.3
    }
  },
  {
    type: 'portrait-painting',
    name: '直向藝術掛畫',
    category: 'wall',
    description: '直式高雅掛畫，非常適合裝飾右牆或後牆兩側。',
    defaultDimensions: { width: 75, height: 120, depth: 5 },
    defaultColor: '#A855F7',
    secondaryColor: '#F59E0B',
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
    name: '牆面景觀窗',
    category: 'wall',
    description: '室內明亮採光窗，帶有十字窗欞與美麗天藍窗色。',
    defaultDimensions: { width: 110, height: 110, depth: 8 },
    defaultColor: '#60A5FA',
    secondaryColor: '#FFFFFF',
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
    description: '通往走廊或房間的木門，緊貼牆面底端，頂邊朝透視點收斂。',
    defaultDimensions: { width: 90, height: 180, depth: 8 },
    defaultColor: '#B45309',
    secondaryColor: '#F59E0B',
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
    description: '客廳必備的掛鐘，指引美好的學習時光。',
    defaultDimensions: { width: 50, height: 50, depth: 5 },
    defaultColor: '#EF4444',
    secondaryColor: '#FFFFFF',
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
