import { describe, it, expect } from 'vitest';
import {
  calculateRoomSurfaces,
  projectWallObjectCorners,
  DEFAULT_ROOM_FRAME
} from './roomGeometry';
import { PerspectiveCamera, WallAnchor } from '../models/types';
import { calculatePolygonSignedArea } from './perspective';

describe('室內房間幾何與約束投影單元測試 (Room Geometry & Projection Tests)', () => {
  const defaultCamera: PerspectiveCamera = {
    vpX: 500,
    vpY: 320,
    focalLength: 550,
    canvasWidth: 1000,
    canvasHeight: 650
  };

  it('1. 驗證後牆為嚴格矩形：頂底水平、左右垂直', () => {
    const room = calculateRoomSurfaces(DEFAULT_ROOM_FRAME, defaultCamera);
    const { btl, btr, bbl, bbr } = room.corners;

    // 頂邊水平
    expect(btl.y).toBeCloseTo(btr.y, 5);
    // 底邊水平
    expect(bbl.y).toBeCloseTo(bbr.y, 5);
    // 左邊垂直
    expect(btl.x).toBeCloseTo(bbl.x, 5);
    // 右邊垂直
    expect(btr.x).toBeCloseTo(bbr.x, 5);

    // 寬度與高度大於 0
    expect(btr.x - btl.x).toBeGreaterThan(100);
    expect(bbl.y - btl.y).toBeGreaterThan(100);
  });

  it('2. 驗證房間角落深度線與地板縱向線精確收斂至透視點 (VP)', () => {
    const room = calculateRoomSurfaces(DEFAULT_ROOM_FRAME, defaultCamera);
    const { ftl, btl } = room.corners;

    // 前左上 FTL 到 後左上 BTL 之射線必定穿過 (vpX, vpY)
    const area = calculatePolygonSignedArea([
      { x: ftl.x, y: ftl.y },
      { x: btl.x, y: btl.y },
      { x: defaultCamera.vpX, y: defaultCamera.vpY }
    ]);
    expect(Math.abs(area)).toBeLessThan(1e-4);

    // 驗證地板線條同樣收斂至 VP
    const firstFloorLine = room.floorLines[0];
    const floorArea = calculatePolygonSignedArea([
      firstFloorLine.start,
      firstFloorLine.end,
      { x: defaultCamera.vpX, y: defaultCamera.vpY }
    ]);
    expect(Math.abs(floorArea)).toBeLessThan(1e-4);
  });

  it('3. 驗證共用邊連續性：所有相鄰牆面、天花板與地板拓撲接縫完全吻合', () => {
    const room = calculateRoomSurfaces(DEFAULT_ROOM_FRAME, defaultCamera);

    // 左牆與天花板的共用邊 (FTL -> BTL)
    expect(room.leftWall[0]).toEqual(room.ceiling[0]); // FTL
    expect(room.leftWall[1]).toEqual(room.ceiling[3]); // BTL

    // 左牆與地板的共用邊 (FBL -> BBL)
    expect(room.leftWall[2]).toEqual(room.floor[3]); // BBL
    expect(room.leftWall[3]).toEqual(room.floor[0]); // FBL

    // 後牆與天花板的共用邊 (BTL -> BTR)
    expect(room.backWall[0]).toEqual(room.ceiling[3]); // BTL
    expect(room.backWall[1]).toEqual(room.ceiling[2]); // BTR

    // 後牆與地板的共用邊 (BBL -> BBR)
    expect(room.backWall[2]).toEqual(room.floor[2]); // BBR
    expect(room.backWall[3]).toEqual(room.floor[3]); // BBL
  });

  it('4. 驗證外框固定約束與透視點左右移動時的後牆連動', () => {
    const camLeft: PerspectiveCamera = { ...defaultCamera, vpX: 350 };
    const camRight: PerspectiveCamera = { ...defaultCamera, vpX: 650 };

    const roomLeft = calculateRoomSurfaces(DEFAULT_ROOM_FRAME, camLeft);
    const roomRight = calculateRoomSurfaces(DEFAULT_ROOM_FRAME, camRight);

    // 前外框固定不變
    expect(roomLeft.corners.ftl).toEqual(roomRight.corners.ftl);
    expect(roomLeft.corners.fbr).toEqual(roomRight.corners.fbr);

    // 當透視點從 350 移至 650 (向右移動)：
    // 後牆整體向右移動
    expect(roomRight.corners.btl.x).toBeGreaterThan(roomLeft.corners.btl.x);
    expect(roomRight.corners.btr.x).toBeGreaterThan(roomLeft.corners.btr.x);

    // 左牆可見寬度 (BTL.x - FTL.x) 明顯變大
    const leftWallWLeft = roomLeft.corners.btl.x - roomLeft.corners.ftl.x;
    const leftWallWRight = roomRight.corners.btl.x - roomRight.corners.ftl.x;
    expect(leftWallWRight).toBeGreaterThan(leftWallWLeft);
  });

  it('5. 驗證牆面錨定：左牆物件的頂底邊線必定收斂至透視點，後牆物件保持水平垂直', () => {
    const room = calculateRoomSurfaces(DEFAULT_ROOM_FRAME, defaultCamera);

    // 左牆門錨定
    const leftDoorAnchor: WallAnchor = {
      wall: 'left',
      u: 0.2,
      v: 0.0,
      widthU: 0.25,
      heightV: 0.65
    };
    const doorCorners = projectWallObjectCorners(leftDoorAnchor, room.corners);
    const [, , pTR, pTL] = doorCorners;

    // 垂直邊線：pBL 與 pTL 的 X 必須保持垂直對齊 (或沿著同一垂直剖面)
    // 頂邊線 (pTL -> pTR) 朝深處延伸，必須與 VP 保持共線收斂
    const topEdgeArea = calculatePolygonSignedArea([
      pTL,
      pTR,
      { x: defaultCamera.vpX, y: defaultCamera.vpY }
    ]);
    expect(Math.abs(topEdgeArea)).toBeLessThan(1e-4);

    // 後牆掛畫錨定
    const backPaintingAnchor: WallAnchor = {
      wall: 'back',
      u: 0.3,
      v: 0.4,
      widthU: 0.4,
      heightV: 0.35
    };
    const paintingCorners = projectWallObjectCorners(backPaintingAnchor, room.corners);
    const [bBL, bBR, bTR, bTL] = paintingCorners;

    // 後牆掛畫頂邊必須嚴格水平
    expect(bTL.y).toBeCloseTo(bTR.y, 5);
    // 底邊嚴格水平
    expect(bBL.y).toBeCloseTo(bBR.y, 5);
    // 左右邊嚴格垂直
    expect(bTL.x).toBeCloseTo(bBL.x, 5);
    expect(bTR.x).toBeCloseTo(bBR.x, 5);
  });
});
