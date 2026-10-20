import React, { useState } from 'react';
import { ObjectCategory } from '../../models/types';
import { ASSET_CATALOG, AssetTemplate } from '../../models/catalog';
import {
  Box,
  Cuboid,
  Cylinder,
  Square,
  Columns,
  Table,
  Armchair,
  Archive,
  AppWindow,
  Home,
  Milestone,
  User,
  Trees,
  PlusCircle,
  Shapes,
  Sparkles
} from 'lucide-react';

interface AssetLibraryProps {
  onAddObject: (template: AssetTemplate) => void;
  onOpenCustomModal: () => void;
}

export const AssetLibrary: React.FC<AssetLibraryProps> = ({
  onAddObject,
  onOpenCustomModal
}) => {
  const [activeCategory, setActiveCategory] = useState<ObjectCategory | 'all'>('all');

  // 圖示對應表
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Box': return <Box className="w-5 h-5 text-blue-500" />;
      case 'Cuboid': return <Cuboid className="w-5 h-5 text-emerald-500" />;
      case 'Cylinder': return <Cylinder className="w-5 h-5 text-purple-500" />;
      case 'Square': return <Square className="w-5 h-5 text-amber-500" />;
      case 'Columns': return <Columns className="w-5 h-5 text-pink-500" />;
      case 'Table': return <Table className="w-5 h-5 text-amber-600" />;
      case 'Armchair': return <Armchair className="w-5 h-5 text-amber-700" />;
      case 'Archive': return <Archive className="w-5 h-5 text-sky-500" />;
      case 'AppWindow': return <AppWindow className="w-5 h-5 text-cyan-500" />;
      case 'Home': return <Home className="w-5 h-5 text-red-500" />;
      case 'Milestone': return <Milestone className="w-5 h-5 text-slate-500" />;
      case 'User': return <User className="w-5 h-5 text-orange-500" />;
      case 'Trees': return <Trees className="w-5 h-5 text-green-500" />;
      default: return <Box className="w-5 h-5 text-slate-500" />;
    }
  };

  const filteredAssets = ASSET_CATALOG.filter(item => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm select-none">
      {/* 標題區 */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
            <Shapes className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm">物件素材庫</h2>
            <p className="text-xs text-slate-400">點擊即可加入畫布</p>
          </div>
        </div>

        {/* 自訂方塊按鈕 */}
        <button
          onClick={onOpenCustomModal}
          className="flex items-center space-x-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg transition-colors border border-blue-200"
          title="建立自訂尺寸的立體方塊"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>自訂</span>
        </button>
      </div>

      {/* 分類標籤切換 */}
      <div className="flex px-3 pt-3 gap-1 border-b border-slate-100 pb-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeCategory === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-blue-50'
          }`}
        >
          🌟 全部
        </button>
        <button
          onClick={() => setActiveCategory('geometric')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeCategory === 'geometric'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-blue-50'
          }`}
        >
          🔷 幾何
        </button>
        <button
          onClick={() => setActiveCategory('furniture')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeCategory === 'furniture'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-blue-50'
          }`}
        >
          🪑 生活
        </button>
        <button
          onClick={() => setActiveCategory('nature')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeCategory === 'nature'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-blue-50'
          }`}
        >
          🌳 角色
        </button>
      </div>

      {/* 素材列表 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredAssets.map(asset => (
          <div
            key={asset.type}
            onClick={() => onAddObject(asset)}
            className="group flex items-center p-2 rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-all duration-150 shadow-xs hover:shadow"
          >
            {/* 圖示預覽框 */}
            <div className="w-11 h-11 rounded-xl bg-slate-50 group-hover:bg-white border border-slate-200 flex items-center justify-center shrink-0 mr-2.5 shadow-xs">
              {renderIcon(asset.iconName)}
            </div>

            {/* 文字資訊 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                  {asset.name}
                </span>
                <span
                  className="w-3 h-3 rounded-full border border-white shrink-0 shadow-sm"
                  style={{ backgroundColor: asset.defaultColor }}
                  title="預設顏色"
                />
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {asset.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 底部小提示 */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
        <span>將物件加入後，可調整深度體驗「近大遠小」！</span>
      </div>
    </aside>
  );
};
