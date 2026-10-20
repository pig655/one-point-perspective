import React, { useRef, useState, useEffect } from 'react';
import {
  Trophy,
  Undo2,
  Redo2,
  Save,
  Download,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Box,
  Home,
  Trash2,
  QrCode,
  Eye,
  EyeOff,
  Settings,
  X,
  PackagePlus,
  Sliders
} from 'lucide-react';
import { MainMode, RoomSubMode, RenderStyle, ViewSettings, LearningMode } from '../../models/types';
import { QRCodeModal } from '../Modal/QRCodeModal';

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
  // 側邊欄開關 (iPad 畫布極大化支援)
  isLeftOpen?: boolean;
  onToggleLeft?: () => void;
  isRightOpen?: boolean;
  onToggleRight?: () => void;
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
  onClearScene,
  isLeftOpen = true,
  onToggleLeft,
  isRightOpen = true,
  onToggleRight
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
      e.target.value = '';
    }
  };

  // 點擊選單外部自動關閉更多選單
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreMenu]);

  // 一鍵切換所有透視輔助線 (iPad 簡潔化)
  const isAnyGuidelineOn = viewSettings.showPerspectiveLines || viewSettings.showHorizonLine;
  const handleToggleAllGuidelines = () => {
    const targetState = !isAnyGuidelineOn;
    if (viewSettings.showPerspectiveLines !== targetState) onToggleViewSetting('showPerspectiveLines');
    if (viewSettings.showHorizonLine !== targetState) onToggleViewSetting('showHorizonLine');
    if (viewSettings.showFloorLines !== targetState) onToggleViewSetting('showFloorLines');
  };

  return (
    <header className="bg-white border-b-2 border-amber-200/90 px-3 py-1.5 flex items-center justify-between select-none shadow-xs z-30 shrink-0 min-h-[54px]">
      {/* 隱藏的檔案上傳輸入框 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 左區：Logo 與雙主模式切換 (iPad 大膠囊) */}
      <div className="flex items-center space-x-2">
        {/* 左側素材庫開關 (iPad 快速喚出) */}
        {onToggleLeft && (
          <button
            onClick={onToggleLeft}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs border transition-all ${
              isLeftOpen
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                : 'bg-slate-100 hover:bg-amber-50 text-slate-700 border-slate-200'
            }`}
            title="開啟/收合素材庫"
          >
            <PackagePlus className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">素材庫</span>
          </button>
        )}

        <div className="flex items-center space-x-1.5 mr-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 via-orange-400 to-indigo-500 flex items-center justify-center text-white shadow-xs text-base">
            🎨
          </div>
          <span className="font-black text-slate-800 text-sm tracking-tight hidden md:inline">
            單點透視教室
          </span>
        </div>

        {/* 模式一 (基礎透視) 與 模式二 (室內空間) 切換大按鈕 */}
        <div className="flex p-0.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => onToggleMainMode('basic')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              mainMode === 'basic'
                ? 'bg-blue-600 text-white shadow-xs scale-102'
                : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>🧭 基礎練習</span>
          </button>
          <button
            onClick={() => onToggleMainMode('room')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              mainMode === 'room'
                ? 'bg-indigo-600 text-white shadow-xs scale-102'
                : 'text-slate-600 hover:text-indigo-700'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>🏠 室內房間</span>
          </button>
        </div>
      </div>

      {/* 中區：室內學習步驟 (空房間 ➔ 佈置 ➔ 塗色) 或 挑戰任務 */}
      <div className="flex items-center space-x-1">
        {mainMode === 'room' ? (
          <div className="flex p-0.5 bg-amber-50 rounded-2xl border border-amber-200">
            <button
              onClick={() => onToggleRoomSubMode('empty')}
              className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
                roomSubMode === 'empty'
                  ? 'bg-white text-indigo-700 shadow-xs scale-102'
                  : 'text-slate-600 hover:text-indigo-900'
              }`}
            >
              🚪 1. 空房間
            </button>
            <button
              onClick={() => onToggleRoomSubMode('furnish')}
              className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
                roomSubMode === 'furnish'
                  ? 'bg-white text-indigo-700 shadow-xs scale-102'
                  : 'text-slate-600 hover:text-indigo-900'
              }`}
            >
              🛋️ 2. 佈置家具
            </button>
            <button
              onClick={() => onToggleRoomSubMode('color')}
              className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
                roomSubMode === 'color'
                  ? 'bg-white text-emerald-700 shadow-xs scale-102'
                  : 'text-slate-600 hover:text-emerald-900'
              }`}
            >
              🎨 3. 完成塗色
            </button>
          </div>
        ) : (
          <button
            onClick={() => onToggleLearningMode(learningMode === 'explore' ? 'mission' : 'explore')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-2xl text-xs font-black border transition-all ${
              learningMode === 'mission'
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>{learningMode === 'mission' ? '⭐ 闖關任務進行中' : '🏆 挑戰教學關卡'}</span>
          </button>
        )}
      </div>

      {/* 右區：復原重做、一鍵輔助線、存圖、QR 碼、更多選單 */}
      <div className="flex items-center space-x-1.5">
        {/* 復原 / 重做 (大按鈕、拇指友善) */}
        <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white disabled:opacity-25 disabled:pointer-events-none transition-colors"
            title="復原上一步"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-white disabled:opacity-25 disabled:pointer-events-none transition-colors"
            title="重做下一步"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* 👁️ 一鍵透視輔助線開關 */}
        <button
          onClick={handleToggleAllGuidelines}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-black border transition-all ${
            isAnyGuidelineOn
              ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
          }`}
          title="顯示或隱藏透視射線"
        >
          {isAnyGuidelineOn ? <Eye className="w-4 h-4 text-slate-900" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
          <span className="hidden sm:inline">輔助線</span>
        </button>

        {/* 📸 存圖片大按鈕 */}
        <button
          onClick={onExportPng}
          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-xs transition-all"
          title="下載作品圖片 (PNG)"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>存作品</span>
        </button>

        {/* 📱 平板連線 QR Code 按鈕 */}
        <button
          onClick={() => setShowQrModal(true)}
          className="flex items-center space-x-1 px-2.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-xs transition-all"
          title="平板掃描 QR Code 進入教室"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">QR 碼</span>
        </button>

        {/* 右側屬性面板開關 (iPad 快速喚出) */}
        {onToggleRight && (
          <button
            onClick={onToggleRight}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs border transition-all ${
              isRightOpen
                ? 'bg-blue-100 text-blue-900 border-blue-300 shadow-xs'
                : 'bg-slate-100 hover:bg-blue-50 text-slate-700 border-slate-200'
            }`}
            title="開啟/收合物件屬性面板"
          >
            <Sliders className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">屬性</span>
          </button>
        )}

        {/* ⚙️ 更多選單 (次要進階功能收納) */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMoreMenu(prev => !prev)}
            className={`p-1.5 rounded-xl border transition-colors ${
              showMoreMenu
                ? 'bg-slate-200 text-slate-900 border-slate-400 shadow-inner'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
            }`}
            title="更多工具與設定"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* 更多功能彈出卡片 */}
          {showMoreMenu && (
            <div className="absolute right-0 top-11 w-64 bg-white rounded-2xl shadow-2xl border-2 border-slate-200 p-3 z-50 space-y-2.5 animate-scale-up">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 text-xs font-black text-slate-700">
                <span>⚙️ 教室工具與設定</span>
                <button
                  onClick={() => setShowMoreMenu(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 畫面風格切換 */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1">作品呈現風格：</span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    onClick={() => { onUpdateRenderStyle('colored'); setShowMoreMenu(false); }}
                    className={`py-1.5 px-2 rounded-xl font-bold border transition-all text-center ${
                      viewSettings.renderStyle === 'colored'
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🎨 彩色作品
                  </button>
                  <button
                    onClick={() => { onUpdateRenderStyle('wireframe'); setShowMoreMenu(false); }}
                    className={`py-1.5 px-2 rounded-xl font-bold border transition-all text-center ${
                      viewSettings.renderStyle === 'wireframe'
                        ? 'bg-slate-800 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ✏️ 黑白線稿
                  </button>
                </div>
              </div>

              {/* 輔助線細項切換 */}
              <div className="pt-1.5 border-t border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 block">輔助線細項：</span>
                <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer p-1 rounded hover:bg-slate-50">
                  <span>視平線 (Horizon)</span>
                  <input
                    type="checkbox"
                    checked={viewSettings.showHorizonLine}
                    onChange={() => onToggleViewSetting('showHorizonLine')}
                    className="accent-amber-500"
                  />
                </label>
                <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer p-1 rounded hover:bg-slate-50">
                  <span>透視點 (VP)</span>
                  <input
                    type="checkbox"
                    checked={viewSettings.showVanishingPoint}
                    onChange={() => onToggleViewSetting('showVanishingPoint')}
                    className="accent-amber-500"
                  />
                </label>
                <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer p-1 rounded hover:bg-slate-50">
                  <span>深度透視射線</span>
                  <input
                    type="checkbox"
                    checked={viewSettings.showPerspectiveLines}
                    onChange={() => onToggleViewSetting('showPerspectiveLines')}
                    className="accent-amber-500"
                  />
                </label>
              </div>

              {/* 檔案存檔與讀取 */}
              <div className="pt-1.5 border-t border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 block">作品保存：</span>
                <button
                  onClick={() => { onSaveLocal(); setShowMoreMenu(false); }}
                  className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Save className="w-4 h-4 text-blue-500" />
                  <span>暫存進度至瀏覽器</span>
                </button>
                <button
                  onClick={() => { onExportJson(); setShowMoreMenu(false); }}
                  className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Download className="w-4 h-4 text-indigo-500" />
                  <span>匯出場景專案檔 (.json)</span>
                </button>
                <button
                  onClick={() => { fileInputRef.current?.click(); setShowMoreMenu(false); }}
                  className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <Upload className="w-4 h-4 text-emerald-500" />
                  <span>匯入場景專案檔 (.json)</span>
                </button>
              </div>

              {/* 重設與清空 */}
              <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5">
                <button
                  onClick={() => { onResetDefaultScene(); setShowMoreMenu(false); }}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>重設場景</span>
                </button>
                <button
                  onClick={() => { onClearScene(); setShowMoreMenu(false); }}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>清空畫布</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 學生平板連線 QR Code 彈跳視窗 */}
      <QRCodeModal isOpen={showQrModal} onClose={() => setShowQrModal(false)} />
    </header>
  );
};
