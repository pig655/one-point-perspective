import React, { useState } from 'react';
import { X, Box, Check } from 'lucide-react';
import { SceneObject } from '../../models/types';

interface CustomObjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomObject: (obj: Partial<SceneObject>) => void;
}

const PRESET_COLORS = [
  '#3B82F6', // 藍
  '#10B981', // 綠
  '#F59E0B', // 黃
  '#EF4444', // 紅
  '#8B5CF6', // 紫
  '#EC4899', // 粉
  '#06B6D4', // 青
  '#64748B'  // 灰
];

export const CustomObjectModal: React.FC<CustomObjectModalProps> = ({
  isOpen,
  onClose,
  onAddCustomObject
}) => {
  const [name, setName] = useState('我的自訂方塊');
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const [depth, setDepth] = useState(100);
  const [color, setColor] = useState('#3B82F6');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onAddCustomObject({
      name,
      category: 'custom',
      geometryType: 'cuboid',
      dimensions: { width, height, depth },
      color,
      x: 500,
      y: 450,
      z: 100,
      showGuidelines: true
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* 頂部標題 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
              <Box className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">建立自訂立體方塊</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 表單內容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 物件名稱 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              物件名稱
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 尺寸滑桿區塊 */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>物理寬度 (X)</span>
                <span className="text-blue-600">{width} px</span>
              </div>
              <input
                type="range"
                min="30"
                max="300"
                step="5"
                value={width}
                onChange={e => setWidth(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>物理高度 (Y)</span>
                <span className="text-blue-600">{height} px</span>
              </div>
              <input
                type="range"
                min="30"
                max="300"
                step="5"
                value={height}
                onChange={e => setHeight(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>物理深度 (Z 厚度)</span>
                <span className="text-blue-600">{depth} px</span>
              </div>
              <input
                type="range"
                min="20"
                max="400"
                step="5"
                value={depth}
                onChange={e => setDepth(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          </div>

          {/* 顏色選擇 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              選擇顏色
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    color === c ? 'border-slate-800 scale-110 shadow-md' : 'border-white hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-8 h-8 rounded-full cursor-pointer p-0 border border-slate-300"
                title="自選顏色"
              />
            </div>
          </div>

          {/* 送出與取消按鈕 */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>加入目前場景</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
