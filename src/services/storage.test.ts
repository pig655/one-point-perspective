import { describe, it, expect } from 'vitest';
import { parseAndValidateImportedJSON } from './storage';
import { DEFAULT_CAMERA, DEFAULT_VIEW_SETTINGS } from '../models/defaultScenes';
import { SceneObject } from '../models/types';

describe('儲存與 JSON 匯入安全性測試 (Storage & Import Validation Tests)', () => {
  it('1. 成功解析合法的單點透視場景 JSON', () => {
    const validPayload = {
      version: '1.0.0',
      timestamp: Date.now(),
      camera: DEFAULT_CAMERA,
      viewSettings: DEFAULT_VIEW_SETTINGS,
      objects: [
        {
          id: 'test-obj-1',
          name: '測試方塊',
          category: 'geometric',
          x: 400,
          y: 450,
          z: 100,
          dimensions: { width: 90, height: 90, depth: 90 },
          color: '#3B82F6',
          geometryType: 'cube',
          order: 1
        }
      ]
    };

    const res = parseAndValidateImportedJSON(JSON.stringify(validPayload));
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    expect(res.data?.objects.length).toBe(1);
    expect(res.data?.objects[0].name).toBe('測試方塊');
    expect(res.data?.camera.vpX).toBe(500);
  });

  it('2. 防禦性處理：遇到惡意或損毀的 JSON 字串時拒絕並回傳清楚錯誤', () => {
    const corruptedJSON = '{ "version": "1.0.0", invalid }';
    const res = parseAndValidateImportedJSON(corruptedJSON);
    expect(res.success).toBe(false);
    expect(res.error).toContain('檔案解析失敗');
  });

  it('3. 消毒與修復：物件缺少必要欄位或含有 NaN/無效值時自動重設為安全預設值', () => {
    const dirtyPayload = {
      camera: {
        vpX: 'invalid', // 非法
        vpY: 320,
        focalLength: -500 // 非法負焦距
      },
      objects: [
        {
          id: '',
          name: 12345, // 型別錯誤
          x: NaN,
          y: Infinity,
          z: -100, // 深度為負
          dimensions: { width: -50, height: 'abc', depth: 99999 },
          color: 'not-a-color'
        }
      ]
    };

    const res = parseAndValidateImportedJSON(JSON.stringify(dirtyPayload));
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();

    const obj = res.data?.objects[0] as SceneObject;
    expect(obj).toBeDefined();
    // 檢查消毒結果
    expect(obj.x).toBe(500);
    expect(obj.y).toBe(400);
    expect(obj.z).toBe(0); // 深度不能為負，被防呆修正為 0
    expect(obj.dimensions.width).toBeGreaterThanOrEqual(10); // 寬度被防呆限制
    expect(obj.color).toBe('#3B82F6'); // 顏色回復預設 HEX
    expect(res.data?.camera.vpX).toBe(500);
    expect(res.data?.camera.focalLength).toBeGreaterThanOrEqual(100);
  });
});
