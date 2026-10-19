import React, { useRef } from 'react';
import {
  Compass,
  Trophy,
  Undo2,
  Redo2,
  Save,
  Download,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Eye,
  Grid,
  Sparkles,
  Trash2
} from 'lucide-react';
import { LearningMode, ViewSettings } from '../../models/types';

interface HeaderToolbarProps {
  mode: LearningMode;
  onToggleMode: (newMode: LearningMode) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  viewSettings: ViewSettings;
  onToggleViewSetting: (key: keyof ViewSettings) => void;
  onSaveLocal: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onExportPng: () => void;
  onResetDefaultScene: () => void;
  onClearScene: () => void;
}

export const HeaderToolbar: React.FC<HeaderToolbarProps> = ({
  mode,
  onToggleMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  viewSettings,
  onToggleViewSetting,
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
    <header className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between select-none shadow-xs">
      {/* 隱藏的 JSON 檔案選取器 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 左區：標題與模式切換 */}
      <div className="flex items-center space-x-4">
        {/* Logo 與主標題 */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-800 text-base leading-tight tracking-tight">
              單點透視互動學習教室
            </h1>
            <p className="text-[11px] font-medium text-slate-400">國小五年級視覺藝術與空間科學</p>
          </div>
        </div>

        {/* 模式切換膠囊 (自由探索 vs 教學任務) */}
        <div className="flex p-0.5 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => onToggleMode('explore')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'explore'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>自由探索</span>
          </button>
          <button
            onClick={() => onToggleMode('mission')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'mission'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>教學任務挑戰</span>
          </button>
        </div>
      </div>

      {/* 中區：輔助視圖圖層開關 */}
      <div className="hidden lg:flex items-center space-x-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
        <button
          onClick={() => onToggleViewSetting('showHorizonLine')}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
            viewSettings.showHorizonLine
              ? 'bg-red-50 text-red-600 border border-red-200'
              : 'text-slate-400 hover:text-slate-600'
          }`}
          title="顯示/隱藏視平線"
        >
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span>視平線</span>
        </button>

        <button
          onClick={() => onToggleViewSetting('showVanishingPoint')}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
            viewSettings.showVanishingPoint
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'text-slate-400 hover:text-slate-600'
          }`}
          title="顯示/隱藏透視焦點"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>透視點 (VP)</span>
        </button>

        <button
          onClick={() => onToggleViewSetting('showPerspectiveLines')}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
            viewSettings.showPerspectiveLines
              ? 'bg-blue-50 text-blue-600 border border-blue-200'
              : 'text-slate-400 hover:text-slate-600'
          }`}
          title="顯示/隱藏朝向透視點之輔助射線"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>透視輔助線</span>
        </button>

        <button
          onClick={() => onToggleViewSetting('showGroundGrid')}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
            viewSettings.showGroundGrid
              ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
              : 'text-slate-400 hover:text-slate-600'
          }`}
          title="顯示/隱藏地面透視格線"
        >
          <Grid className="w-3.5 h-3.5" />
          <span>地面格線</span>
        </button>
      </div>

      {/* 右區：復原重做、儲存、匯出與重設 */}
      <div className="flex items-center space-x-1.5">
        {/* 復原 & 重做 */}
        <div className="flex items-center space-x-1 border-r border-slate-200 pr-2 mr-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="復原上一步 (Undo)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="重做 (Redo)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* 儲存到瀏覽器 */}
        <button
          onClick={onSaveLocal}
          className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
          title="儲存進度至瀏覽器"
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">暫存</span>
        </button>

        {/* 匯出 JSON */}
        <button
          onClick={onExportJson}
          className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
          title="匯出場景檔案 (.json)"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">匯出</span>
        </button>

        {/* 匯入 JSON */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
          title="匯入作品檔案 (.json)"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">匯入</span>
        </button>

        {/* 匯出 PNG 圖片 */}
        <button
          onClick={onExportPng}
          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          title="下載高品質 PNG 圖片"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>下載圖片</span>
        </button>

        {/* 預設場景與重設清空 */}
        <div className="flex items-center space-x-1 border-l border-slate-200 pl-2 ml-1">
          <button
            onClick={onResetDefaultScene}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            title="重設為預設透視教室範例"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClearScene}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
            title="清空畫布上的所有物件"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
