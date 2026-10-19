/**
 * 本機儲存與 JSON 匯出 / 匯入服務 (含嚴格結構驗證)
 */

import { SceneObject, PerspectiveCamera, ViewSettings } from '../models/types';
import { DEFAULT_CAMERA, DEFAULT_VIEW_SETTINGS, DEFAULT_CLASSROOM_OBJECTS } from '../models/defaultScenes';

const STORAGE_KEY = 'one_point_perspective_saved_scene_v1';

export interface SerializedScene {
  version: string;
  timestamp: number;
  camera: PerspectiveCamera;
  objects: SceneObject[];
  viewSettings: ViewSettings;
}

/**
 * 驗證並消毒匯入的 SceneObject 資料
 */
function validateAndSanitizeObject(raw: unknown, index: number): SceneObject | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;

  const id = typeof obj.id === 'string' && obj.id ? obj.id : `imported-obj-${Date.now()}-${index}`;
  const name = typeof obj.name === 'string' && obj.name ? obj.name : `物件 ${index + 1}`;
  const category = (['geometric', 'furniture', 'nature', 'custom'].includes(obj.category as string)
    ? obj.category
    : 'geometric') as SceneObject['category'];

  const x = Number.isFinite(obj.x) ? (obj.x as number) : 500;
  const y = Number.isFinite(obj.y) ? (obj.y as number) : 400;
  const z = Number.isFinite(obj.z) ? Math.max(0, obj.z as number) : 50;

  // 尺寸檢查
  const dimsRaw = (obj.dimensions || {}) as Record<string, unknown>;
  const width = Math.max(10, Math.min(800, Number.isFinite(dimsRaw.width) ? (dimsRaw.width as number) : 80));
  const height = Math.max(10, Math.min(800, Number.isFinite(dimsRaw.height) ? (dimsRaw.height as number) : 80));
  const depth = Math.max(5, Math.min(1200, Number.isFinite(dimsRaw.depth) ? (dimsRaw.depth as number) : 80));

  const color = typeof obj.color === 'string' && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(obj.color)
    ? obj.color
    : '#3B82F6';

  const geometryType = typeof obj.geometryType === 'string' && obj.geometryType ? obj.geometryType : 'cube';
  const order = Number.isFinite(obj.order) ? (obj.order as number) : index + 1;
  const isLocked = Boolean(obj.isLocked);
  const showGuidelines = Boolean(obj.showGuidelines);

  return {
    id,
    name,
    category,
    x,
    y,
    z,
    dimensions: { width, height, depth },
    color,
    geometryType,
    order,
    isLocked,
    showGuidelines
  };
}

/**
 * 驗證並消毒相機參數
 */
function validateCamera(raw: unknown): PerspectiveCamera {
  if (!raw || typeof raw !== 'object') return DEFAULT_CAMERA;
  const cam = raw as Record<string, unknown>;

  const canvasWidth = Number.isFinite(cam.canvasWidth) ? Math.max(400, cam.canvasWidth as number) : 1000;
  const canvasHeight = Number.isFinite(cam.canvasHeight) ? Math.max(300, cam.canvasHeight as number) : 650;
  const vpY = Number.isFinite(cam.vpY) ? Math.max(50, Math.min(canvasHeight - 50, cam.vpY as number)) : 320;
  const vpX = Number.isFinite(cam.vpX) ? Math.max(40, Math.min(canvasWidth - 40, cam.vpX as number)) : 500;
  const focalLength = Number.isFinite(cam.focalLength) ? Math.max(100, Math.min(2000, cam.focalLength as number)) : 550;

  return {
    vpX,
    vpY,
    focalLength,
    canvasWidth,
    canvasHeight
  };
}

/**
 * 驗證並消毒視圖開關
 */
function validateViewSettings(raw: unknown): ViewSettings {
  if (!raw || typeof raw !== 'object') return DEFAULT_VIEW_SETTINGS;
  const v = raw as Record<string, unknown>;

  return {
    showHorizonLine: v.showHorizonLine !== undefined ? Boolean(v.showHorizonLine) : true,
    showVanishingPoint: v.showVanishingPoint !== undefined ? Boolean(v.showVanishingPoint) : true,
    showPerspectiveLines: v.showPerspectiveLines !== undefined ? Boolean(v.showPerspectiveLines) : true,
    showGroundGrid: v.showGroundGrid !== undefined ? Boolean(v.showGroundGrid) : true,
    showDepthMarkers: v.showDepthMarkers !== undefined ? Boolean(v.showDepthMarkers) : true,
    gridSpacing: Number.isFinite(v.gridSpacing) ? (v.gridSpacing as number) : 50,
    gridDepthLines: Number.isFinite(v.gridDepthLines) ? (v.gridDepthLines as number) : 8
  };
}

/**
 * 儲存場景至 LocalStorage
 */
export function saveSceneToLocal(camera: PerspectiveCamera, objects: SceneObject[], viewSettings: ViewSettings): boolean {
  try {
    const payload: SerializedScene = {
      version: '1.0.0',
      timestamp: Date.now(),
      camera,
      objects,
      viewSettings
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
    return false;
  }
}

/**
 * 從 LocalStorage 載入場景
 */
export function loadSceneFromLocal(): { camera: PerspectiveCamera; objects: SceneObject[]; viewSettings: ViewSettings } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const camera = validateCamera(parsed.camera);
    const viewSettings = validateViewSettings(parsed.viewSettings);
    const objects: SceneObject[] = [];

    if (Array.isArray(parsed.objects)) {
      parsed.objects.forEach((item: unknown, idx: number) => {
        const validated = validateAndSanitizeObject(item, idx);
        if (validated) objects.push(validated);
      });
    }

    return { camera, objects, viewSettings };
  } catch (err) {
    console.error('Failed to load from localStorage:', err);
    return null;
  }
}

/**
 * 匯出場景為 JSON 檔案下載
 */
export function exportSceneAsJSON(camera: PerspectiveCamera, objects: SceneObject[], viewSettings: ViewSettings): void {
  const payload: SerializedScene = {
    version: '1.0.0',
    timestamp: Date.now(),
    camera,
    objects,
    viewSettings
  };
  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `單點透視作品_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 解析並驗證匯入之 JSON 字串
 */
export function parseAndValidateImportedJSON(jsonStr: string): {
  success: boolean;
  data?: { camera: PerspectiveCamera; objects: SceneObject[]; viewSettings: ViewSettings };
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: '檔案格式不符，請選擇有效的單點透視作品 JSON 檔案。' };
    }

    const camera = validateCamera(parsed.camera);
    const viewSettings = validateViewSettings(parsed.viewSettings);
    const objects: SceneObject[] = [];

    if (Array.isArray(parsed.objects)) {
      parsed.objects.forEach((item: unknown, idx: number) => {
        const validated = validateAndSanitizeObject(item, idx);
        if (validated) objects.push(validated);
      });
    }

    if (objects.length === 0) {
      return {
        success: true,
        data: { camera, objects: DEFAULT_CLASSROOM_OBJECTS, viewSettings }
      };
    }

    return {
      success: true,
      data: { camera, objects, viewSettings }
    };
  } catch (err) {
    return {
      success: false,
      error: `檔案解析失敗：${err instanceof Error ? err.message : '非法的 JSON 結構'}`
    };
  }
}
