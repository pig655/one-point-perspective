import React, { useRef } from 'react';
import {
  Trophy,
  Undo2,
  Redo2,
  Save,
  Download,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  Box,
  Home,
  Trash2
} from 'lucide-react';
import { MainMode, RoomSubMode, RenderStyle, ViewSettings, LearningMode } from '../../models/types';

interface HeaderToolbarProps {
  mainMode: MainMode;
  roomSubMode: RoomSubMode;
  learningMode: LearningMode;
  onToggleMainMode: (mode: MainMode) => void;
  onToggleRoomSubMode: (subMode: RoomSubMode) => void;
  onToggleLearningMode: (mode: LearningMode) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  viewSettings: ViewSettings;
  onToggleViewSetting: (key: keyof ViewSettings) => void;
  onUpdateRenderStyle: (style: RenderStyle) => void;
  onSaveLocal: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onExportPng: () => void;
  onResetDefaultScene: () => void;
  onClearScene: () => void;
}

export const HeaderToolbar: React.FC<HeaderToolbarProps> = ({
  mainMode,
  roomSubMode,
  learningMode,
  onToggleMainMode,
  onToggleRoomSubMode,
  onToggleLearningMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  viewSettings,
  onToggleViewSetting,
  onUpdateRenderStyle,
  onSaveLocal,
  onExportJson,
  onImportJson,
  onExportPng,
  onResetDefaultScene,
  onClearScene
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
      e.target.value = '';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-2 flex flex-col gap-2 select-none shadow-xs">
      {/* 隱藏的檔案上傳輸入框 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 第一層：品牌主標、雙主模式切換、教學任務與作品操作 */}
      <div className="flex items-center justify-between">
        {/* 左區：Logo 與雙主模式切換 */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 via-pink-500 to-indigo-500 flex items-center justify-center text-white shadow-sm text-lg">
              🎨
            </div>
            <div>
              <h1 className="font-black text-slate-800 text-sm leading-tight flex items-center gap-1">
                <span>單點透視魔法教室</span>
                <span className="text-amber-500 text-xs">✨</span>
              </h1>
              <p className="text-[10px] font-bold text-amber-700/80">國小五年級視覺藝術與空間科學</p>
            </div>
          </div>

          {/* 模式一 (基礎透視) 與 模式二 (室內空間) 切換大按鈕 */}
          <div className="flex p-1 bg-amber-100/60 rounded-2xl border border-amber-200 shadow-xs">
            <button
              onClick={() => onToggleMainMode('basic')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                mainMode === 'basic'
                  ? 'bg-blue-600 text-white shadow-xs scale-102'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-white/60'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>🧭 基礎透視探索</span>
            </button>
            <button
              onClick={() => onToggleMainMode('room')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                mainMode === 'room'
                  ? 'bg-indigo-600 text-white shadow-xs scale-102'
                  : 'text-slate-600 hover:text-indigo-700 hover:bg-white/60'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>🏠 室內透視魔法屋</span>
            </button>
          </div>

          {/* 自由探索 vs 闖關任務 */}
          <div className="flex p-0.5 bg-amber-50 rounded-xl border border-amber-200">
            <button
              onClick={() => onToggleLearningMode(learningMode === 'explore' ? 'mission' : 'explore')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-black transition-all ${
                learningMode === 'mission'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-900 hover:bg-amber-100'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-yellow-300" />
              <span>{learningMode === 'mission' ? '⭐ 任務闖關中' : '🏆 挑戰教學任務'}</span>
            </button>
          </div>
        </div>

        {/* 右區：復原、儲存、匯出、圖片 */}
        <div className="flex items-center space-x-1.5">
          <div className="flex items-center space-x-1 pr-2 border-r border-slate-200">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="復原 (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="重做 (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onSaveLocal}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
            title="儲存進度至瀏覽器"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">暫存</span>
          </button>

          <button
            onClick={onExportJson}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
            title="匯出場景檔案 (.json)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">匯出</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
            title="匯入作品檔案 (.json)"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">匯入</span>
          </button>

          <button
            onClick={onExportPng}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            title="下載高畫質 PNG 作品圖片"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>下載圖片</span>
          </button>

          <div className="flex items-center space-x-1 pl-1 border-l border-slate-200">
            <button
              onClick={onResetDefaultScene}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              title="重設為預設場景"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClearScene}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
              title="清空所有物件"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 第二層：子階段選單 (空房間 / 房間佈置 / 完成作品) 與 視圖輔助開關 */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
        {/* 左區：室內模式子階段 */}
        {mainMode === 'room' ? (
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-500">學習階段：</span>
            <div className="flex p-0.5 bg-slate-100 rounded-lg">
              <button
                onClick={() => onToggleRoomSubMode('empty')}
                className={`px-3 py-1 rounded-md font-bold transition-all ${
                  roomSubMode === 'empty'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. 空房間 (認識結構)
              </button>
              <button
                onClick={() => onToggleRoomSubMode('furnish')}
                className={`px-3 py-1 rounded-md font-bold transition-all ${
                  roomSubMode === 'furnish'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. 房間佈置 (家具門窗)
              </button>
              <button
                onClick={() => onToggleRoomSubMode('color')}
                className={`px-3 py-1 rounded-md font-bold transition-all ${
                  roomSubMode === 'color'
                    ? 'bg-white text-emerald-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3. 完成作品 (著色匯出)
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-slate-500">
            <span className="font-bold text-blue-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>基礎透視練習模式</span>
            </span>
            <span>— 自由移動方塊與透視點，體驗近大遠小！</span>
          </div>
        )}

        {/* 右區：圖層開關與風格切換 */}
        <div className="flex items-center space-x-2">
          {/* 室內空間模式專用：地板線、天花板線 */}
          {mainMode === 'room' ? (
            <>
              <button
                onClick={() => onToggleViewSetting('showFloorLines')}
                className={`px-2.5 py-1 rounded-md font-semibold border transition-colors ${
                  viewSettings.showFloorLines
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'text-slate-400 border-transparent hover:bg-slate-100'
                }`}
                title="顯示/隱藏地板透視線"
              >
                地板線
              </button>
              <button
                onClick={() => onToggleViewSetting('showCeilingLines')}
                className={`px-2.5 py-1 rounded-md font-semibold border transition-colors ${
                  viewSettings.showCeilingLines
                    ? 'bg-sky-50 text-sky-700 border-sky-300'
                    : 'text-slate-400 border-transparent hover:bg-slate-100'
                }`}
                title="顯示/隱藏天花板透視線"
              >
                天花板線
              </button>
            </>
          ) : (
            <button
              onClick={() => onToggleViewSetting('showGroundGrid')}
              className={`px-2.5 py-1 rounded-md font-semibold border transition-colors ${
                viewSettings.showGroundGrid
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                  : 'text-slate-400 border-transparent hover:bg-slate-100'
              }`}
            >
              地面格線
            </button>
          )}

          {/* 通用開關：視平線、透視點、透視輔助線 */}
          <button
            onClick={() => onToggleViewSetting('showHorizonLine')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
              viewSettings.showHorizonLine
                ? 'bg-red-50 text-red-600 border-red-300 shadow-xs'
                : 'text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            📏 視平線
          </button>

          <button
            onClick={() => onToggleViewSetting('showVanishingPoint')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
              viewSettings.showVanishingPoint
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                : 'text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            🎯 透視點 (VP)
          </button>

          <button
            onClick={() => onToggleViewSetting('showPerspectiveLines')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
              viewSettings.showPerspectiveLines
                ? 'bg-blue-100 text-blue-800 border-blue-300 shadow-xs'
                : 'text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            📐 透視輔助線
          </button>

          {/* 外觀風格快捷鈕 */}
          <div className="flex p-0.5 bg-slate-100 rounded-md border border-slate-200">
            <button
              onClick={() => onUpdateRenderStyle('wireframe')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                viewSettings.renderStyle === 'wireframe' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
              }`}
              title="黑白線稿風格"
            >
              線稿
            </button>
            <button
              onClick={() => onUpdateRenderStyle('colored')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                viewSettings.renderStyle === 'colored' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500'
              }`}
              title="彩色作品風格"
            >
              彩色
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
