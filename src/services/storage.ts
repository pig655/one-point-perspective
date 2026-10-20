/**
 * 本機儲存與 JSON 匯出 / 匯入服務 (含室內空間與嚴格結構驗證)
 */

import {
  SceneObject,
  PerspectiveCamera,
  ViewSettings,
  RoomColors,
  RoomFrame,
  MainMode,
  RoomSubMode
} from '../models/types';
import {
  DEFAULT_CAMERA,
  DEFAULT_VIEW_SETTINGS,
  DEFAULT_ROOM_FRAME,
  DEFAULT_ROOM_COLORS,
  DEFAULT_ROOM_OBJECTS
} from '../models/defaultScenes';

const STORAGE_KEY = 'one_point_perspective_learning_v2';

export interface SerializedScene {
  version: string;
  timestamp: number;
  mainMode: MainMode;
  roomSubMode: RoomSubMode;
  camera: PerspectiveCamera;
  roomFrame: RoomFrame;
  roomColors: RoomColors;
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
  const category = (['geometric', 'furniture', 'nature', 'wall', 'custom'].includes(obj.category as string)
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

  const secondaryColor = typeof obj.secondaryColor === 'string' ? obj.secondaryColor : undefined;
  const strokeColor = typeof obj.strokeColor === 'string' ? obj.strokeColor : undefined;
  const geometryType = typeof obj.geometryType === 'string' && obj.geometryType ? obj.geometryType : 'cube';
  const order = Number.isFinite(obj.order) ? (obj.order as number) : index + 1;
  const isLocked = Boolean(obj.isLocked);
  const showGuidelines = Boolean(obj.showGuidelines);

  // 牆面錨定檢查
  let wallAnchor = undefined;
  if (obj.wallAnchor && typeof obj.wallAnchor === 'object') {
    const wa = obj.wallAnchor as Record<string, unknown>;
    const wall = (['left', 'right', 'back'].includes(wa.wall as string) ? wa.wall : 'back') as 'left' | 'right' | 'back';
    const u = Number.isFinite(wa.u) ? Math.max(0, Math.min(1, wa.u as number)) : 0.3;
    const v = Number.isFinite(wa.v) ? Math.max(0, Math.min(1, wa.v as number)) : 0.3;
    const widthU = Number.isFinite(wa.widthU) ? Math.max(0.05, Math.min(1, wa.widthU as number)) : 0.3;
    const heightV = Number.isFinite(wa.heightV) ? Math.max(0.05, Math.min(1, wa.heightV as number)) : 0.3;
    wallAnchor = { wall, u, v, widthU, heightV };
  }

  const roomFloorX = Number.isFinite(obj.roomFloorX) ? (obj.roomFloorX as number) : undefined;
  const roomFloorZ = Number.isFinite(obj.roomFloorZ) ? (obj.roomFloorZ as number) : undefined;

  return {
    id,
    name,
    category,
    x,
    y,
    z,
    dimensions: { width, height, depth },
    color,
    secondaryColor,
    strokeColor,
    geometryType,
    order,
    isLocked,
    showGuidelines,
    wallAnchor,
    roomFloorX,
    roomFloorZ
  };
}

/**
 * 驗證相機
 */
function validateCamera(raw: unknown): PerspectiveCamera {
  if (!raw || typeof raw !== 'object') return DEFAULT_CAMERA;
  const cam = raw as Record<string, unknown>;
  const canvasWidth = Number.isFinite(cam.canvasWidth) ? Math.max(400, cam.canvasWidth as number) : 1000;
  const canvasHeight = Number.isFinite(cam.canvasHeight) ? Math.max(300, cam.canvasHeight as number) : 650;
  const vpY = Number.isFinite(cam.vpY) ? Math.max(50, Math.min(canvasHeight - 50, cam.vpY as number)) : 320;
  const vpX = Number.isFinite(cam.vpX) ? Math.max(40, Math.min(canvasWidth - 40, cam.vpX as number)) : 500;
  const focalLength = Number.isFinite(cam.focalLength) ? Math.max(100, Math.min(2000, cam.focalLength as number)) : 550;

  return { vpX, vpY, focalLength, canvasWidth, canvasHeight };
}

/**
 * 驗證視圖開關
 */
function validateViewSettings(raw: unknown): ViewSettings {
  if (!raw || typeof raw !== 'object') return DEFAULT_VIEW_SETTINGS;
  const v = raw as Record<string, unknown>;

  const renderStyle = ['wireframe', 'guidelines', 'clean', 'colored'].includes(v.renderStyle as string)
    ? (v.renderStyle as ViewSettings['renderStyle'])
    : 'colored';

  return {
    showHorizonLine: v.showHorizonLine !== undefined ? Boolean(v.showHorizonLine) : true,
    showVanishingPoint: v.showVanishingPoint !== undefined ? Boolean(v.showVanishingPoint) : true,
    showPerspectiveLines: v.showPerspectiveLines !== undefined ? Boolean(v.showPerspectiveLines) : true,
    showGroundGrid: v.showGroundGrid !== undefined ? Boolean(v.showGroundGrid) : true,
    showFloorLines: v.showFloorLines !== undefined ? Boolean(v.showFloorLines) : true,
    showCeilingLines: v.showCeilingLines !== undefined ? Boolean(v.showCeilingLines) : true,
    showWallLines: v.showWallLines !== undefined ? Boolean(v.showWallLines) : true,
    renderStyle,
    gridSpacing: Number.isFinite(v.gridSpacing) ? (v.gridSpacing as number) : 50,
    gridDepthLines: Number.isFinite(v.gridDepthLines) ? (v.gridDepthLines as number) : 8
  };
}

/**
 * 驗證房間色彩
 */
function validateRoomColors(raw: unknown): RoomColors {
  if (!raw || typeof raw !== 'object') return DEFAULT_ROOM_COLORS;
  const c = raw as Record<string, unknown>;
  return {
    leftWall: typeof c.leftWall === 'string' ? c.leftWall : DEFAULT_ROOM_COLORS.leftWall,
    rightWall: typeof c.rightWall === 'string' ? c.rightWall : DEFAULT_ROOM_COLORS.rightWall,
    backWall: typeof c.backWall === 'string' ? c.backWall : DEFAULT_ROOM_COLORS.backWall,
    ceiling: typeof c.ceiling === 'string' ? c.ceiling : DEFAULT_ROOM_COLORS.ceiling,
    floor: typeof c.floor === 'string' ? c.floor : DEFAULT_ROOM_COLORS.floor
  };
}

export function saveSceneToLocal(
  mainMode: MainMode,
  roomSubMode: RoomSubMode,
  camera: PerspectiveCamera,
  roomFrame: RoomFrame,
  roomColors: RoomColors,
  objects: SceneObject[],
  viewSettings: ViewSettings
): boolean {
  try {
    const payload: SerializedScene = {
      version: '2.0.0',
      timestamp: Date.now(),
      mainMode,
      roomSubMode,
      camera,
      roomFrame,
      roomColors,
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

export function loadSceneFromLocal(): {
  mainMode: MainMode;
  roomSubMode: RoomSubMode;
  camera: PerspectiveCamera;
  roomFrame: RoomFrame;
  roomColors: RoomColors;
  objects: SceneObject[];
  viewSettings: ViewSettings;
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const mainMode: MainMode = parsed.mainMode === 'basic' ? 'basic' : 'room';
    const roomSubMode: RoomSubMode = ['empty', 'furnish', 'color'].includes(parsed.roomSubMode)
      ? parsed.roomSubMode
      : 'furnish';
    const camera = validateCamera(parsed.camera);
    const roomFrame = parsed.roomFrame || DEFAULT_ROOM_FRAME;
    const roomColors = validateRoomColors(parsed.roomColors);
    const viewSettings = validateViewSettings(parsed.viewSettings);
    const objects: SceneObject[] = [];

    if (Array.isArray(parsed.objects)) {
      parsed.objects.forEach((item: unknown, idx: number) => {
        const validated = validateAndSanitizeObject(item, idx);
        if (validated) objects.push(validated);
      });
    }

    return {
      mainMode,
      roomSubMode,
      camera,
      roomFrame,
      roomColors,
      objects,
      viewSettings
    };
  } catch (err) {
    console.error('Failed to load from localStorage:', err);
    return null;
  }
}

export function exportSceneAsJSON(
  mainMode: MainMode,
  roomSubMode: RoomSubMode,
  camera: PerspectiveCamera,
  roomFrame: RoomFrame,
  roomColors: RoomColors,
  objects: SceneObject[],
  viewSettings: ViewSettings
): void {
  const payload: SerializedScene = {
    version: '2.0.0',
    timestamp: Date.now(),
    mainMode,
    roomSubMode,
    camera,
    roomFrame,
    roomColors,
    objects,
    viewSettings
  };
  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `單點透視作品_${mainMode === 'room' ? '室內空間' : '基礎練習'}_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseAndValidateImportedJSON(jsonStr: string): {
  success: boolean;
  data?: {
    mainMode: MainMode;
    roomSubMode: RoomSubMode;
    camera: PerspectiveCamera;
    roomFrame: RoomFrame;
    roomColors: RoomColors;
    objects: SceneObject[];
    viewSettings: ViewSettings;
  };
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: '檔案格式不符，請選擇有效的單點透視作品 JSON 檔案。' };
    }

    const mainMode: MainMode = parsed.mainMode === 'basic' ? 'basic' : 'room';
    const roomSubMode: RoomSubMode = ['empty', 'furnish', 'color'].includes(parsed.roomSubMode)
      ? parsed.roomSubMode
      : 'furnish';
    const camera = validateCamera(parsed.camera);
    const roomFrame = parsed.roomFrame || DEFAULT_ROOM_FRAME;
    const roomColors = validateRoomColors(parsed.roomColors);
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
        data: {
          mainMode,
          roomSubMode,
          camera,
          roomFrame,
          roomColors,
          objects: mainMode === 'room' ? DEFAULT_ROOM_OBJECTS : [],
          viewSettings
        }
      };
    }

    return {
      success: true,
      data: {
        mainMode,
        roomSubMode,
        camera,
        roomFrame,
        roomColors,
        objects,
        viewSettings
      }
    };
  } catch (err) {
    return {
      success: false,
      error: `檔案解析失敗：${err instanceof Error ? err.message : '非法的 JSON 結構'}`
    };
  }
}
