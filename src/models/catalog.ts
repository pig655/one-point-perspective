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
  createPersonGeometry,
  createCarGeometry,
  createBusGeometry,
  createTruckGeometry,
  createStreetlightGeometry,
  createSkyscraperGeometry,
  createStoreGeometry,
  createBenchGeometry,
  createHydrantGeometry,
  createDogGeometry,
  createCatGeometry
} from '../core/geometry';

export {
  createChairGeometry,
  createWindowGeometry,
  createTreeGeometry,
  createRoadGeometry,
  createPersonGeometry,
  createCarGeometry,
  createBusGeometry,
  createTruckGeometry,
  createStreetlightGeometry,
  createSkyscraperGeometry,
  createStoreGeometry,
  createBenchGeometry,
  createHydrantGeometry,
  createDogGeometry,
  createCatGeometry
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
  },

  // === 車輛載具類 ===
  {
    type: 'car',
    name: '經典轎車',
    category: 'vehicle',
    description: '流線型四門房車，包含前擋風玻璃、車頂、行李箱、大燈與水箱護罩。',
    defaultDimensions: { width: 120, height: 75, depth: 220 },
    defaultColor: '#2563EB', // 經典藍
    iconName: 'Car',
    geometryType: 'car',
    createGeometry: (dim) => createCarGeometry(dim.width, dim.height, dim.depth)
  },
  {
    type: 'bus',
    name: '城市公車',
    category: 'vehicle',
    description: '大型大眾運輸客運巴士，具有超大前擋風玻璃、路線 LED 看板與車頂空調。',
    defaultDimensions: { width: 140, height: 130, depth: 360 },
    defaultColor: '#059669', // 翡翠公車綠
    iconName: 'Bus',
    geometryType: 'bus',
    createGeometry: (dim) => createBusGeometry(dim.width, dim.height, dim.depth)
  },
  {
    type: 'truck',
    name: '貨運卡車',
    category: 'vehicle',
    description: '重型物流運輸卡車，前方為獨立駕駛車頭，後方為厚實的大型長方體貨櫃箱。',
    defaultDimensions: { width: 130, height: 120, depth: 280 },
    defaultColor: '#DC2626', // 烈焰紅
    iconName: 'Truck',
    geometryType: 'truck',
    createGeometry: (dim) => createTruckGeometry(dim.width, dim.height, dim.depth)
  },

  // === 街景建築類 ===
  {
    type: 'skyscraper',
    name: '摩天商辦大樓',
    category: 'building',
    description: '現代都會高樓大廈，採三段式逐層收束階梯設計，頂端有避雷尖塔。',
    defaultDimensions: { width: 180, height: 320, depth: 160 },
    defaultColor: '#0284C7', // 科技青藍
    iconName: 'Building2',
    geometryType: 'skyscraper',
    createGeometry: (dim) => createSkyscraperGeometry(dim.width, dim.height, dim.depth)
  },
  {
    type: 'store',
    name: '街角商店',
    category: 'building',
    description: '歐風街角文創小店，附向前懸挑的條紋遮陽雨棚、落地透明櫥窗與大看板。',
    defaultDimensions: { width: 170, height: 160, depth: 150 },
    defaultColor: '#D97706', // 溫暖磚橘
    iconName: 'Store',
    geometryType: 'store',
    createGeometry: (dim) => createStoreGeometry(dim.width, dim.height, dim.depth)
  },

  // === 街頭生活設施類 ===
  {
    type: 'streetlight',
    name: '城市路燈',
    category: 'furniture',
    description: '馬路旁的金屬照明路燈，具有穩固基座、立柱、延伸懸臂與明亮的發光燈罩。',
    defaultDimensions: { width: 60, height: 210, depth: 60 },
    defaultColor: '#475569', // 沉穩鋼灰
    iconName: 'Lamp',
    geometryType: 'streetlight',
    createGeometry: (dim) => createStreetlightGeometry(dim.width, dim.height, dim.depth)
  },
  {
    type: 'bench',
    name: '公園長椅',
    category: 'furniture',
    description: '人行道與綠地休閒木長椅，包含實木條椅面、後傾靠背與兩側鍛鐵扶手。',
    defaultDimensions: { width: 120, height: 65, depth: 55 },
    defaultColor: '#92400E', // 實木胡桃棕
    iconName: 'Armchair',
    geometryType: 'bench',
    createGeometry: (dim) => createBenchGeometry(dim.width, dim.height, dim.depth)
  },
  {
    type: 'hydrant',
    name: '街頭消防栓',
    category: 'furniture',
    description: '鮮紅的街頭安全消防栓，包含法蘭底座、兩側出水口、加壓接頭與頂端閥帽。',
    defaultDimensions: { width: 35, height: 60, depth: 35 },
    defaultColor: '#EF4444', // 醒目火紅
    iconName: 'Flame',
    geometryType: 'hydrant',
    createGeometry: (dim) => createHydrantGeometry(dim.width, dim.height, dim.depth)
  },

  // === 街道動物夥伴類 ===
  {
    type: 'dog',
    name: '散步小狗',
    category: 'animal',
    description: '在街道上悠閒散步的毛小孩，昂首挺胸、直立雙耳與向上搖擺的俏皮尾巴。',
    defaultDimensions: { width: 40, height: 55, depth: 70 },
    defaultColor: '#D97706', // 柴犬金黃
    iconName: 'Dog',
    geometryType: 'dog',
    createGeometry: (dim) => createDogGeometry(dim.width, dim.height, dim.depth)
  },
  {
    type: 'cat',
    name: '街道小貓',
    category: 'animal',
    description: '靈動穿梭街角的可愛貓咪，流線拱背身軀、敏捷四肢與優雅的 S 型翹尾。',
    defaultDimensions: { width: 30, height: 45, depth: 55 },
    defaultColor: '#64748B', // 灰斑貓紋
    iconName: 'Cat',
    geometryType: 'cat',
    createGeometry: (dim) => createCatGeometry(dim.width, dim.height, dim.depth)
  }
];
