/**
 * 室內空間幾何拓撲、外框約束與牆面錨定投影核心模組 (Room Geometry & Constrained Projection)
 * 
 * 數學模型說明：
 * 1. 房間外框 (Picture Plane Frame) 固定於畫布前端指定矩形：
 *    [FTL, FTR, FBR, FBL]，模擬學生透過畫框/視窗觀看房間。
 * 2. 透視點 (VP_x, VP_y) 嚴格位於視平線 Y = VP_y 上，可沿視平線左右滑動。
 * 3. 房間內部 4 條主角落邊線從外框 4 角筆直朝 (VP_x, VP_y) 收斂。
 * 4. 後牆 (Back Wall) 定義於深度比率 t = depthRatio (0 < t < 1)。
 *    後牆 4 頂點嚴格滿足：
 *      B = VP + (F - VP) * t
 *    因此後牆必然為嚴格矩形，且相鄰牆面、地板、天花板的共用邊完美貼合，絕無接縫破裂。
 * 5. 牆面物件 (掛畫、門窗、時鐘) 使用牆面局部參數座標 (u, v)，投影時上下邊線自然朝 VP 收斂。
 */

import {
  Point2D,
  PerspectiveCamera,
  RoomFrame,
  RoomCorners,
  RoomProjectedSurfaces,
  WallAnchor,
  RoomColors,
  SceneObject,
  ProjectedObject,
  ProjectedFace,
  ProjectedEdge
} from '../models/types';
import { adjustColorBrightness } from './perspective';

export const DEFAULT_ROOM_FRAME: RoomFrame = {
  left: 90,
  right: 910,
  top: 55,
  bottom: 595,
  depthRatio: 0.42
};

export const DEFAULT_ROOM_COLORS: RoomColors = {
  leftWall: '#f8fafc',
  rightWall: '#f1f5f9',
  backWall: '#e2e8f0',
  ceiling: '#ffffff',
  floor: '#fed7aa' // 溫暖木質地板色
};

export const COLORED_ROOM_PALETTES = {
  warm: {
    leftWall: '#fef3c7',
    rightWall: '#fde68a',
    backWall: '#fef08a',
    ceiling: '#fffbeb',
    floor: '#b45309'
  },
  cool: {
    leftWall: '#e0f2fe',
    rightWall: '#bae6fd',
    backWall: '#7dd3fc',
    ceiling: '#f0f9ff',
    floor: '#475569'
  },
  cozy: {
    leftWall: '#ecfdf5',
    rightWall: '#d1fae5',
    backWall: '#a7f3d0',
    ceiling: '#f0fdf4',
    floor: '#c2410c'
  }
};

/**
 * 計算房間在給定相機與外框約束下的所有頂點、面與透視線
 */
export function calculateRoomSurfaces(
  frame: RoomFrame,
  camera: PerspectiveCamera
): RoomProjectedSurfaces {
  const { vpX, vpY } = camera;
  const t = Math.max(0.15, Math.min(0.85, frame.depthRatio));

  // 前外框 4 頂點 (固定於畫布)
  const ftl: Point2D = { x: frame.left, y: frame.top };
  const ftr: Point2D = { x: frame.right, y: frame.top };
  const fbr: Point2D = { x: frame.right, y: frame.bottom };
  const fbl: Point2D = { x: frame.left, y: frame.bottom };

  // 後牆 4 頂點：B = VP + (F - VP) * t
  // 由於 FTL.y === FTR.y，BTL.y 必然等於 BTR.y（後牆頂邊水平）
  // 由於 FBL.y === FBR.y，BBL.y 必然等於 BBR.y（後牆底邊水平）
  // 由於 FTL.x === FBL.x，BTL.x 必然等於 BBL.x（後牆左邊垂直）
  // 由於 FTR.x === FBR.x，BTR.x 必然等於 BBR.x（後牆右邊垂直）
  const btl: Point2D = {
    x: vpX + (ftl.x - vpX) * t,
    y: vpY + (ftl.y - vpY) * t
  };
  const btr: Point2D = {
    x: vpX + (ftr.x - vpX) * t,
    y: vpY + (ftr.y - vpY) * t
  };
  const bbr: Point2D = {
    x: vpX + (fbr.x - vpX) * t,
    y: vpY + (fbr.y - vpY) * t
  };
  const bbl: Point2D = {
    x: vpX + (fbl.x - vpX) * t,
    y: vpY + (fbl.y - vpY) * t
  };

  const corners: RoomCorners = { ftl, ftr, fbr, fbl, btl, btr, bbr, bbl };

  // 5 大牆面頂點序列 (順時針/拓撲接縫完全吻合)
  const leftWall = [ftl, btl, bbl, fbl];
  const rightWall = [ftr, btr, bbr, fbr];
  const backWall = [btl, btr, bbr, bbl];
  const ceiling = [ftl, ftr, btr, btl];
  const floor = [fbl, fbr, bbr, bbl];

  // 深度透視射線 (從前角落延伸向 VP)
  const depthRays = [
    { start: ftl, end: { x: vpX, y: vpY } },
    { start: ftr, end: { x: vpX, y: vpY } },
    { start: fbl, end: { x: vpX, y: vpY } },
    { start: fbr, end: { x: vpX, y: vpY } }
  ];

  // 地板縱向線 (Floor Lines，朝透視點匯聚)
  const numFloorDivisions = 6;
  const floorLines: { start: Point2D; end: Point2D }[] = [];
  for (let i = 1; i < numFloorDivisions; i++) {
    const frac = i / numFloorDivisions;
    const frontPt: Point2D = {
      x: fbl.x + (fbr.x - fbl.x) * frac,
      y: fbl.y
    };
    const backPt: Point2D = {
      x: bbl.x + (bbr.x - bbl.x) * frac,
      y: bbl.y
    };
    floorLines.push({ start: frontPt, end: backPt });
  }

  // 地板橫向等深線 (近疏遠密)
  const depthSteps = [0.22, 0.45, 0.68, 0.86];
  depthSteps.forEach(ratio => {
    // 依據深度比例取得左右牆底邊上的插值點
    const leftPt: Point2D = {
      x: fbl.x + (bbl.x - fbl.x) * ratio,
      y: fbl.y + (bbl.y - fbl.y) * ratio
    };
    const rightPt: Point2D = {
      x: fbr.x + (bbr.x - fbr.x) * ratio,
      y: fbr.y + (bbr.y - fbr.y) * ratio
    };
    floorLines.push({ start: leftPt, end: rightPt });
  });

  // 天花板縱向線 (Ceiling Lines，朝透視點匯聚)
  const numCeilingDivisions = 4;
  const ceilingLines: { start: Point2D; end: Point2D }[] = [];
  for (let i = 1; i < numCeilingDivisions; i++) {
    const frac = i / numCeilingDivisions;
    const frontPt: Point2D = {
      x: ftl.x + (ftr.x - ftl.x) * frac,
      y: ftl.y
    };
    const backPt: Point2D = {
      x: btl.x + (btr.x - btl.x) * frac,
      y: btl.y
    };
    ceilingLines.push({ start: frontPt, end: backPt });
  }

  return {
    corners,
    leftWall,
    rightWall,
    backWall,
    ceiling,
    floor,
    floorLines,
    ceilingLines,
    depthRays
  };
}

/**
 * 牆面局部座標 (u, v) 轉為 2D 畫布投影座標
 * @param wall 'left' | 'right' | 'back'
 * @param u 深度方向比例 [0, 1] (0: 前框, 1: 後牆) 或後牆水平比例 [0, 1] (0: 左, 1: 右)
 * @param v 垂直高度比例 [0, 1] (0: 地板, 1: 天花板)
 * @param corners 房間角點
 */
export function getWallPoint2D(
  wall: 'left' | 'right' | 'back',
  u: number,
  v: number,
  corners: RoomCorners
): Point2D {
  const safeU = Math.max(0, Math.min(1, u));
  const safeV = Math.max(0, Math.min(1, v));

  if (wall === 'left') {
    // 左牆頂邊與底邊
    const topPt: Point2D = {
      x: corners.ftl.x + (corners.btl.x - corners.ftl.x) * safeU,
      y: corners.ftl.y + (corners.btl.y - corners.ftl.y) * safeU
    };
    const bottomPt: Point2D = {
      x: corners.fbl.x + (corners.bbl.x - corners.fbl.x) * safeU,
      y: corners.fbl.y + (corners.bbl.y - corners.fbl.y) * safeU
    };
    // 依高度 v 垂直插值 (v=0 為地板，v=1 為天花板)
    return {
      x: bottomPt.x + (topPt.x - bottomPt.x) * safeV,
      y: bottomPt.y + (topPt.y - bottomPt.y) * safeV
    };
  }

  if (wall === 'right') {
    // 右牆頂邊與底邊
    const topPt: Point2D = {
      x: corners.ftr.x + (corners.btr.x - corners.ftr.x) * safeU,
      y: corners.ftr.y + (corners.btr.y - corners.ftr.y) * safeU
    };
    const bottomPt: Point2D = {
      x: corners.fbr.x + (corners.bbr.x - corners.fbr.x) * safeU,
      y: corners.fbr.y + (corners.bbr.y - corners.fbr.y) * safeU
    };
    return {
      x: bottomPt.x + (topPt.x - bottomPt.x) * safeV,
      y: bottomPt.y + (topPt.y - bottomPt.y) * safeV
    };
  }

  // 後牆：u 為水平 (0: 左, 1: 右)，v 為垂直 (0: 底, 1: 頂)
  const x = corners.btl.x + (corners.btr.x - corners.btl.x) * safeU;
  const y = corners.bbl.y + (corners.btl.y - corners.bbl.y) * safeV;
  return { x, y };
}

/**
 * 投影牆面物件 (掛畫、門、窗、時鐘)
 * 返回物件四個角點：[左下, 右下, 右上, 左上]
 */
export function projectWallObjectCorners(
  anchor: WallAnchor,
  corners: RoomCorners
): Point2D[] {
  const { wall, u, v, widthU, heightV } = anchor;
  const u1 = u;
  const u2 = u + widthU;
  const v1 = v;
  const v2 = v + heightV;

  // 4 角點：(u1, v1) 左下, (u2, v1) 右下, (u2, v2) 右上, (u1, v2) 左上
  const pBL = getWallPoint2D(wall, u1, v1, corners);
  const pBR = getWallPoint2D(wall, u2, v1, corners);
  const pTR = getWallPoint2D(wall, u2, v2, corners);
  const pTL = getWallPoint2D(wall, u1, v2, corners);

  return [pBL, pBR, pTR, pTL];
}

/**
 * 投影室內地板立體家具物件 (桌椅、床、沙發、櫃子、植物)
 * 將物件基準點錨定於地板四邊形內，依深度 Z 計算透視投影
 */
export function projectRoomFloorObject(
  obj: SceneObject,
  _corners: RoomCorners,
  camera: PerspectiveCamera,
  roomFrame: RoomFrame,
  isSelected: boolean
): ProjectedObject {
  const { vpX, vpY } = camera;
  const tMax = roomFrame.depthRatio;

  // roomFloorZ: 深度比例 [0, 1] (0: 前緣, 1: 後牆)
  const zFrac = Math.max(0.05, Math.min(0.95, obj.roomFloorZ ?? (obj.z / 1000)));
  // roomFloorX: 水平比例 [0, 1] (0: 左牆, 1: 右牆)
  const xFrac = Math.max(0.05, Math.min(0.95, obj.roomFloorX ?? ((obj.x - roomFrame.left) / (roomFrame.right - roomFrame.left))));

  // 當前深度在投影公式下的縮放係數 tZ:
  // 在前框時縮放比例為 1.0，在後牆時縮放比例為 tMax
  const tZ = 1.0 - zFrac * (1.0 - tMax);

  // 地板接觸點投影 (Base Point on Floor)
  // 前框地面 X 對應位置
  const frontGroundX = roomFrame.left + (roomFrame.right - roomFrame.left) * xFrac;
  const frontGroundY = roomFrame.bottom;

  // 投影至當前深度的地面座標
  const groundProjX = vpX + (frontGroundX - vpX) * tZ;
  const groundProjY = vpY + (frontGroundY - vpY) * tZ;

  // 物件物理尺寸依深度縮放
  const projW = obj.dimensions.width * tZ;
  const projH = obj.dimensions.height * tZ;
  const projD = obj.dimensions.depth * tZ;

  // 計算長方體 8 個立體頂點
  const hw = projW / 2;
  // 前面 4 點 (深度 zFrac)
  const fbl: Point2D = { x: groundProjX - hw, y: groundProjY };
  const fbr: Point2D = { x: groundProjX + hw, y: groundProjY };
  const ftr: Point2D = { x: groundProjX + hw, y: groundProjY - projH };
  const ftl: Point2D = { x: groundProjX - hw, y: groundProjY - projH };

  // 後面 4 點 (深度朝透視點收斂偏移)
  // 深度長度朝 VP 收斂的比例
  const backT = Math.max(tMax, tZ - (projD / 700) * (1.0 - tMax));
  const depthFactor = backT / tZ;

  const bbl: Point2D = {
    x: vpX + (fbl.x - vpX) * depthFactor,
    y: vpY + (fbl.y - vpY) * depthFactor
  };
  const bbr: Point2D = {
    x: vpX + (fbr.x - vpX) * depthFactor,
    y: vpY + (fbr.y - vpY) * depthFactor
  };
  const btr: Point2D = {
    x: vpX + (ftr.x - vpX) * depthFactor,
    y: vpY + (ftr.y - vpY) * depthFactor
  };
  const btl: Point2D = {
    x: vpX + (ftl.x - vpX) * depthFactor,
    y: vpY + (ftl.y - vpY) * depthFactor
  };

  const projectedVertices = [
    { x: fbl.x, y: fbl.y, scale: tZ, depth: zFrac * 1000 },
    { x: fbr.x, y: fbr.y, scale: tZ, depth: zFrac * 1000 },
    { x: ftr.x, y: ftr.y, scale: tZ, depth: zFrac * 1000 },
    { x: ftl.x, y: ftl.y, scale: tZ, depth: zFrac * 1000 },
    { x: bbl.x, y: bbl.y, scale: backT, depth: zFrac * 1000 + obj.dimensions.depth },
    { x: bbr.x, y: bbr.y, scale: backT, depth: zFrac * 1000 + obj.dimensions.depth },
    { x: btr.x, y: btr.y, scale: backT, depth: zFrac * 1000 + obj.dimensions.depth },
    { x: btl.x, y: btl.y, scale: backT, depth: zFrac * 1000 + obj.dimensions.depth }
  ];

  // 判斷面可見性
  const isTopVisible = ftl.y > vpY; // 低於視平線可見頂面
  const isBottomVisible = fbl.y < vpY;
  const isLeftVisible = groundProjX - hw > vpX; // 在透視點右側可見左側面
  const isRightVisible = groundProjX + hw < vpX; // 在透視點左側可見右側面

  const faces: ProjectedFace[] = [];

  // 頂面
  if (isTopVisible) {
    faces.push({
      id: `${obj.id}-top`,
      name: '頂面',
      points: [btl, btr, ftr, ftl],
      color: adjustColorBrightness(obj.color, 1.25),
      strokeColor: obj.strokeColor || adjustColorBrightness(obj.color, 0.7),
      centerDepth: zFrac * 1000 + 10,
      isVisible: true
    });
  }

  // 底面
  if (isBottomVisible) {
    faces.push({
      id: `${obj.id}-bottom`,
      name: '底面',
      points: [fbl, fbr, bbr, bbl],
      color: adjustColorBrightness(obj.color, 0.7),
      strokeColor: obj.strokeColor || adjustColorBrightness(obj.color, 0.5),
      centerDepth: zFrac * 1000 + 10,
      isVisible: true
    });
  }

  // 左側面
  if (isLeftVisible) {
    faces.push({
      id: `${obj.id}-left`,
      name: '左側面',
      points: [btl, ftl, fbl, bbl],
      color: adjustColorBrightness(obj.color, 0.88),
      strokeColor: obj.strokeColor || adjustColorBrightness(obj.color, 0.6),
      centerDepth: zFrac * 1000 + 5,
      isVisible: true
    });
  }

  // 右側面
  if (isRightVisible) {
    faces.push({
      id: `${obj.id}-right`,
      name: '右側面',
      points: [ftr, btr, bbr, fbr],
      color: adjustColorBrightness(obj.color, 0.82),
      strokeColor: obj.strokeColor || adjustColorBrightness(obj.color, 0.6),
      centerDepth: zFrac * 1000 + 5,
      isVisible: true
    });
  }

  // 正面 (通常總在最前方)
  faces.push({
    id: `${obj.id}-front`,
    name: '正面',
    points: [ftl, ftr, fbr, fbl],
    color: obj.color,
    strokeColor: obj.strokeColor || adjustColorBrightness(obj.color, 0.6),
    centerDepth: zFrac * 1000,
    isVisible: true
  });

  // 邊線
  const edges: ProjectedEdge[] = [
    { start: fbl, end: fbr, isDepthEdge: false },
    { start: fbr, end: ftr, isDepthEdge: false },
    { start: ftr, end: ftl, isDepthEdge: false },
    { start: ftl, end: fbl, isDepthEdge: false },
    { start: fbl, end: bbl, isDepthEdge: true },
    { start: fbr, end: bbr, isDepthEdge: true },
    { start: ftr, end: btr, isDepthEdge: true },
    { start: ftl, end: btl, isDepthEdge: true },
    { start: bbl, end: bbr, isDepthEdge: false },
    { start: bbr, end: btr, isDepthEdge: false },
    { start: btr, end: btl, isDepthEdge: false },
    { start: btl, end: bbl, isDepthEdge: false }
  ];

  // 輔助射線
  const guidelineRays = [
    { start: ftl, end: { x: vpX, y: vpY } },
    { start: ftr, end: { x: vpX, y: vpY } },
    { start: fbl, end: { x: vpX, y: vpY } },
    { start: fbr, end: { x: vpX, y: vpY } }
  ];

  // 邊界包圍盒
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  [fbl, fbr, ftr, ftl, bbl, bbr, btr, btl].forEach(p => {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  });

  return {
    id: obj.id,
    name: obj.name,
    projectedVertices,
    faces,
    edges,
    guidelineRays,
    centerDepth: zFrac * 1000,
    boundingBox: {
      minX,
      minY,
      maxX,
      maxY,
      width: Math.max(1, maxX - minX),
      height: Math.max(1, maxY - minY)
    },
    isSelected
  };
}
