import { describe, it, expect } from 'vitest';
import { TEACHING_MISSIONS } from './missions';
import { SceneState } from './types';
import { DEFAULT_CAMERA, DEFAULT_VIEW_SETTINGS } from './defaultScenes';

describe('教學任務狀態驗證器單元測試 (Mission Validators Tests)', () => {
  const baseScene: SceneState = {
    camera: { ...DEFAULT_CAMERA },
    objects: [],
    selectedObjectId: null,
    viewSettings: { ...DEFAULT_VIEW_SETTINGS, showPerspectiveLines: false },
    mode: 'mission',
    currentMissionId: 'mission-1',
    history: { past: [], future: [] }
  };

  it('任務 1 驗證：透視點移動檢查', () => {
    const validator = TEACHING_MISSIONS[0].steps[0].validator;

    // 初始狀態在中央 (500) -> 失敗
    expect(validator({ ...baseScene, camera: { ...DEFAULT_CAMERA, vpX: 500 } })).toBe(false);

    // 微小移動 (520, 差值20 < 70) -> 失敗
    expect(validator({ ...baseScene, camera: { ...DEFAULT_CAMERA, vpX: 520 } })).toBe(false);

    // 明顯移動至 600 (差值 100 >= 70) -> 成功
    expect(validator({ ...baseScene, camera: { ...DEFAULT_CAMERA, vpX: 600 } })).toBe(true);

    // 明顯移動至 350 (差值 150 >= 70) -> 成功
    expect(validator({ ...baseScene, camera: { ...DEFAULT_CAMERA, vpX: 350 } })).toBe(true);
  });

  it('任務 2 驗證：透視輔助線開啟檢查', () => {
    const validator = TEACHING_MISSIONS[1].steps[0].validator;

    // 無方塊、無輔助線 -> 失敗
    expect(validator(baseScene)).toBe(false);

    // 有方塊但未開啟透視線 -> 失敗
    const sceneWithCube: SceneState = {
      ...baseScene,
      objects: [
        {
          id: 'c1',
          name: '方塊',
          category: 'geometric',
          geometryType: 'cube',
          x: 400,
          y: 400,
          z: 50,
          dimensions: { width: 80, height: 80, depth: 80 },
          color: '#3B82F6',
          order: 1,
          showGuidelines: false
        }
      ]
    };
    expect(validator(sceneWithCube)).toBe(false);

    // 開啟全域透視輔助線 -> 成功
    expect(validator({
      ...sceneWithCube,
      viewSettings: { ...sceneWithCube.viewSettings, showPerspectiveLines: true }
    })).toBe(true);

    // 或個別方塊開啟透視線 -> 成功
    expect(validator({
      ...sceneWithCube,
      objects: [{ ...sceneWithCube.objects[0], showGuidelines: true }]
    })).toBe(true);
  });

  it('任務 3 驗證：近大遠小真實條件檢查 (同尺寸方塊、不同深度、投影縮小)', () => {
    const validator = TEACHING_MISSIONS[2].steps[0].validator;

    // 只有一個方塊 -> 失敗
    const singleCubeScene: SceneState = {
      ...baseScene,
      objects: [
        {
          id: 'c1',
          name: '方塊1',
          category: 'geometric',
          geometryType: 'cube',
          x: 300,
          y: 450,
          z: 50,
          dimensions: { width: 100, height: 100, depth: 100 },
          color: '#3B82F6',
          order: 1
        }
      ]
    };
    expect(validator(singleCubeScene)).toBe(false);

    // 兩個方塊但深度相同 (z=50) -> 失敗
    const sameDepthScene: SceneState = {
      ...baseScene,
      objects: [
        singleCubeScene.objects[0],
        {
          id: 'c2',
          name: '方塊2',
          category: 'geometric',
          geometryType: 'cube',
          x: 600,
          y: 450,
          z: 50,
          dimensions: { width: 100, height: 100, depth: 100 },
          color: '#10B981',
          order: 2
        }
      ]
    };
    expect(validator(sameDepthScene)).toBe(false);

    // 兩個方塊但尺寸不同 (寬度 100 vs 50) -> 失敗 (不可只靠改變物體尺寸作弊)
    const cheatScene: SceneState = {
      ...baseScene,
      objects: [
        singleCubeScene.objects[0],
        {
          id: 'c2',
          name: '作弊縮小方塊',
          category: 'geometric',
          geometryType: 'cube',
          x: 600,
          y: 450,
          z: 300,
          dimensions: { width: 50, height: 50, depth: 50 }, // 物理尺寸不同
          color: '#10B981',
          order: 2
        }
      ]
    };
    expect(validator(cheatScene)).toBe(false);

    // 正確情況：物理尺寸相同 (100x100x100)，深度差顯著 (50 vs 350, 差 300 >= 180) -> 成功！
    const validNearFarScene: SceneState = {
      ...baseScene,
      objects: [
        singleCubeScene.objects[0],
        {
          id: 'c2',
          name: '遠處同尺寸方塊',
          category: 'geometric',
          geometryType: 'cube',
          x: 600,
          y: 450,
          z: 350,
          dimensions: { width: 100, height: 100, depth: 100 },
          color: '#10B981',
          order: 2
        }
      ]
    };
    expect(validator(validNearFarScene)).toBe(true);
  });

  it('任務 4 驗證：隊列由近到遠深度依序遞增 (>= 3 個方塊)', () => {
    const validator = TEACHING_MISSIONS[3].steps[0].validator;

    // 只有 2 個方塊 -> 失敗
    const twoCubesScene: SceneState = {
      ...baseScene,
      objects: [
        { id: '1', name: '1', category: 'geometric', geometryType: 'cube', x: 200, y: 400, z: 0, dimensions: { width: 50, height: 50, depth: 50 }, color: '#333', order: 1 },
        { id: '2', name: '2', category: 'geometric', geometryType: 'cube', x: 200, y: 400, z: 120, dimensions: { width: 50, height: 50, depth: 50 }, color: '#333', order: 2 }
      ]
    };
    expect(validator(twoCubesScene)).toBe(false);

    // 3 個方塊，深度階梯漸進：Z=50, 180, 320 (相鄰差距均 >= 90) -> 成功！
    const threeCubesScene: SceneState = {
      ...baseScene,
      objects: [
        ...twoCubesScene.objects,
        { id: '3', name: '3', category: 'geometric', geometryType: 'cube', x: 200, y: 400, z: 250, dimensions: { width: 50, height: 50, depth: 50 }, color: '#333', order: 3 }
      ]
    };
    expect(validator(threeCubesScene)).toBe(true);
  });

  it('任務 5 驗證：透視教室佈置 (包含課桌、椅子與其他生活家具)', () => {
    const validator = TEACHING_MISSIONS[4].steps[0].validator;

    // 只有課桌與椅子 (缺少置物櫃/窗戶等第三件家具) -> 失敗
    const deskAndChairOnly: SceneState = {
      ...baseScene,
      objects: [
        { id: 'd', name: '課桌', category: 'furniture', geometryType: 'desk', x: 600, y: 480, z: 50, dimensions: { width: 100, height: 80, depth: 80 }, color: '#d97706', order: 1 },
        { id: 'c', name: '椅子', category: 'furniture', geometryType: 'chair', x: 600, y: 490, z: 10, dimensions: { width: 50, height: 80, depth: 50 }, color: '#b45309', order: 2 }
      ]
    };
    expect(validator(deskAndChairOnly)).toBe(false);

    // 加上窗戶 (window) 與櫃子 (cabinet) -> 成功！
    const completeClassroom: SceneState = {
      ...baseScene,
      objects: [
        ...deskAndChairOnly.objects,
        { id: 'w', name: '窗戶', category: 'furniture', geometryType: 'window', x: 200, y: 280, z: 150, dimensions: { width: 80, height: 100, depth: 15 }, color: '#38bdf8', order: 3 }
      ]
    };
    expect(validator(completeClassroom)).toBe(true);
  });
});
