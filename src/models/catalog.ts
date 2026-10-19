/**
 * 素材庫定義與預設範本
 */

import { ObjectCategory, ObjectDimensions, GeometryModel } from './types';
import {
  createCuboidGeometry,
  createPrismGeometry,
  createDeskGeometry,
  createHouseGeometry
} from '../core/geometry';

export interface AssetTemplate {
  type: string;
  name: string;
  category: ObjectCategory;
  description: string;
  defaultDimensions: ObjectDimensions;
  defaultColor: string;
  iconName: string;
  geometryType: string;
  createGeometry?: (dim: ObjectDimensions) => GeometryModel;
}

/**
 * 椅子 3D 幾何模型
 */
export function createChairGeometry(width: number, height: number, depth: number): GeometryModel {
  const hw = width / 2;
  const seatH = height * 0.45; // 坐墊高度
  const seatThick = Math.max(4, height * 0.08);
  const backH = height; // 椅背總高
  const legW = Math.max(4, hw * 0.15);
  const d = depth;

  const localVertices = [
    // 坐墊 (0~7)
    { x: -hw, y: -seatH + seatThick, z: 0 }, // 0: 坐墊前左下
    { x: hw, y: -seatH + seatThick, z: 0 },  // 1: 坐墊前右下
    { x: hw, y: -seatH, z: 0 },             // 2: 坐墊前右上
    { x: -hw, y: -seatH, z: 0 },            // 3: 坐墊前左上
    { x: -hw, y: -seatH + seatThick, z: d }, // 4: 坐墊後左下
    { x: hw, y: -seatH + seatThick, z: d },  // 5: 坐墊後右下
    { x: hw, y: -seatH, z: d },             // 6: 坐墊後右上
    { x: -hw, y: -seatH, z: d },            // 7: 坐墊後左上

    // 椅背 (8~11: 位於椅背後方 z=d)
    { x: -hw, y: -backH, z: d },            // 8: 椅背頂左
    { x: hw, y: -backH, z: d },             // 9: 椅背頂右

    // 前左腳 (10)
    { x: -hw + legW / 2, y: 0, z: 0 },
    // 前右腳 (11)
    { x: hw - legW / 2, y: 0, z: 0 },
    // 後左腳 (12)
    { x: -hw + legW / 2, y: 0, z: d },
    // 後右腳 (13)
    { x: hw - legW / 2, y: 0, z: d },
  ];

  const faces = [
    // 坐墊頂面
    {
      id: 'seat-top',
      name: '椅座頂面',
      vertexIndices: [7, 6, 2, 3],
      shadeFactor: 1.25,
      cullBackface: true
    },
    // 坐墊正面
    {
      id: 'seat-front',
      name: '椅座正面',
      vertexIndices: [3, 2, 1, 0],
      shadeFactor: 1.0,
      cullBackface: false
    },
    // 坐墊側面
    {
      id: 'seat-left',
      name: '椅座左側',
      vertexIndices: [7, 3, 0, 4],
      shadeFactor: 0.88,
      cullBackface: true
    },
    {
      id: 'seat-right',
      name: '椅座右側',
      vertexIndices: [2, 6, 5, 1],
      shadeFactor: 0.82,
      cullBackface: true
    },
    // 椅背板
    {
      id: 'backrest',
      name: '椅背',
      vertexIndices: [8, 9, 6, 7],
      shadeFactor: 1.1,
      cullBackface: true
    }
  ];

  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
    // 椅背邊線
    [7, 8], [6, 9], [8, 9],
    // 4 隻椅腳
    [0, 10], [1, 11], [4, 12], [5, 13]
  ];

  return {
    localVertices,
    faces,
    edges,
    guidelineVertices: [2, 3, 8, 9]
  };
}

/**
 * 窗戶幾何模型 (立體外框 + 十字窗欞)
 */
export function createWindowGeometry(width: number, height: number, depth: number): GeometryModel {
  const hw = width / 2;
  const h = height;
  const d = Math.max(5, depth);

  const localVertices = [
    // 外框前 4 點
    { x: -hw, y: 0, z: 0 },
    { x: hw, y: 0, z: 0 },
    { x: hw, y: -h, z: 0 },
    { x: -hw, y: -h, z: 0 },
    // 外框後 4 點
    { x: -hw, y: 0, z: d },
    { x: hw, y: 0, z: d },
    { x: hw, y: -h, z: d },
    { x: -hw, y: -h, z: d },

    // 十字窗欞頂點 (前方)
    { x: 0, y: 0, z: 0 },      // 8: 下中
    { x: 0, y: -h, z: 0 },     // 9: 上中
    { x: -hw, y: -h / 2, z: 0 }, // 10: 左中
    { x: hw, y: -h / 2, z: 0 },  // 11: 右中
  ];

  const faces = [
    {
      id: 'glass',
      name: '玻璃面',
      vertexIndices: [3, 2, 1, 0],
      shadeFactor: 1.15,
      cullBackface: false
    },
    {
      id: 'frame-top',
      name: '窗框頂面',
      vertexIndices: [7, 6, 2, 3],
      shadeFactor: 1.25,
      cullBackface: true
    },
    {
      id: 'frame-left',
      name: '窗框左側面',
      vertexIndices: [7, 3, 0, 4],
      shadeFactor: 0.88,
      cullBackface: true
    },
    {
      id: 'frame-right',
      name: '窗框右側面',
      vertexIndices: [2, 6, 5, 1],
      shadeFactor: 0.82,
      cullBackface: true
    }
  ];

  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
    // 十字窗格
    [8, 9], [10, 11]
  ];

  return {
    localVertices,
    faces,
    edges,
    guidelineVertices: [0, 1, 2, 3]
  };
}

/**
 * 樹木幾何模型 (樹幹 + 立體雙層樹冠)
 */
export function createTreeGeometry(width: number, height: number, depth: number): GeometryModel {
  const hw = width / 2;
  const trunkW = hw * 0.28;
  const trunkH = height * 0.35;
  const d = depth;

  const localVertices = [
    // 樹幹前底面 (0, 1)
    { x: -trunkW, y: 0, z: 0 },
    { x: trunkW, y: 0, z: 0 },
    // 樹幹前頂面 (2, 3)
    { x: trunkW, y: -trunkH, z: 0 },
    { x: -trunkW, y: -trunkH, z: 0 },
    // 樹幹後頂面與底面
    { x: -trunkW, y: 0, z: d },
    { x: trunkW, y: 0, z: d },
    { x: trunkW, y: -trunkH, z: d },
    { x: -trunkW, y: -trunkH, z: d },

    // 樹冠第一層 (下寬上窄稜錐)
    { x: -hw, y: -trunkH, z: 0 },           // 8: 下層左
    { x: hw, y: -trunkH, z: 0 },            // 9: 下層右
    { x: hw * 0.7, y: -height * 0.7, z: 0 }, // 10: 中層右
    { x: -hw * 0.7, y: -height * 0.7, z: 0 },// 11: 中層左
    // 樹冠頂層
    { x: 0, y: -height, z: 0 },             // 12: 樹頂尖
    // 樹冠後方對應頂點
    { x: -hw, y: -trunkH, z: d },
    { x: hw, y: -trunkH, z: d },
    { x: 0, y: -height, z: d }
  ];

  const faces = [
    // 樹幹正面
    {
      id: 'trunk-front',
      name: '樹幹正面',
      vertexIndices: [3, 2, 1, 0],
      shadeFactor: 0.8,
      cullBackface: false
    },
    // 樹冠下層正面
    {
      id: 'canopy-lower',
      name: '樹冠下層',
      vertexIndices: [11, 10, 9, 8],
      shadeFactor: 1.0,
      cullBackface: false
    },
    // 樹冠上層正面
    {
      id: 'canopy-upper',
      name: '樹冠上層',
      vertexIndices: [12, 10, 11],
      shadeFactor: 1.15,
      cullBackface: false
    },
    // 樹冠左斜面
    {
      id: 'canopy-left',
      name: '樹冠左側',
      vertexIndices: [15, 12, 11, 8, 13],
      shadeFactor: 0.9,
      cullBackface: true
    },
    // 樹冠右斜面
    {
      id: 'canopy-right',
      name: '樹冠右側',
      vertexIndices: [12, 15, 14, 9, 10],
      shadeFactor: 0.85,
      cullBackface: true
    }
  ];

  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [8, 9], [9, 10], [10, 12], [12, 11], [11, 8],
    [0, 4], [1, 5], [8, 13], [9, 14], [12, 15]
  ];

  return {
    localVertices,
    faces,
    edges,
    guidelineVertices: [0, 1, 12]
  };
}

/**
 * 道路幾何模型 (向遠處延伸之雙線道地面)
 */
export function createRoadGeometry(width: number, _height: number, depth: number): GeometryModel {
  const hw = width / 2;
  const d = Math.max(300, depth);

  const localVertices = [
    // 前方路面 (Z=0, Y=0)
    { x: -hw, y: 0, z: 0 },  // 0: 前左路緣
    { x: hw, y: 0, z: 0 },   // 1: 前右路緣
    // 後方路面 (Z=d, Y=0)
    { x: hw, y: 0, z: d },   // 2: 後右路緣
    { x: -hw, y: 0, z: d },  // 3: 後左路緣

    // 中央分隔虛線 4 個頂點 (前、後)
    { x: -hw * 0.04, y: -0.5, z: 0 },
    { x: hw * 0.04, y: -0.5, z: 0 },
    { x: hw * 0.04, y: -0.5, z: d },
    { x: -hw * 0.04, y: -0.5, z: d },
  ];

  const faces = [
    {
      id: 'road-surface',
      name: '柏油路面',
      vertexIndices: [3, 2, 1, 0],
      shadeFactor: 0.95,
      cullBackface: false
    },
    {
      id: 'road-stripe',
      name: '中央分道線',
      vertexIndices: [7, 6, 5, 4],
      shadeFactor: 1.3,
      cullBackface: false
    }
  ];

  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 7], [5, 6]
  ];

  return {
    localVertices,
    faces,
    edges,
    guidelineVertices: [0, 1]
  };
}

/**
 * 簡化人物模型 (幾何造型學生)
 */
export function createPersonGeometry(width: number, height: number, depth: number): GeometryModel {
  const hw = width / 2;
  const torsoH = height * 0.45;
  const legH = height * 0.39;
  const d = Math.max(10, depth);

  const localVertices = [
    // 腳底 (0, 1)
    { x: -hw * 0.4, y: 0, z: 0 },
    { x: hw * 0.4, y: 0, z: 0 },
    // 軀幹下緣 (2, 3)
    { x: hw * 0.5, y: -legH, z: 0 },
    { x: -hw * 0.5, y: -legH, z: 0 },
    // 軀幹肩部 (4, 5)
    { x: hw * 0.6, y: -legH - torsoH, z: 0 },
    { x: -hw * 0.6, y: -legH - torsoH, z: 0 },
    // 頭部頂點 (6)
    { x: 0, y: -height, z: 0 },

    // 後方對應頂點 (7~13)
    { x: -hw * 0.4, y: 0, z: d },
    { x: hw * 0.4, y: 0, z: d },
    { x: hw * 0.5, y: -legH, z: d },
    { x: -hw * 0.5, y: -legH, z: d },
    { x: hw * 0.6, y: -legH - torsoH, z: d },
    { x: -hw * 0.6, y: -legH - torsoH, z: d },
    { x: 0, y: -height, z: d },
  ];

  const faces = [
    // 軀幹衣服
    {
      id: 'torso',
      name: '身體',
      vertexIndices: [5, 4, 2, 3],
      shadeFactor: 1.0,
      cullBackface: false
    },
    // 頭部 (菱形/多邊形頭部)
    {
      id: 'head',
      name: '頭部',
      vertexIndices: [6, 4, 5],
      shadeFactor: 1.1,
      cullBackface: false
    },
    // 側面
    {
      id: 'side-right',
      name: '右側',
      vertexIndices: [4, 11, 9, 2],
      shadeFactor: 0.85,
      cullBackface: true
    },
    {
      id: 'side-left',
      name: '左側',
      vertexIndices: [12, 5, 3, 10],
      shadeFactor: 0.85,
      cullBackface: true
    }
  ];

  const edges: [number, number][] = [
    [0, 3], [1, 2], // 雙腿
    [3, 2], [2, 4], [4, 5], [5, 3], // 軀幹
    [5, 6], [4, 6], // 頭部
    [0, 7], [1, 8], [4, 11], [5, 12], [6, 13]
  ];

  return {
    localVertices,
    faces,
    edges,
    guidelineVertices: [0, 1, 6]
  };
}

/**
 * 完整物件素材庫範本清單
 */
export const ASSET_CATALOG: AssetTemplate[] = [
  // === 幾何體類 ===
  {
    type: 'cube',
    name: '正方體',
    category: 'geometric',
    description: '標準六面體，便於觀察正面、側面與頂面的透視收斂。',
    defaultDimensions: { width: 90, height: 90, depth: 90 },
    defaultColor: '#3B82F6', // 經典藍
    iconName: 'Box',
    geometryType: 'cube',
    createGeometry: (dim) => createCuboidGeometry(dim.width, dim.height, dim.depth)
  },
  {
    type: 'cuboid',
    name: '長方體',
    category: 'geometric',
    description: '具有不同長寬高的長方體，適合比較各邊長在透視中的變化。',
    defaultDimensions: { width: 140, height: 80, depth: 100 },
    defaultColor: '#10B981', // 翡翠綠
    iconName: 'Cuboid',
    geometryType: 'cuboid',
    createGeometry: (dim) => createCuboidGeometry(dim.width, dim.height, dim.depth)
  },
  {
    type: 'prism',
    name: '多稜柱',
    category: 'geometric',
    description: '具有六個側面的柱體，觀察圓弧感與稜線的透視規律。',
    defaultDimensions: { width: 80, height: 110, depth: 80 },
    defaultColor: '#8B5CF6', // 夢幻紫
    iconName: 'Cylinder',
    geometryType: 'prism',
    createGeometry: (dim) => createPrismGeometry(dim.width / 2, dim.height, dim.depth)
  },
  {
    type: 'flat-block',
    name: '扁平地磚塊',
    category: 'geometric',
    description: '薄型平坦方塊，便於鋪設地面或堆疊。',
    defaultDimensions: { width: 120, height: 25, depth: 120 },
    defaultColor: '#F59E0B', // 琥珀金
    iconName: 'Square',
    geometryType: 'cube',
    createGeometry: (dim) => createCuboidGeometry(dim.width, dim.height, dim.depth)
  },
  {
    type: 'tall-column',
    name: '立體高柱',
    category: 'geometric',
    description: '細長的立柱，適合觀察穿越視平線時的頂底面翻轉。',
    defaultDimensions: { width: 45, height: 160, depth: 45 },
    defaultColor: '#EC4899', // 玫瑰粉
    iconName: 'Columns',
    geometryType: 'cube',
    createGeometry: (dim) => createCuboidGeometry(dim.width, dim.height, dim.depth)
  },

  // === 生活物件類 ===
  {
    type: 'desk',
    name: '學生課桌',
    category: 'furniture',
    description: '教室課桌，桌面與四隻桌腳呈現精準的近大遠小與深度延伸。',
    defaultDimensions: { width: 110, height: 75, depth: 80 },
    defaultColor: '#D97706', // 溫潤木紋色
    iconName: 'Table',
    geometryType: 'desk',
    createGeometry: (dim) => createDeskGeometry(dim.width, dim.height, dim.depth)
  },
  {
    type: 'chair',
    name: '靠背木椅',
    category: 'furniture',
    description: '搭配課桌的座椅，包含椅座面、椅背與椅腳。',
    defaultDimensions: { width: 55, height: 85, depth: 55 },
    defaultColor: '#B45309', // 褐木色
    iconName: 'Armchair',
    geometryType: 'chair',
    createGeometry: (dim) => createChairGeometry(dim.width, dim.height, dim.depth)
  },
  {
    type: 'cabinet',
    name: '教室置物櫃',
    category: 'furniture',
    description: '教室後方的大型收納櫃，可清楚展現大型立體家具的透視體積。',
    defaultDimensions: { width: 130, height: 140, depth: 65 },
    defaultColor: '#0EA5E9', // 天空藍
    iconName: 'Archive',
    geometryType: 'cabinet',
    createGeometry: (dim) => createCuboidGeometry(dim.width, dim.height, dim.depth)
  },
  {
    type: 'window',
    name: '景觀窗戶',
    category: 'furniture',
    description: '教室牆壁的採光窗，包含外框與十字窗格。',
    defaultDimensions: { width: 95, height: 115, depth: 20 },
    defaultColor: '#38BDF8', // 玻璃清藍
    iconName: 'AppWindow',
    geometryType: 'window',
    createGeometry: (dim) => createWindowGeometry(dim.width, dim.height, dim.depth)
  },
  {
    type: 'house',
    name: '透視尖頂小屋',
    category: 'furniture',
    description: '經典單點透視房屋，屋頂的屋脊線完美收斂至透視點。',
    defaultDimensions: { width: 150, height: 140, depth: 160 },
    defaultColor: '#EF4444', // 亮麗紅磚
    iconName: 'Home',
    geometryType: 'house',
    createGeometry: (dim) => createHouseGeometry(dim.width, dim.height, dim.depth)
  },
  {
    type: 'road',
    name: '透視馬路',
    category: 'furniture',
    description: '由近處地面直通透視點的寬廣道路，帶有中央標線。',
    defaultDimensions: { width: 220, height: 5, depth: 500 },
    defaultColor: '#64748B', // 瀝青灰
    iconName: 'Milestone',
    geometryType: 'road',
    createGeometry: (dim) => createRoadGeometry(dim.width, dim.height, dim.depth)
  },

  // === 人物與自然物件類 ===
  {
    type: 'person',
    name: '學生角色',
    category: 'nature',
    description: '身高符合國小五年級學生比例的人物，便於比較人身高度隨深度的縮小。',
    defaultDimensions: { width: 45, height: 125, depth: 25 },
    defaultColor: '#F97316', // 活力橙
    iconName: 'User',
    geometryType: 'person',
    createGeometry: (dim) => createPersonGeometry(dim.width, dim.height, dim.depth)
  },
  {
    type: 'tree',
    name: '校園綠樹',
    category: 'nature',
    description: '綠意盎然的校園大樹，具有立體樹幹與多層冠層。',
    defaultDimensions: { width: 100, height: 150, depth: 70 },
    defaultColor: '#22C55E', // 鮮綠色
    iconName: 'Trees',
    geometryType: 'tree',
    createGeometry: (dim) => createTreeGeometry(dim.width, dim.height, dim.depth)
  }
];
