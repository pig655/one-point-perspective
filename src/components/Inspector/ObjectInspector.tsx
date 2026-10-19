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
  '#D97706', '#B45309', '#0284C7', '#22C55E'
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
      <div className="w-80 bg-white border-l border-slate-200 flex flex-col items-center justify-center p-6 text-center select-none text-slate-400">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-3">
          <Move className="w-7 h-7 text-slate-300" />
        </div>
        <h3 className="font-bold text-slate-700 text-sm mb-1">尚未選取任何物件</h3>
        <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
          點選畫布上的方塊、課桌或房屋，即可在這裡調整位置、深度與實際尺寸！
        </p>
      </div>
    );
  }

  const { x, y, z, dimensions, color, isLocked, showGuidelines, name } = selectedObject;

  const handleDimensionChange = (key: 'width' | 'height' | 'depth', val: number) => {
    onUpdateObject({
      ...selectedObject,
      dimensions: {
        ...dimensions,
        [key]: Math.max(10, Math.min(600, val))
      }
    });
  };

  return (
    <aside className="w-80 bg-white border-l border-slate-200 flex flex-col h-full shadow-sm overflow-y-auto select-none">
      {/* 頂部標題與快捷按鈕 */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="min-w-0 pr-2">
          <input
            type="text"
            value={name}
            onChange={e => onUpdateObject({ ...selectedObject, name: e.target.value })}
            className="font-bold text-slate-800 text-sm bg-transparent hover:bg-white focus:bg-white px-1.5 py-0.5 rounded border border-transparent focus:border-blue-400 focus:outline-none truncate w-full"
            title="點擊修改名稱"
          />
          <span className="text-xs text-slate-400 px-1.5 block">
            類別：{selectedObject.category === 'geometric' ? '幾何體' : selectedObject.category === 'furniture' ? '生活物件' : '角色自然'}
          </span>
        </div>

        {/* 鎖定、複製與刪除 */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={() => onUpdateObject({ ...selectedObject, isLocked: !isLocked })}
            className={`p-1.5 rounded-lg border transition-colors ${
              isLocked
                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                : 'text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
            title={isLocked ? '解鎖物件' : '鎖定物件位置'}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDuplicateObject(selectedObject.id)}
            className="p-1.5 text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            title="複製物件"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteObject(selectedObject.id)}
            className="p-1.5 text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            title="刪除物件"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* 重要教學觀念提示卡 */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed shadow-sm">
          <span className="font-bold block mb-1">🎓 透視小叮嚀：</span>
          <span className="block mb-0.5">
            <strong>• 移動位置 (X, Y)：</strong> 平移物件在畫面上的擺放處。
          </span>
          <span className="block mb-0.5">
            <strong>• 調整深度 (Z)：</strong> 把物體推向遠方，視覺自然「近大遠小」！
          </span>
          <span className="block">
            <strong>• 實際尺寸：</strong> 改變物體本身的大小，與遠近不同。
          </span>
        </div>

        {/* 操作一：改變深度 Z (近大遠小之核心) */}
        <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>深度 Z (推向遠方)</span>
            </span>
            <span className="text-xs font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
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
            className="w-full accent-amber-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-amber-700/80 mt-1 font-medium">
            <span>最前方 (近處，視覺最大)</span>
            <span>遠方地平線 (視覺縮小)</span>
          </div>
        </div>

        {/* 操作二：位置移動 (X, Y) */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Move className="w-4 h-4 text-slate-500" />
            <span>畫面位置 (X, Y)</span>
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">水平位置 X</span>
              <input
                type="number"
                value={Math.round(x)}
                onChange={e => onUpdateObject({ ...selectedObject, x: Number(e.target.value) })}
                className="w-full bg-white font-semibold text-slate-700 px-2 py-1 rounded border border-slate-200 mt-1"
              />
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span className="text-slate-400 block text-[10px]">垂直位置 Y</span>
              <input
                type="number"
                value={Math.round(y)}
                onChange={e => onUpdateObject({ ...selectedObject, y: Number(e.target.value) })}
                className="w-full bg-white font-semibold text-slate-700 px-2 py-1 rounded border border-slate-200 mt-1"
              />
            </div>
          </div>
        </div>

        {/* 操作三：實際尺寸 (物理寬、高、深) */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-slate-500" />
            <span>物體本身實際尺寸 (W, H, D)</span>
          </span>
          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>實際寬度 (W)</span>
                <span className="font-semibold">{Math.round(dimensions.width)}</span>
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
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>實際高度 (H)</span>
                <span className="font-semibold">{Math.round(dimensions.height)}</span>
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
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>厚度 / 深度 (D)</span>
                <span className="font-semibold">{Math.round(dimensions.depth)}</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                value={dimensions.depth}
                onChange={e => handleDimensionChange('depth', Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 顏色選擇 */}
        <div>
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
            <Palette className="w-4 h-4 text-slate-500" />
            <span>物件色彩</span>
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => onUpdateObject({ ...selectedObject, color: c })}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  color === c ? 'border-slate-800 scale-110 shadow' : 'border-white hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={e => onUpdateObject({ ...selectedObject, color: e.target.value })}
              className="w-6 h-6 rounded-full cursor-pointer p-0 border border-slate-300"
              title="自訂色盤"
            />
          </div>
        </div>

        {/* 輔助與排序控制 */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" />
              <span>個別透視輔助射線</span>
            </span>
            <input
              type="checkbox"
              checked={Boolean(showGuidelines)}
              onChange={e => onUpdateObject({ ...selectedObject, showGuidelines: e.target.checked })}
              className="rounded accent-blue-600 w-4 h-4"
            />
          </label>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onReorderObject(selectedObject.id, 'up')}
              className="flex-1 flex items-center justify-center space-x-1 py-1.5 px-3 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>上移一層</span>
            </button>
            <button
              onClick={() => onReorderObject(selectedObject.id, 'down')}
              className="flex-1 flex items-center justify-center space-x-1 py-1.5 px-3 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>下移一層</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
