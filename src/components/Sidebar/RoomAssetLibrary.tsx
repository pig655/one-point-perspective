import React, { useState } from 'react';
import { ObjectCategory } from '../../models/types';
import { ROOM_ASSET_CATALOG, RoomAssetTemplate } from '../../models/roomCatalog';
import {
  Image,
  Frame,
  AppWindow,
  DoorClosed,
  Clock,
  Table,
  Armchair,
  Archive,
  Bed,
  Sofa,
  Flower2,
  User,
  Box,
  Shapes,
  Sparkles
} from 'lucide-react';

interface RoomAssetLibraryProps {
  onAddRoomObject: (template: RoomAssetTemplate) => void;
}

export const RoomAssetLibrary: React.FC<RoomAssetLibraryProps> = ({
  onAddRoomObject
}) => {
  const [activeCategory, setActiveCategory] = useState<ObjectCategory | 'all'>('all');

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Image': return <Image className="w-5 h-5 text-sky-500" />;
      case 'Frame': return <Frame className="w-5 h-5 text-purple-500" />;
      case 'AppWindow': return <AppWindow className="w-5 h-5 text-blue-500" />;
      case 'DoorClosed': return <DoorClosed className="w-5 h-5 text-amber-700" />;
      case 'Clock': return <Clock className="w-5 h-5 text-red-500" />;
      case 'Table': return <Table className="w-5 h-5 text-amber-600" />;
      case 'Armchair': return <Armchair className="w-5 h-5 text-amber-800" />;
      case 'Archive': return <Archive className="w-5 h-5 text-sky-600" />;
      case 'Bed': return <Bed className="w-5 h-5 text-indigo-500" />;
      case 'Sofa': return <Sofa className="w-5 h-5 text-emerald-600" />;
      case 'Flower2': return <Flower2 className="w-5 h-5 text-green-500" />;
      case 'User': return <User className="w-5 h-5 text-orange-500" />;
      case 'Box': return <Box className="w-5 h-5 text-blue-600" />;
      default: return <Shapes className="w-5 h-5 text-slate-500" />;
    }
  };

  const filteredAssets = ROOM_ASSET_CATALOG.filter(item => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm select-none">
      {/* 標題區 */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
            <Shapes className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm">房間素材庫</h2>
            <p className="text-xs text-slate-400">點擊即可佈置到房間</p>
          </div>
        </div>
      </div>

      {/* 分類切換 */}
      <div className="flex px-3 pt-3 gap-1 border-b border-slate-100 pb-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeCategory === 'all'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-amber-50'
          }`}
        >
          🌟 全部
        </button>
        <button
          onClick={() => setActiveCategory('wall')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeCategory === 'wall'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-amber-50'
          }`}
        >
          🖼️ 牆面
        </button>
        <button
          onClick={() => setActiveCategory('furniture')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeCategory === 'furniture'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-amber-50'
          }`}
        >
          🛋️ 家具
        </button>
        <button
          onClick={() => setActiveCategory('nature')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeCategory === 'nature'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-amber-50'
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
            onClick={() => onAddRoomObject(asset)}
            className="group flex items-center p-2 rounded-2xl border border-slate-200/90 hover:border-amber-400 hover:bg-amber-50/50 cursor-pointer transition-all duration-150 shadow-xs hover:shadow"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-50 group-hover:bg-white border border-slate-200 flex items-center justify-center shrink-0 mr-2.5 overflow-hidden shadow-xs">
              {asset.imageUrl ? (
                <img
                  src={asset.imageUrl}
                  alt={asset.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                renderIcon(asset.iconName)
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs group-hover:text-amber-800 transition-colors truncate">
                  {asset.name}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white shrink-0 shadow-xs ml-1"
                  style={{ backgroundColor: asset.defaultColor }}
                />
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {asset.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
        <span>牆面物件自動貼牆，家具自動貼合地板！</span>
      </div>
    </aside>
  );
};
