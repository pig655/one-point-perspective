import { describe, it, expect } from 'vitest';
import { ROOM_MISSIONS, BASIC_MISSIONS } from './missions';
import { SceneState } from './types';
import { DEFAULT_CAMERA, DEFAULT_VIEW_SETTINGS, DEFAULT_ROOM_FRAME, DEFAULT_ROOM_COLORS } from './defaultScenes';

describe('教學任務狀態驗證器單元測試 (Room & Basic Mission Validators)', () => {
  const baseScene: SceneState = {
    mainMode: 'room',
    roomSubMode: 'furnish',
    camera: { ...DEFAULT_CAMERA },
    roomFrame: { ...DEFAULT_ROOM_FRAME },
    roomColors: { ...DEFAULT_ROOM_COLORS },
    objects: [],
    selectedObjectId: null,
    viewSettings: { ...DEFAULT_VIEW_SETTINGS, showFloorLines: false, renderStyle: 'wireframe' },
    mode: 'mission',
    currentMissionId: 'room-mission-1',
    history: { past: [], future: [] }
  };

  describe('室內空間透視 8 大任務驗證', () => {
    it('房間任務 1：找出透視點 (VP 偏離中央 >= 60px)', () => {
      const v = ROOM_MISSIONS[0].steps[0].validator;
      expect(v({ ...baseScene, camera: { ...DEFAULT_CAMERA, vpX: 500 } })).toBe(false);
      expect(v({ ...baseScene, camera: { ...DEFAULT_CAMERA, vpX: 530 } })).toBe(false);
      expect(v({ ...baseScene, camera: { ...DEFAULT_CAMERA, vpX: 580 } })).toBe(true);
      expect(v({ ...baseScene, camera: { ...DEFAULT_CAMERA, vpX: 420 } })).toBe(true);
    });

    it('房間任務 2：移動透視點觀察兩側牆面 (VP <= 400 或 >= 600)', () => {
      const v = ROOM_MISSIONS[1].steps[0].validator;
      expect(v({ ...baseScene, camera: { ...DEFAULT_CAMERA, vpX: 500 } })).toBe(false);
      expect(v({ ...baseScene, camera: { ...DEFAULT_CAMERA, vpX: 450 } })).toBe(false);
      expect(v({ ...baseScene, camera: { ...DEFAULT_CAMERA, vpX: 380 } })).toBe(true);
      expect(v({ ...baseScene, camera: { ...DEFAULT_CAMERA, vpX: 620 } })).toBe(true);
    });

    it('房間任務 3：顯示地板透視線 (showFloorLines === true)', () => {
      const v = ROOM_MISSIONS[2].steps[0].validator;
      expect(v(baseScene)).toBe(false);
      expect(v({ ...baseScene, viewSettings: { ...baseScene.viewSettings, showFloorLines: true } })).toBe(true);
    });

    it('房間任務 4：在後牆加入掛畫 (wallAnchor.wall === back)', () => {
      const v = ROOM_MISSIONS[3].steps[0].validator;
      expect(v(baseScene)).toBe(false);

      // 錯誤牆面 (放在左牆) -> 失敗
      const wrongWall = {
        ...baseScene,
        objects: [
          {
            id: 'p1',
            name: '掛畫',
            category: 'wall' as const,
            geometryType: 'landscape-painting',
            x: 0, y: 0, z: 0, dimensions: { width: 100, height: 80, depth: 5 }, color: '#333', order: 1,
            wallAnchor: { wall: 'left' as const, u: 0.3, v: 0.4, widthU: 0.3, heightV: 0.3 }
          }
        ]
      };
      expect(v(wrongWall)).toBe(false);

      // 正確放在後牆 -> 成功
      const correctWall = {
        ...baseScene,
        objects: [
          {
            ...wrongWall.objects[0],
            wallAnchor: { wall: 'back' as const, u: 0.3, v: 0.4, widthU: 0.3, heightV: 0.3 }
          }
        ]
      };
      expect(v(correctWall)).toBe(true);
    });

    it('房間任務 5：在左牆加入實木門 (wallAnchor.wall === left && geometryType === room-door)', () => {
      const v = ROOM_MISSIONS[4].steps[0].validator;
      expect(v(baseScene)).toBe(false);

      const sceneWithDoor = {
        ...baseScene,
        objects: [
          {
            id: 'd1',
            name: '門',
            category: 'wall' as const,
            geometryType: 'room-door',
            x: 0, y: 0, z: 0, dimensions: { width: 90, height: 180, depth: 8 }, color: '#888', order: 1,
            wallAnchor: { wall: 'left' as const, u: 0.2, v: 0.0, widthU: 0.25, heightV: 0.7 }
          }
        ]
      };
      expect(v(sceneWithDoor)).toBe(true);
    });

    it('房間任務 6：在右牆加入直向掛畫 (wallAnchor.wall === right)', () => {
      const v = ROOM_MISSIONS[5].steps[0].validator;
      expect(v(baseScene)).toBe(false);

      const sceneWithPortrait = {
        ...baseScene,
        objects: [
          {
            id: 'p2',
            name: '直向掛畫',
            category: 'wall' as const,
            geometryType: 'portrait-painting',
            x: 0, y: 0, z: 0, dimensions: { width: 70, height: 120, depth: 5 }, color: '#a855f7', order: 1,
            wallAnchor: { wall: 'right' as const, u: 0.3, v: 0.3, widthU: 0.2, heightV: 0.4 }
          }
        ]
      };
      expect(v(sceneWithPortrait)).toBe(true);
    });

    it('房間任務 7：在地板加入家具或植物 (!wallAnchor && furniture/nature)', () => {
      const v = ROOM_MISSIONS[6].steps[0].validator;
      expect(v(baseScene)).toBe(false);

      const sceneWithDesk = {
        ...baseScene,
        objects: [
          {
            id: 'desk1',
            name: '書桌',
            category: 'furniture' as const,
            geometryType: 'room-desk',
            x: 500, y: 450, z: 300, dimensions: { width: 120, height: 80, depth: 80 }, color: '#d97706', order: 1,
            roomFloorX: 0.5, roomFloorZ: 0.4
          }
        ]
      };
      expect(v(sceneWithDesk)).toBe(true);
    });

    it('房間任務 8：完成房間著色 (renderStyle === colored 或自訂地板色)', () => {
      const v = ROOM_MISSIONS[7].steps[0].validator;
      expect(v(baseScene)).toBe(false);
      expect(v({ ...baseScene, viewSettings: { ...baseScene.viewSettings, renderStyle: 'colored' } })).toBe(true);
      expect(v({ ...baseScene, roomColors: { ...baseScene.roomColors, floor: '#b45309' } })).toBe(true);
      expect(v({ ...baseScene, roomSubMode: 'color' })).toBe(true);
    });
  });

  describe('基礎透視練習 5 大任務驗證', () => {
    it('基礎任務 1：透視點移動檢查', () => {
      const v = BASIC_MISSIONS[0].steps[0].validator;
      expect(v({ ...baseScene, camera: { ...DEFAULT_CAMERA, vpX: 500 } })).toBe(false);
      expect(v({ ...baseScene, camera: { ...DEFAULT_CAMERA, vpX: 600 } })).toBe(true);
    });

    it('基礎任務 2：透視輔助線開啟檢查', () => {
      const v = BASIC_MISSIONS[1].steps[0].validator;
      expect(v(baseScene)).toBe(false);
      const sceneWithCube: SceneState = {
        ...baseScene,
        objects: [
          {
            id: 'c1', name: '方塊', category: 'geometric', geometryType: 'cube',
            x: 400, y: 400, z: 50, dimensions: { width: 80, height: 80, depth: 80 }, color: '#3B82F6', order: 1, showGuidelines: true
          }
        ]
      };
      expect(v(sceneWithCube)).toBe(true);
    });
  });
});
