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

export type ObjectCategory = 'geometric' | 'furniture' | 'nature' | 'custom';

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
  /** 邊框顏色 (HEX) */
  strokeColor?: string;
  /** 物件預設幾何模型識別代碼 */
  geometryType: string;
  /** 自訂幾何模型 (若非預設範本) */
  customGeometry?: GeometryModel;
  /** 是否被鎖定 */
  isLocked?: boolean;
  /** 是否顯示個別物件的透視輔助線 */
  showGuidelines?: boolean;
  /** 旋轉角度 (繞 Y 軸，步進角度或 0-360) */
  rotationY?: number;
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

export interface ViewSettings {
  showHorizonLine: boolean;
  showVanishingPoint: boolean;
  showPerspectiveLines: boolean;
  showGroundGrid: boolean;
  showDepthMarkers: boolean;
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
  title: string;
  description: string;
  conceptToLearn: string;
  steps: MissionStep[];
  successMessage: string;
}

export interface SceneState {
  camera: PerspectiveCamera;
  objects: SceneObject[];
  selectedObjectId: string | null;
  viewSettings: ViewSettings;
  mode: LearningMode;
  currentMissionId: string | null;
  history: {
    past: { camera: PerspectiveCamera; objects: SceneObject[] }[];
    future: { camera: PerspectiveCamera; objects: SceneObject[] }[];
  };
}
