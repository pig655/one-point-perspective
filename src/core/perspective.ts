/**
 * 單點透視投影數學核心模組 (Perspective Projection Core)
 * 
 * 數學模型說明：
 * 本模組採用標準單點透視（正面透視，Frontal One-Point Perspective）投影模型。
 * 
 * 1. 座標系定義：
 *    - 畫布平面為 XY 平面，X 朝右，Y 朝下（符合 SVG/螢幕座標）。
 *    - 深度軸為 Z 軸，Z >= 0，垂直於畫面指向畫面深處（遠方）。
 *    - 視平線 (Horizon Line) 定義於 Y = vpY。
 *    - 透視點 (Vanishing Point, VP) 定義於 (vpX, vpY)，嚴格位於視平線上。
 * 
 * 2. 投影公式：
 *    對於空間中任意一點 P(X, Y, Z)，其投影至畫面 (X', Y') 之公式為：
 *      scale(Z) = focalLength / (focalLength + Z)
 *      X' = vpX + (X - vpX) * scale(Z)
 *      Y' = vpY + (Y - vpY) * scale(Z)
 * 
 * 3. 透視規律保證：
 *    - 當 Z = 0 時，scale(0) = 1，X' = X, Y' = Y（位於畫面基準面）。
 *    - 當 Z 增加時，scale(Z) 遞減，物體呈現「近大遠小」。
 *    - 當 Z -> 無窮大時，(X', Y') 收斂至透視點 (vpX, vpY)。
 *    - 與畫面平行的水平線（同 Y, Z）投影後 Y' 保持常數，依然水平。
 *    - 與畫面平行的垂直線（同 X, Z）投影後 X' 保持常數，依然垂直。
 *    - 朝深處延伸的平行線（同 X, Y，隨 Z 變化）投影後必然共線於朝向 (vpX, vpY) 之射線。
 */

import { Point2D, Point3D, ProjectedPoint, PerspectiveCamera, FaceDefinition } from '../models/types';

/**
 * 計算給定深度 Z 之縮放比例因子
 * @param z 距離畫面深度的距離 (>= 0)
 * @param focalLength 視距 / 焦距 (必須 > 0)
 * @returns 縮放比例因子 (0, 1]
 */
export function calculatePerspectiveScale(z: number, focalLength: number): number {
  const safeFocal = Math.max(10, focalLength);
  const safeZ = Math.max(0, isFinite(z) ? z : 0);
  return safeFocal / (safeFocal + safeZ);
}

/**
 * 將 3D 世界座標投影為 2D 畫布座標
 * @param point 3D 空間點 (x, y, z)
 * @param camera 透視相機參數 (透視點與焦距)
 * @returns 投影後的 2D 點、縮放係數與深度
 */
export function project3DTo2D(point: Point3D, camera: PerspectiveCamera): ProjectedPoint {
  const { vpX, vpY, focalLength } = camera;
  
  // 邊界防護與防呆處理
  const safeVpX = isFinite(vpX) ? vpX : 500;
  const safeVpY = isFinite(vpY) ? vpY : 320;
  const safeX = isFinite(point.x) ? point.x : safeVpX;
  const safeY = isFinite(point.y) ? point.y : safeVpY;
  const safeZ = isFinite(point.z) ? Math.max(0, point.z) : 0;

  const scale = calculatePerspectiveScale(safeZ, focalLength);

  const projX = safeVpX + (safeX - safeVpX) * scale;
  const projY = safeVpY + (safeY - safeVpY) * scale;

  return {
    x: Number.isFinite(projX) ? projX : safeVpX,
    y: Number.isFinite(projY) ? projY : safeVpY,
    scale,
    depth: safeZ
  };
}

/**
 * 批次投影一組 3D 頂點
 */
export function projectVertices(vertices: Point3D[], camera: PerspectiveCamera): ProjectedPoint[] {
  return vertices.map(v => project3DTo2D(v, camera));
}

/**
 * 使用鞋帶公式 (Shoelace formula) 計算 2D 多邊形的有向面積
 * 用於計算面的法向量指向 / 螢幕旋向，判斷面是否面向觀察者 (Back-face Culling)
 * @param points 2D 多邊形頂點序列
 * @returns 有向面積 (正或負)
 */
export function calculatePolygonSignedArea(points: Point2D[]): number {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return area / 2;
}

/**
 * 判斷面是否可見
 * @param face 面定義
 * @param projectedVertices 投影後頂點
 * @param camera 透視相機
 * @returns 面是否在目前透視下朝向觀察者
 */
export function isFaceVisible(
  face: FaceDefinition,
  projectedVertices: ProjectedPoint[],
  _camera?: PerspectiveCamera
): boolean {
  if (face.cullBackface === false) {
    return true;
  }

  const polygonPoints = face.vertexIndices.map(idx => {
    const p = projectedVertices[idx];
    return { x: p.x, y: p.y };
  });

  // 以有向面積判斷面的旋向
  // 順時針 (CW) 或逆時針 (CCW) 取決於定義。
  // 我們約定：當頂點依右手定則由外側觀察時為順時針 (面積 > 0)
  const area = calculatePolygonSignedArea(polygonPoints);
  
  // 面積極小時（面極度傾斜或退化）視為不可見
  return Math.abs(area) > 0.05 && area > 0;
}

/**
 * 調整顏色亮度 (Shading / 光影明暗)
 * @param hexColor 16 進位顏色 (例如 "#3B82F6")
 * @param factor 調整係數 (例如 0.8 為變暗 20%，1.2 為變亮 20%)
 * @returns 調整後的 HEX 色碼
 */
export function adjustColorBrightness(hexColor: string, factor: number): string {
  let hex = hexColor.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  if (hex.length !== 6) {
    return hexColor;
  }

  const num = parseInt(hex, 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  r = Math.min(255, Math.max(0, Math.round(r * factor)));
  g = Math.min(255, Math.max(0, Math.round(g * factor)));
  b = Math.min(255, Math.max(0, Math.round(b * factor)));

  const rStr = r.toString(16).padStart(2, '0');
  const gStr = g.toString(16).padStart(2, '0');
  const bStr = b.toString(16).padStart(2, '0');

  return `#${rStr}${gStr}${bStr}`;
}

/**
 * 產生從頂點朝向透視點 (VP) 的透視輔助射線
 * @param vertex 投影後的 2D 點
 * @param camera 透視相機
 * @param extendToVp 是否延伸直至透視點
 */
export function createGuidelineRay(
  vertex: Point2D,
  camera: PerspectiveCamera,
  extendToVp = true
): { start: Point2D; end: Point2D } {
  return {
    start: { x: vertex.x, y: vertex.y },
    end: extendToVp ? { x: camera.vpX, y: camera.vpY } : { x: vertex.x, y: vertex.y }
  };
}

/**
 * 檢查並限制透視點在合理範圍內
 * 規則：透視點 Y 嚴格等於視平線 Y，透視點 X 在畫布內一定邊界範圍內
 */
export function clampVanishingPoint(
  vpX: number,
  canvasWidth: number,
  padding = 40
): number {
  const minX = padding;
  const maxX = canvasWidth - padding;
  return Math.min(maxX, Math.max(minX, vpX));
}
