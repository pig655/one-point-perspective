import { describe, it, expect } from 'vitest';
import {
  calculatePerspectiveScale,
  project3DTo2D,
  clampVanishingPoint,
  calculatePolygonSignedArea
} from './perspective';
import { projectSceneObject } from './geometry';
import { PerspectiveCamera, SceneObject } from '../models/types';

describe('單點透視核心數學模組測試 (Perspective Core Unit Tests)', () => {
  const defaultCamera: PerspectiveCamera = {
    vpX: 500,
    vpY: 300,
    focalLength: 500,
    canvasWidth: 1000,
    canvasHeight: 600
  };

  it('1. 驗證近大遠小：同一物件在更遠深度下，投影尺寸依透視模型嚴格縮小', () => {
    const focal = 500;
    const scaleNear = calculatePerspectiveScale(0, focal);
    const scaleMid = calculatePerspectiveScale(500, focal);
    const scaleFar = calculatePerspectiveScale(1000, focal);

    expect(scaleNear).toBe(1.0);
    expect(scaleMid).toBe(0.5); // 500 / (500 + 500) = 0.5
    expect(scaleFar).toBeCloseTo(0.3333, 3); // 500 / (500 + 1000) = 1/3

    // 檢查物件投影寬度
    const objNear: SceneObject = {
      id: 'test-1',
      name: '近處方塊',
      category: 'geometric',
      x: 300,
      y: 450,
      z: 0,
      dimensions: { width: 100, height: 100, depth: 100 },
      color: '#3b82f6',
      geometryType: 'cube',
      order: 1
    };

    const objFar: SceneObject = {
      ...objNear,
      id: 'test-2',
      name: '遠處方塊',
      z: 500
    };

    const projNear = projectSceneObject(objNear, defaultCamera, false);
    const projFar = projectSceneObject(objFar, defaultCamera, false);

    // 深度較遠的方塊，其正面頂點寬度應正好為近處的 0.5 倍
    const frontWidthNear = Math.abs(projNear.projectedVertices[1].x - projNear.projectedVertices[0].x);
    const frontWidthFar = Math.abs(projFar.projectedVertices[1].x - projFar.projectedVertices[0].x);

    expect(frontWidthNear).toBe(100);
    expect(frontWidthFar).toBe(50);
    expect(projFar.boundingBox.width).toBeLessThan(projNear.boundingBox.width);
    expect(projFar.boundingBox.height).toBeLessThan(projNear.boundingBox.height);
  });

  it('2. 驗證透視收斂：同方向的深度邊線必須準確收斂至透視點 (VP)', () => {
    // 建立一個方塊，其深度邊線從 z=0 延伸至 z=1000
    const obj: SceneObject = {
      id: 'test-cube',
      name: '測試方塊',
      category: 'geometric',
      x: 200,
      y: 500,
      z: 0,
      dimensions: { width: 80, height: 80, depth: 800 },
      color: '#10b981',
      geometryType: 'cube',
      order: 1
    };

    const proj = projectSceneObject(obj, defaultCamera, false);

    // 深度邊線：如 [0, 4]（前左下到後左下）、[1, 5]（前右下到後右下）
    // 檢查每條深度線延伸後必定穿過 (vpX, vpY)
    const p0 = proj.projectedVertices[0]; // 前左下
    const p4 = proj.projectedVertices[4]; // 後左下

    // 斜率檢查：(p4.y - p0.y) / (p4.x - p0.x) 必須等於 (vpY - p0.y) / (vpX - p0.x)
    const slopeToBack = (p4.y - p0.y) / (p4.x - p0.x);
    const slopeToVP = (defaultCamera.vpY - p0.y) / (defaultCamera.vpX - p0.x);
    expect(slopeToBack).toBeCloseTo(slopeToVP, 5);

    // 亦即三點共線：(x0, y0), (x4, y4), (vpX, vpY) 之三角形面積為 0
    const colinearArea = calculatePolygonSignedArea([
      { x: p0.x, y: p0.y },
      { x: p4.x, y: p4.y },
      { x: defaultCamera.vpX, y: defaultCamera.vpY }
    ]);
    expect(Math.abs(colinearArea)).toBeLessThan(1e-4);
  });

  it('3. 驗證透視點連動：移動透視點後，相關投影與角度即時同步更新', () => {
    const obj: SceneObject = {
      id: 'test-cube-2',
      name: '測試方塊2',
      category: 'geometric',
      x: 350,
      y: 400,
      z: 50,
      dimensions: { width: 100, height: 100, depth: 100 },
      color: '#f59e0b',
      geometryType: 'cube',
      order: 1
    };

    const cameraAt500: PerspectiveCamera = { ...defaultCamera, vpX: 500 };
    const cameraAt700: PerspectiveCamera = { ...defaultCamera, vpX: 700 };

    const projAt500 = projectSceneObject(obj, cameraAt500, false);
    const projAt700 = projectSceneObject(obj, cameraAt700, false);

    // 移動透視點 X 座標後，頂點之 X 座標必定發生對應的透視偏移
    expect(projAt500.projectedVertices[4].x).not.toBe(projAt700.projectedVertices[4].x);

    // 當透視點從 500 移至 700（往右移），後方頂點將被拉向右側
    expect(projAt700.projectedVertices[4].x).toBeGreaterThan(projAt500.projectedVertices[4].x);

    // 驗證寬度保持一致 (正面寬度只取決於實際寬度與該深度之 scale，不受 VP 水平位置拉伸)
    const frontWidthAt500 = projAt500.projectedVertices[1].x - projAt500.projectedVertices[0].x;
    const frontWidthAt700 = projAt700.projectedVertices[1].x - projAt700.projectedVertices[0].x;
    expect(frontWidthAt500).toBeCloseTo(frontWidthAt700, 5);

    // 若物件在 z=0 (畫面基準面)，正面頂點完全不受 VP 移動影響
    const objAtZeroZ: SceneObject = { ...obj, z: 0 };
    const projZeroAt500 = projectSceneObject(objAtZeroZ, cameraAt500, false);
    const projZeroAt700 = projectSceneObject(objAtZeroZ, cameraAt700, false);
    expect(projZeroAt500.projectedVertices[0].x).toBe(projZeroAt700.projectedVertices[0].x);
    expect(projZeroAt500.projectedVertices[1].x).toBe(projZeroAt700.projectedVertices[1].x);
  });

  it('4. 驗證重現性：同樣的世界座標與相機參數，得到完全可重現的數值', () => {
    const pt = { x: 345.67, y: 123.45, z: 250 };
    const result1 = project3DTo2D(pt, defaultCamera);
    const result2 = project3DTo2D(pt, defaultCamera);

    expect(result1.x).toBe(result2.x);
    expect(result1.y).toBe(result2.y);
    expect(result1.scale).toBe(result2.scale);
  });

  it('5. 邊界與極限值安全：接近透視點、超大深度或負數時，不會產生 NaN 或崩潰', () => {
    // 深度極大
    const farPoint = { x: 100, y: 200, z: 9999999 };
    const resFar = project3DTo2D(farPoint, defaultCamera);
    expect(Number.isFinite(resFar.x)).toBe(true);
    expect(Number.isFinite(resFar.y)).toBe(true);
    expect(resFar.x).toBeCloseTo(defaultCamera.vpX, 1);
    expect(resFar.y).toBeCloseTo(defaultCamera.vpY, 1);

    // 深度為負數（防呆為 0）
    const negPoint = { x: 100, y: 200, z: -50 };
    const resNeg = project3DTo2D(negPoint, defaultCamera);
    expect(resNeg.scale).toBe(1.0);
    expect(Number.isFinite(resNeg.x)).toBe(true);

    // 焦距異常為 0 或負數
    const scaleZeroFocal = calculatePerspectiveScale(100, 0);
    expect(Number.isFinite(scaleZeroFocal)).toBe(true);
    expect(scaleZeroFocal).toBeGreaterThan(0);

    // 透視點限制於邊界內
    const clampedVpMin = clampVanishingPoint(-100, 1000, 50);
    const clampedVpMax = clampVanishingPoint(1500, 1000, 50);
    expect(clampedVpMin).toBe(50);
    expect(clampedVpMax).toBe(950);
  });

  it('6. 驗證新加入物件改變尺寸時，投影頂點與包圍盒即時動態更新 (防止尺寸改變失效)', () => {
    // 模擬從素材庫新加入一張課桌
    const deskObj: SceneObject = {
      id: 'obj-desk-new',
      name: '學生課桌',
      category: 'furniture',
      x: 500,
      y: 470,
      z: 100,
      dimensions: { width: 110, height: 75, depth: 80 },
      color: '#D97706',
      geometryType: 'desk',
      order: 1
    };

    // 初始投影
    const projBefore = projectSceneObject(deskObj, defaultCamera, false);
    const widthBefore = projBefore.boundingBox.width;
    const heightBefore = projBefore.boundingBox.height;

    // 學生在面板上將課桌寬度調整為 220 (原本兩倍)，高度調整為 150
    const updatedDeskObj: SceneObject = {
      ...deskObj,
      dimensions: { width: 220, height: 150, depth: 160 }
    };

    const projAfter = projectSceneObject(updatedDeskObj, defaultCamera, false);
    const widthAfter = projAfter.boundingBox.width;
    const heightAfter = projAfter.boundingBox.height;

    // 驗證投影後的包圍盒寬度與高度皆明顯放大 (寬度約 2 倍，高度在考慮透視頂面縮小後約 1.8 倍)
    expect(widthAfter).toBeGreaterThan(widthBefore * 1.8);
    expect(heightAfter).toBeGreaterThan(heightBefore * 1.7);
  });
});
