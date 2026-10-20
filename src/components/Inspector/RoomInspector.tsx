import React from 'react';
import {
  SceneObject,
  RoomColors,
  RenderStyle,
  WallTarget
} from '../../models/types';
import { COLORED_ROOM_PALETTES } from '../../core/roomGeometry';
import {
  Palette,
  Layers,
  Maximize2,
  Trash2,
  Copy,
  Lock,
  Unlock,
  Sparkles,
  Layout
} from 'lucide-react';

interface RoomInspectorProps {
  selectedObject: SceneObject | null;
  roomColors: RoomColors;
  renderStyle: RenderStyle;
  onUpdateObject: (updated: SceneObject) => void;
  onDeleteObject: (id: string) => void;
  onDuplicateObject: (id: string) => void;
  onUpdateRoomColors: (colors: RoomColors) => void;
  onUpdateRenderStyle: (style: RenderStyle) => void;
}

export const RoomInspector: React.FC<RoomInspectorProps> = ({
  selectedObject,
  roomColors,
  renderStyle,
  onUpdateObject,
  onDeleteObject,
  onDuplicateObject,
  onUpdateRoomColors,
  onUpdateRenderStyle
}) => {
  // 1. 若選取了物件，顯示該物件的詳細設定
  if (selectedObject) {
    const { isLocked, wallAnchor } = selectedObject;

    const handleWallChange = (newWall: WallTarget) => {
      if (!wallAnchor) return;
      onUpdateObject({
        ...selectedObject,
        wallAnchor: {
          ...wallAnchor,
          wall: newWall,
          u: 0.3,
          v: newWall === 'left' || newWall === 'right' ? 0.3 : 0.4
        }
      });
    };

    return (
      <div className="flex flex-col w-full select-none pb-16">
        {/* 物件名稱與頂部動作 */}
        <div className="p-3 bg-gradient-to-r from-slate-50 to-amber-50/40 border-b border-slate-100 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <input
              type="text"
              value={selectedObject.name}
              onChange={e => onUpdateObject({ ...selectedObject, name: e.target.value })}
              className="font-bold text-slate-800 text-sm bg-transparent hover:bg-white focus:bg-white px-1.5 py-0.5 rounded border border-transparent focus:border-amber-400 focus:outline-none truncate w-full"
              title="點擊修改名稱"
            />
            <span className="text-xs text-amber-700 font-semibold px-1.5 block">
              {wallAnchor ? `🖼️ 牆面物件 (${wallAnchor.wall === 'left' ? '左牆' : wallAnchor.wall === 'right' ? '右牆' : '後牆'})` : '🪑 地板家具'}
            </span>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={() => onUpdateObject({ ...selectedObject, isLocked: !isLocked })}
              className={`p-1.5 rounded-xl border transition-colors ${
                isLocked
                  ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                  : 'text-slate-500 border-slate-200 hover:bg-slate-100'
              }`}
              title={isLocked ? '解鎖' : '鎖定'}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onDuplicateObject(selectedObject.id)}
              className="p-1.5 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
              title="複製物件"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteObject(selectedObject.id)}
              className="p-1.5 text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
              title="刪除物件"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-3 space-y-3.5">
          {/* Nano Banana 故事繪本插畫素材庫選擇 */}
          {(selectedObject.category === 'wall' || selectedObject.geometryType.includes('painting') || selectedObject.geometryType.includes('window') || selectedObject.geometryType.includes('carpet')) && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-2xl border border-amber-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>繪本插圖貼畫 (Nano Banana)</span>
                </span>
                <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                  生動插畫
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'cat', name: '🐱 太空喵喵', url: '/assets/images/painting_cat_astronaut.jpg' },
                  { id: 'dino', name: '🦖 派對恐龍', url: '/assets/images/painting_cute_dino.jpg' },
                  { id: 'meadow', name: '🌈 彩虹草原', url: '/assets/images/window_rainbow_meadow.jpg' },
                  { id: 'bear', name: '🐻 萌萌小熊', url: '/assets/images/rug_cute_bear.jpg' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onUpdateObject({ ...selectedObject, imageUrl: item.url })}
                    className={`flex items-center space-x-1.5 p-1.5 rounded-xl border text-left transition-all ${
                      selectedObject.imageUrl === item.url
                        ? 'bg-amber-500 text-white border-amber-600 font-bold shadow-xs'
                        : 'bg-white text-slate-700 border-amber-200/80 hover:bg-amber-100/60'
                    }`}
                  >
                    <img src={item.url} alt={item.name} className="w-8 h-8 rounded-lg object-cover shrink-0 border border-black/10" />
                    <span className="text-[11px] font-bold truncate">{item.name}</span>
                  </button>
                ))}
              </div>
              {selectedObject.imageUrl && (
                <button
                  type="button"
                  onClick={() => onUpdateObject({ ...selectedObject, imageUrl: undefined })}
                  className="text-[11px] text-amber-800 hover:text-amber-950 underline font-medium block pt-0.5 text-right"
                >
                  ✖ 移除插圖，改用經典純色
                </button>
              )}
            </div>
          )}

          {/* 牆面物件特定控制 */}
          {wallAnchor ? (
            <div className="space-y-4">
              {/* 所屬牆面切換 (左牆、後牆、右牆) */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Layout className="w-4 h-4 text-blue-500" />
                  <span>貼合目標牆面</span>
                </span>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                  {(['left', 'back', 'right'] as const).map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => handleWallChange(w)}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        wallAnchor.wall === w
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {w === 'left' ? '左牆面' : w === 'back' ? '後牆面' : '右牆面'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 牆面位置滑桿 (u, v) */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  牆面滑動位置
                </span>
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>{wallAnchor.wall === 'back' ? '水平位置 (左 ↔ 右)' : '深度位置 (前 ↔ 後)'}</span>
                    <span className="font-semibold">{Math.round(wallAnchor.u * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={1 - wallAnchor.widthU}
                    step="0.01"
                    value={wallAnchor.u}
                    onChange={e =>
                      onUpdateObject({
                        ...selectedObject,
                        wallAnchor: { ...wallAnchor, u: Number(e.target.value) }
                      })
                    }
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>高度位置 (底 ↔ 頂)</span>
                    <span className="font-semibold">{Math.round(wallAnchor.v * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={1 - wallAnchor.heightV}
                    step="0.01"
                    value={wallAnchor.v}
                    onChange={e =>
                      onUpdateObject({
                        ...selectedObject,
                        wallAnchor: { ...wallAnchor, v: Number(e.target.value) }
                      })
                    }
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* 牆面尺寸比例 */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  牆面尺寸比例
                </span>
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>寬度比例</span>
                    <span className="font-semibold">{Math.round(wallAnchor.widthU * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.6"
                    step="0.02"
                    value={wallAnchor.widthU}
                    onChange={e =>
                      onUpdateObject({
                        ...selectedObject,
                        wallAnchor: { ...wallAnchor, widthU: Number(e.target.value) }
                      })
                    }
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>高度比例</span>
                    <span className="font-semibold">{Math.round(wallAnchor.heightV * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.02"
                    value={wallAnchor.heightV}
                    onChange={e =>
                      onUpdateObject({
                        ...selectedObject,
                        wallAnchor: { ...wallAnchor, heightV: Number(e.target.value) }
                      })
                    }
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ) : (
            // 地板家具控制
            <div className="space-y-4">
              <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 space-y-3">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-600" />
                  <span>地板位置 (自動貼合地面)</span>
                </span>

                <div>
                  <div className="flex justify-between text-xs text-amber-900 mb-1">
                    <span>空間深度 (前 ↔ 後)</span>
                    <span className="font-bold">{Math.round((selectedObject.roomFloorZ ?? 0.5) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.95"
                    step="0.02"
                    value={selectedObject.roomFloorZ ?? 0.5}
                    onChange={e =>
                      onUpdateObject({
                        ...selectedObject,
                        roomFloorZ: Number(e.target.value),
                        z: Number(e.target.value) * 1000
                      })
                    }
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-amber-900 mb-1">
                    <span>水平位置 (左 ↔ 右)</span>
                    <span className="font-bold">{Math.round((selectedObject.roomFloorX ?? 0.5) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.08"
                    max="0.92"
                    step="0.02"
                    value={selectedObject.roomFloorX ?? 0.5}
                    onChange={e =>
                      onUpdateObject({
                        ...selectedObject,
                        roomFloorX: Number(e.target.value)
                      })
                    }
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* 物理尺寸調整 */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Maximize2 className="w-4 h-4 text-slate-500" />
                  <span>家具實際尺寸 (W, H, D)</span>
                </span>

                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-0.5">
                    <span>寬度 (W)</span>
                    <span className="font-semibold">{Math.round(selectedObject.dimensions.width)}</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="300"
                    value={selectedObject.dimensions.width}
                    onChange={e =>
                      onUpdateObject({
                        ...selectedObject,
                        dimensions: { ...selectedObject.dimensions, width: Number(e.target.value) }
                      })
                    }
                    className="w-full accent-blue-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-0.5">
                    <span>高度 (H)</span>
                    <span className="font-semibold">{Math.round(selectedObject.dimensions.height)}</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="250"
                    value={selectedObject.dimensions.height}
                    onChange={e =>
                      onUpdateObject({
                        ...selectedObject,
                        dimensions: { ...selectedObject.dimensions, height: Number(e.target.value) }
                      })
                    }
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 色彩選擇 */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-slate-500" />
              <span>主體顏色</span>
            </span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedObject.color}
                onChange={e => onUpdateObject({ ...selectedObject, color: e.target.value })}
                className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
              />
              <span className="text-xs font-mono text-slate-600">{selectedObject.color}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. 未選取物件時，顯示「房間著色與風格面板」
  return (
    <div className="flex flex-col w-full select-none p-3 space-y-4 pb-16">
      {/* 頂部標題 */}
      <div className="border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Palette className="w-4 h-4 text-blue-600" />
          <span>房間著色與外觀風格</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          隨時為左牆、右牆、後牆與地板調整美麗的顏色！
        </p>
      </div>

      {/* 4 種風格模式切換 */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 block">顯示外觀風格</span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onUpdateRenderStyle('wireframe')}
            className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
              renderStyle === 'wireframe'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            ✏️ 黑白線稿
          </button>
          <button
            onClick={() => onUpdateRenderStyle('guidelines')}
            className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
              renderStyle === 'guidelines'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            📐 透視輔助線
          </button>
          <button
            onClick={() => onUpdateRenderStyle('clean')}
            className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
              renderStyle === 'clean'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            🖼️ 簡潔純淨
          </button>
          <button
            onClick={() => onUpdateRenderStyle('colored')}
            className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
              renderStyle === 'colored'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            🎨 彩色作品
          </button>
        </div>
      </div>

      {/* 快速主題套色 */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>快速精選主題套色</span>
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => onUpdateRoomColors(COLORED_ROOM_PALETTES.warm)}
            className="py-1.5 px-2 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors"
          >
            ☀️ 陽光暖黃
          </button>
          <button
            onClick={() => onUpdateRoomColors(COLORED_ROOM_PALETTES.cool)}
            className="py-1.5 px-2 text-xs font-semibold rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 transition-colors"
          >
            🌊 清爽天藍
          </button>
          <button
            onClick={() => onUpdateRoomColors(COLORED_ROOM_PALETTES.cozy)}
            className="py-1.5 px-2 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-colors"
          >
            🌿 溫馨森林
          </button>
        </div>
      </div>

      {/* 個別牆面面調色盤 */}
      <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <span className="text-xs font-bold text-slate-700 block">各牆面自選顏色</span>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <label className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-200">
            <span className="font-medium text-slate-700">左側牆面</span>
            <input
              type="color"
              value={roomColors.leftWall}
              onChange={e => onUpdateRoomColors({ ...roomColors, leftWall: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer p-0 border-0"
            />
          </label>

          <label className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-200">
            <span className="font-medium text-slate-700">右側牆面</span>
            <input
              type="color"
              value={roomColors.rightWall}
              onChange={e => onUpdateRoomColors({ ...roomColors, rightWall: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer p-0 border-0"
            />
          </label>

          <label className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-200">
            <span className="font-medium text-slate-700">後方主牆</span>
            <input
              type="color"
              value={roomColors.backWall}
              onChange={e => onUpdateRoomColors({ ...roomColors, backWall: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer p-0 border-0"
            />
          </label>

          <label className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-200">
            <span className="font-medium text-slate-700">天花板</span>
            <input
              type="color"
              value={roomColors.ceiling}
              onChange={e => onUpdateRoomColors({ ...roomColors, ceiling: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer p-0 border-0"
            />
          </label>

          <label className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-200 col-span-2">
            <span className="font-medium text-slate-700">室內地板</span>
            <input
              type="color"
              value={roomColors.floor}
              onChange={e => onUpdateRoomColors({ ...roomColors, floor: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer p-0 border-0"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
