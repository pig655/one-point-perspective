/**
 * 單點透視互動學習教室 - 資料型別定義
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface ProjectedPoint {
  x: number;
  y: number;
  scale: number;
  depth: number;
}

export interface PerspectiveCamera {
  /** 透視點 X 座標 (畫布座標) */
  vpX: number;
  /** 視平線 / 透視點 Y 座標 (畫布座標) */
  vpY: number;
  /** 視距 / 焦距 (單位：像素) */
  focalLength: number;
  /** 畫布寬度 */
  canvasWidth: number;
  /** 畫布高度 */
  canvasHeight: number;
}

export type MainMode = 'basic' | 'room';
export type RoomSubMode = 'empty' | 'furnish' | 'color';
export type RenderStyle = 'wireframe' | 'guidelines' | 'clean' | 'colored';

export interface RoomColors {
  leftWall: string;
  rightWall: string;
  backWall: string;
  ceiling: string;
  floor: string;
}

export type WallTarget = 'left' | 'right' | 'back';

export interface WallAnchor {
  wall: WallTarget;
  /** 深度方向比例 u (0: 外框前緣, 1: 後牆) 或後牆水平比例 u (0: 左, 1: 右) */
  u: number;
  /** 垂直方向比例 v (0: 地板, 1: 天花板) */
  v: number;
  /** 牆面寬度比例 */
  widthU: number;
  /** 牆面高度比例 */
  heightV: number;
}

export type ObjectCategory = 'geometric' | 'furniture' | 'nature' | 'wall' | 'custom' | 'vehicle' | 'building' | 'animal';

export interface ObjectDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface FaceDefinition {
  id: string;
  name: string;
  /** 面的頂點在物件頂點陣列中的索引 */
  vertexIndices: number[];
  /** 面的基礎顏色調整 (如頂面較亮，側面較暗) */
  shadeFactor: number;
  /** 是否需要檢查背面剃除 (計算是否面向視點) */
  cullBackface?: boolean;
}

export interface GeometryModel {
  /** 區域 3D 頂點 (相對於物件基準點 (0,0,0)) */
  localVertices: Point3D[];
  /** 物件面定義 */
  faces: FaceDefinition[];
  /** 結構邊線 (頂點索引對) */
  edges: [number, number][];
  /** 朝向透視點的關鍵導引點索引 (用於透視輔助線) */
  guidelineVertices?: number[];
}

export interface SceneObject {
  id: string;
  name: string;
  category: ObjectCategory;
  /** 物件於基準深度時的世界位置 (x, y) */
  x: number;
  y: number;
  /** 物件距離畫面的深度 Z (>= 0) */
  z: number;
  /** 物件實際尺寸 (物理寬、高、深) */
  dimensions: ObjectDimensions;
  /** 物件主色調 (HEX) */
  color: string;
  /** 次要/邊框顏色 (HEX) */
  secondaryColor?: string;
  strokeColor?: string;
  /** 物件預設幾何模型識別代碼 */
  geometryType: string;
  /** 自訂幾何模型 (若非預設範本) */
  customGeometry?: GeometryModel;
  /** 是否被鎖定 */
  isLocked?: boolean;
  /** 是否顯示個別物件的透視輔助線 */
  showGuidelines?: boolean;
  /** 牆面錨定設定 (若為牆面物件：掛畫、門窗、時鐘) */
  wallAnchor?: WallAnchor;
  /** 地板錨定深度比例 (0: 前緣, 1: 後牆，適用於室內家具) */
  roomFloorZ?: number;
  roomFloorX?: number;
  /** 自訂圖片或貼圖路徑 (Nano Banana 故事繪本插畫) */
  imageUrl?: string;
  /** 外觀趣味主題 (如 gift, dice, cat, pixel 等) */
  styleVariant?: string;
  /** 渲染層級 (z-index 輔助) */
  order: number;
}

export interface ProjectedFace {
  id: string;
  points: Point2D[];
  color: string;
  strokeColor: string;
  centerDepth: number;
  isVisible: boolean;
  name: string;
}

export interface ProjectedEdge {
  start: Point2D;
  end: Point2D;
  isDepthEdge: boolean;
}

export interface ProjectedObject {
  id: string;
  name: string;
  projectedVertices: ProjectedPoint[];
  faces: ProjectedFace[];
  edges: ProjectedEdge[];
  guidelineRays: { start: Point2D; end: Point2D }[];
  centerDepth: number;
  boundingBox: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
  isSelected: boolean;
}

export interface RoomFrame {
  /** 房間前外框座標 (固定於畫布) */
  left: number;
  right: number;
  top: number;
  bottom: number;
  /** 後牆深度比率 t (0 ~ 1) */
  depthRatio: number;
}

export interface RoomCorners {
  // 前外框四角
  ftl: Point2D;
  ftr: Point2D;
  fbr: Point2D;
  fbl: Point2D;
  // 後牆四角
  btl: Point2D;
  btr: Point2D;
  bbr: Point2D;
  bbl: Point2D;
}

export interface RoomProjectedSurfaces {
  corners: RoomCorners;
  leftWall: Point2D[];
  rightWall: Point2D[];
  backWall: Point2D[];
  ceiling: Point2D[];
  floor: Point2D[];
  floorLines: { start: Point2D; end: Point2D }[];
  ceilingLines: { start: Point2D; end: Point2D }[];
  depthRays: { start: Point2D; end: Point2D }[];
}

export interface ViewSettings {
  showHorizonLine: boolean;
  showVanishingPoint: boolean;
  showPerspectiveLines: boolean;
  showGroundGrid: boolean;
  showFloorLines: boolean;
  showCeilingLines: boolean;
  showWallLines: boolean;
  renderStyle: RenderStyle;
  gridSpacing: number;
  gridDepthLines: number;
}

export type LearningMode = 'explore' | 'mission';

export interface MissionStep {
  id: string;
  title: string;
  targetDescription: string;
  hint: string;
  expectedGoal: string;
  isCompleted: boolean;
  validator: (scene: SceneState) => boolean;
}

export interface Mission {
  id: string;
  number: number;
  mode: MainMode;
  title: string;
  description: string;
  conceptToLearn: string;
  steps: MissionStep[];
  successMessage: string;
}

export interface SceneState {
  mainMode: MainMode;
  roomSubMode: RoomSubMode;
  camera: PerspectiveCamera;
  roomFrame: RoomFrame;
  roomColors: RoomColors;
  objects: SceneObject[];
  selectedObjectId: string | null;
  viewSettings: ViewSettings;
  mode: LearningMode;
  currentMissionId: string | null;
  history: {
    past: {
      camera: PerspectiveCamera;
      objects: SceneObject[];
      roomColors: RoomColors;
      mainMode: MainMode;
    }[];
    future: {
      camera: PerspectiveCamera;
      objects: SceneObject[];
      roomColors: RoomColors;
      mainMode: MainMode;
    }[];
  };
}
