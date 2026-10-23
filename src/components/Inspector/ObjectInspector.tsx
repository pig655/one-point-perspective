import React from 'react';
import { SceneObject } from '../../models/types';
import {
  Trash2,
  Copy,
  Lock,
  Unlock,
  Move,
  Layers,
  Eye,
  Maximize2,
  Palette,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface ObjectInspectorProps {
  selectedObject: SceneObject | null;
  onUpdateObject: (updated: SceneObject) => void;
  onDeleteObject: (id: string) => void;
  onDuplicateObject: (id: string) => void;
  onReorderObject: (id: string, direction: 'up' | 'down') => void;
}

const PRESET_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#64748B',
  '#D97706', '#14B8A6', '#F43F5E', '#84CC16'
];

export const ObjectInspector: React.FC<ObjectInspectorProps> = ({
  selectedObject,
  onUpdateObject,
  onDeleteObject,
  onDuplicateObject,
  onReorderObject
}) => {
  if (!selectedObject) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-6 text-center select-none text-slate-400 min-h-[360px]">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 border-2 border-dashed border-amber-200 flex items-center justify-center mb-3 text-2xl shadow-xs animate-bounce">
          🎨
        </div>
        <h3 className="font-extrabold text-slate-700 text-sm mb-1">尚未選取任何物件</h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
          👈 點選左邊素材庫加入新物件，或在畫布上點選方塊與課桌，就能改變深度與尺寸喔！
        </p>
      </div>
    );
  }

  const { x, y, z, dimensions, color, isLocked, showGuidelines, name } = selectedObject;

  const handleDimensionChange = (key: 'width' | 'height' | 'depth', val: number) => {
    const maxLimit = key === 'depth' ? 3000 : 800;
    onUpdateObject({
      ...selectedObject,
      dimensions: {
        ...dimensions,
        [key]: Math.max(5, Math.min(maxLimit, val))
      }
    });
  };

  return (
    <div className="flex flex-col w-full select-none p-3 space-y-3.5 pb-16">
      {/* 頂部標題與快捷動作卡片 */}
      <div className="p-3 bg-gradient-to-r from-slate-50 to-amber-50/40 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="min-w-0 pr-2 flex-1">
          <input
            type="text"
            value={name}
            onChange={e => onUpdateObject({ ...selectedObject, name: e.target.value })}
            className="font-extrabold text-slate-800 text-sm bg-transparent hover:bg-white focus:bg-white px-2 py-0.5 rounded-lg border border-transparent focus:border-amber-400 focus:outline-none truncate w-full"
            title="點擊修改名稱"
          />
          <span className="text-[11px] font-semibold text-amber-700 px-2 block">
            🏷️ 類別：{
              selectedObject.category === 'geometric' ? '幾何立體' :
              selectedObject.category === 'vehicle' ? '街頭車輛' :
              selectedObject.category === 'building' ? '街景建築' :
              selectedObject.category === 'animal' ? '動物與角色' :
              selectedObject.category === 'furniture' ? '生活設施' : '其他物件'
            }
          </span>
        </div>

        {/* 鎖定、複製與刪除按鈕 */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={() => onUpdateObject({ ...selectedObject, isLocked: !isLocked })}
            className={`p-1.5 rounded-xl border-2 transition-all ${
              isLocked
                ? 'bg-red-50 text-red-600 border-red-300 shadow-xs'
                : 'text-slate-500 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
            }`}
            title={isLocked ? '解鎖物件' : '鎖定物件位置'}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDuplicateObject(selectedObject.id)}
            className="p-1.5 text-slate-600 border-2 border-slate-200 rounded-xl hover:bg-amber-50 hover:border-amber-300 transition-all shadow-xs"
            title="複製物件"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteObject(selectedObject.id)}
            className="p-1.5 text-red-500 border-2 border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all shadow-xs"
            title="刪除物件"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>


      {/* 操作一：深度 Z (近大遠小之核心) */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 p-3.5 rounded-2xl border-2 border-amber-200 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>深度 Z (推向遠方)</span>
          </span>
          <span className="text-xs font-black text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded-full shadow-xs">
            Z = {Math.round(z)} px
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1000"
          step="10"
          value={z}
          onChange={e => onUpdateObject({ ...selectedObject, z: Number(e.target.value) })}
          className="w-full accent-amber-600 cursor-pointer h-2"
        />
        <div className="flex justify-between text-[11px] text-amber-800 font-bold mt-1.5">
          <span>👀 近處 (視覺最大)</span>
          <span>🏃 遠方地平線 (縮小)</span>
        </div>
      </div>

      {/* 操作二：位置移動 (X, Y) */}
      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
          <Move className="w-4 h-4 text-blue-500" />
          <span>畫面位置 (X, Y)</span>
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white p-2 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[10px] font-bold">水平位置 X</span>
            <input
              type="number"
              value={Math.round(x)}
              onChange={e => onUpdateObject({ ...selectedObject, x: Number(e.target.value) })}
              className="w-full font-bold text-slate-800 px-1 py-0.5 rounded mt-0.5 focus:outline-none"
            />
          </div>
          <div className="bg-white p-2 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[10px] font-bold">垂直位置 Y</span>
            <input
              type="number"
              value={Math.round(y)}
              onChange={e => onUpdateObject({ ...selectedObject, y: Number(e.target.value) })}
              className="w-full font-bold text-slate-800 px-1 py-0.5 rounded mt-0.5 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 操作三：實際尺寸 (物理寬、高、深) */}
      <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-blue-950 flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-blue-600" />
            <span>物體物理尺寸 (W, H, D)</span>
          </span>
          <span className="text-[10px] text-blue-600 font-bold bg-blue-100 px-2 py-0.5 rounded-full">
            真實體積
          </span>
        </div>

        <div className="space-y-2 bg-white p-2.5 rounded-xl border border-blue-100">
          <div>
            <div className="flex justify-between text-xs text-slate-700 font-semibold mb-1">
              <span>實際寬度 (W)</span>
              <span className="font-bold text-blue-600 bg-blue-50 px-1.5 rounded">{Math.round(dimensions.width)}</span>
            </div>
            <input
              type="range"
              min="20"
              max="400"
              value={dimensions.width}
              onChange={e => handleDimensionChange('width', Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-700 font-semibold mb-1">
              <span>實際高度 (H)</span>
              <span className="font-bold text-blue-600 bg-blue-50 px-1.5 rounded">{Math.round(dimensions.height)}</span>
            </div>
            <input
              type="range"
              min="20"
              max="400"
              value={dimensions.height}
              onChange={e => handleDimensionChange('height', Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-700 font-semibold mb-1">
              <span>{selectedObject.geometryType === 'road' ? '🛣️ 馬路長度 / 深度 (D)' : '長度 / 深度 (D)'}</span>
              <span className="font-bold text-blue-600 bg-blue-50 px-1.5 rounded">{Math.round(dimensions.depth)}</span>
            </div>
            <input
              type="range"
              min="10"
              max={selectedObject.geometryType === 'road' ? 3000 : 2500}
              step={selectedObject.geometryType === 'road' ? 20 : 10}
              value={dimensions.depth}
              onChange={e => handleDimensionChange('depth', Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            {/* 快速長度深度預設按鈕 */}
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 font-bold mr-0.5">快速設定：</span>
              {[150, 500, 1000, 2000, 3000].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleDimensionChange('depth', preset)}
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold transition-all ${
                    Math.round(dimensions.depth) === preset
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-blue-50 text-slate-600 border border-slate-200'
                  }`}
                >
                  {preset >= 1000 ? `${preset / 1000}k` : preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 色彩選擇 */}
      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-xs">
        <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 mb-2">
          <Palette className="w-4 h-4 text-emerald-600" />
          <span>物件色彩</span>
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              onClick={() => onUpdateObject({ ...selectedObject, color: c })}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${
                color === c ? 'border-slate-800 scale-110 shadow-sm' : 'border-white hover:scale-105 shadow-xs'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={e => onUpdateObject({ ...selectedObject, color: e.target.value })}
            className="w-7 h-7 rounded-full cursor-pointer p-0 border border-slate-300"
            title="自訂色盤"
          />
        </div>
      </div>

      {/* 輔助射線與圖層排序控制 */}
      <div className="space-y-2 pt-1">
        <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer shadow-xs">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-500" />
            <span>個別透視輔助射線</span>
          </span>
          <input
            type="checkbox"
            checked={Boolean(showGuidelines)}
            onChange={e => onUpdateObject({ ...selectedObject, showGuidelines: e.target.checked })}
            className="rounded accent-blue-600 w-4 h-4 cursor-pointer"
          />
        </label>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onReorderObject(selectedObject.id, 'up')}
            className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
          >
            <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
            <span>上移一層</span>
          </button>
          <button
            onClick={() => onReorderObject(selectedObject.id, 'down')}
            className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
          >
            <ArrowDown className="w-3.5 h-3.5 text-amber-600" />
            <span>下移一層</span>
          </button>
        </div>
      </div>
    </div>
  );
};
