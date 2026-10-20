/**
 * 素材庫定義與預設範本
 */

import { ObjectCategory, ObjectDimensions, GeometryModel } from './types';
import {
  createCuboidGeometry,
  createPrismGeometry,
  createDeskGeometry,
  createHouseGeometry,
  createChairGeometry,
  createWindowGeometry,
  createTreeGeometry,
  createRoadGeometry,
  createPersonGeometry
} from '../core/geometry';

export {
  createChairGeometry,
  createWindowGeometry,
  createTreeGeometry,
  createRoadGeometry,
  createPersonGeometry
};

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
    defaultDimensions: { width: 220, height: 5, depth: 1000 },
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
