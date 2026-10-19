import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  PerspectiveCamera,
  SceneObject,
  ViewSettings,
  LearningMode,
  SceneState
} from './models/types';
import {
  DEFAULT_CAMERA,
  DEFAULT_VIEW_SETTINGS,
  DEFAULT_CLASSROOM_OBJECTS
} from './models/defaultScenes';
import { TEACHING_MISSIONS } from './models/missions';
import { AssetTemplate } from './models/catalog';
import {
  saveSceneToLocal,
  loadSceneFromLocal,
  exportSceneAsJSON,
  parseAndValidateImportedJSON
} from './services/storage';
import { exportSvgAsPng } from './services/exportImage';

import { HeaderToolbar } from './components/Toolbar/HeaderToolbar';
import { AssetLibrary } from './components/Sidebar/AssetLibrary';
import { PerspectiveCanvas } from './components/Canvas/PerspectiveCanvas';
import { ObjectInspector } from './components/Inspector/ObjectInspector';
import { EducationalTips } from './components/Inspector/EducationalTips';
import { CustomObjectModal } from './components/Sidebar/CustomObjectModal';
import { MissionPanel } from './components/MissionDock/MissionPanel';

export const App: React.FC = () => {
  const [camera, setCamera] = useState<PerspectiveCamera>(DEFAULT_CAMERA);
  const [objects, setObjects] = useState<SceneObject[]>(DEFAULT_CLASSROOM_OBJECTS);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>('obj-demo-cube');
  const [viewSettings, setViewSettings] = useState<ViewSettings>(DEFAULT_VIEW_SETTINGS);
  const [mode, setMode] = useState<LearningMode>('explore');
  const [currentMissionId, setCurrentMissionId] = useState<string>(TEACHING_MISSIONS[0].id);

  // 復原 / 重做記錄
  const [historyPast, setHistoryPast] = useState<{ camera: PerspectiveCamera; objects: SceneObject[] }[]>([]);
  const [historyFuture, setHistoryFuture] = useState<{ camera: PerspectiveCamera; objects: SceneObject[] }[]>([]);

  // 彈跳視窗與訊息
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  // 初始載入：檢查本機是否有儲存的作品
  useEffect(() => {
    const saved = loadSceneFromLocal();
    if (saved && saved.objects.length > 0) {
      setCamera(saved.camera);
      setObjects(saved.objects);
      setViewSettings(saved.viewSettings);
      setSelectedObjectId(saved.objects[0]?.id || null);
    }
  }, []);

  // 提示訊息計時器
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // 記錄歷史快照
  const pushHistorySnapshot = useCallback(() => {
    setHistoryPast(prev => [...prev.slice(-25), { camera: { ...camera }, objects: [...objects] }]);
    setHistoryFuture([]);
  }, [camera, objects]);

  // 復原 (Undo)
  const handleUndo = useCallback(() => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    setHistoryPast(prev => prev.slice(0, -1));
    setHistoryFuture(prev => [{ camera: { ...camera }, objects: [...objects] }, ...prev]);
    setCamera(previous.camera);
    setObjects(previous.objects);
  }, [historyPast, camera, objects]);

  // 重做 (Redo)
  const handleRedo = useCallback(() => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    setHistoryFuture(prev => prev.slice(1));
    setHistoryPast(prev => [...prev, { camera: { ...camera }, objects: [...objects] }]);
    setCamera(next.camera);
    setObjects(next.objects);
  }, [historyFuture, camera, objects]);

  // 更新透視點 X
  const handleUpdateVpX = useCallback((newVpX: number) => {
    setCamera(prev => {
      if (Math.abs(prev.vpX - newVpX) < 0.5) return prev;
      return { ...prev, vpX: newVpX };
    });
  }, []);

  // 更新物件位置 (X, Y)
  const handleUpdateObjectPosition = useCallback((id: string, newX: number, newY: number) => {
    setObjects(prev =>
      prev.map(obj => (obj.id === id ? { ...obj, x: newX, y: newY } : obj))
    );
  }, []);

  // 更新物件屬性 (Z 深度、尺寸、顏色等)
  const handleUpdateObject = useCallback((updated: SceneObject) => {
    pushHistorySnapshot();
    setObjects(prev => prev.map(obj => (obj.id === updated.id ? updated : obj)));
  }, [pushHistorySnapshot]);

  // 從素材庫新增物件
  const handleAddObjectFromTemplate = useCallback((template: AssetTemplate) => {
    pushHistorySnapshot();
    const newId = `obj-${template.type}-${Date.now().toString().slice(-4)}`;
    const newObj: SceneObject = {
      id: newId,
      name: template.name,
      category: template.category,
      x: 500,
      y: 470,
      z: 100,
      dimensions: { ...template.defaultDimensions },
      color: template.defaultColor,
      geometryType: template.geometryType,
      customGeometry: template.createGeometry ? template.createGeometry(template.defaultDimensions) : undefined,
      order: objects.length + 1,
      showGuidelines: true
    };

    setObjects(prev => [...prev, newObj]);
    setSelectedObjectId(newId);
    showToast(`已加入「${template.name}」到畫布中！`);
  }, [objects.length, pushHistorySnapshot, showToast]);

  // 新增自訂物件
  const handleAddCustomObject = useCallback((partial: Partial<SceneObject>) => {
    pushHistorySnapshot();
    const newId = `custom-obj-${Date.now().toString().slice(-4)}`;
    const newObj: SceneObject = {
      id: newId,
      name: partial.name || '自訂立體方塊',
      category: 'custom',
      x: partial.x || 500,
      y: partial.y || 460,
      z: partial.z || 80,
      dimensions: partial.dimensions || { width: 100, height: 100, depth: 100 },
      color: partial.color || '#3B82F6',
      geometryType: 'cuboid',
      customGeometry: partial.customGeometry,
      order: objects.length + 1,
      showGuidelines: true
    };

    setObjects(prev => [...prev, newObj]);
    setSelectedObjectId(newId);
    showToast('已建立自訂方塊並加入場景！');
  }, [objects.length, pushHistorySnapshot, showToast]);

  // 刪除物件
  const handleDeleteObject = useCallback((id: string) => {
    pushHistorySnapshot();
    setObjects(prev => prev.filter(o => o.id !== id));
    if (selectedObjectId === id) {
      setSelectedObjectId(null);
    }
    showToast('物件已刪除');
  }, [selectedObjectId, pushHistorySnapshot, showToast]);

  // 複製物件
  const handleDuplicateObject = useCallback((id: string) => {
    const target = objects.find(o => o.id === id);
    if (!target) return;
    pushHistorySnapshot();

    const cloneId = `${target.id}-copy-${Date.now().toString().slice(-3)}`;
    const cloned: SceneObject = {
      ...target,
      id: cloneId,
      name: `${target.name} (複本)`,
      x: target.x + 35,
      y: target.y,
      z: target.z + 40,
      order: objects.length + 1
    };

    setObjects(prev => [...prev, cloned]);
    setSelectedObjectId(cloneId);
    showToast(`已複製「${target.name}」！`);
  }, [objects, pushHistorySnapshot, showToast]);

  // 調整物件前後圖層順序
  const handleReorderObject = useCallback((id: string, direction: 'up' | 'down') => {
    setObjects(prev => {
      const idx = prev.findIndex(o => o.id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx + 1 : idx - 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;

      pushHistorySnapshot();
      const updated = [...prev];
      const temp = updated[idx];
      updated[idx] = updated[targetIdx];
      updated[targetIdx] = temp;
      return updated;
    });
  }, [pushHistorySnapshot]);

  // 視圖開關切換
  const handleToggleViewSetting = useCallback((key: keyof ViewSettings) => {
    setViewSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  // 暫存至瀏覽器
  const handleSaveLocal = useCallback(() => {
    const ok = saveSceneToLocal(camera, objects, viewSettings);
    if (ok) {
      showToast('作品已成功儲存至瀏覽器！');
    } else {
      showToast('儲存失敗，請檢查瀏覽器儲存權限。');
    }
  }, [camera, objects, viewSettings, showToast]);

  // 匯出 JSON
  const handleExportJson = useCallback(() => {
    exportSceneAsJSON(camera, objects, viewSettings);
    showToast('作品 JSON 檔案已匯出下載！');
  }, [camera, objects, viewSettings, showToast]);

  // 匯入 JSON
  const handleImportJson = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = parseAndValidateImportedJSON(content);
      if (result.success && result.data) {
        pushHistorySnapshot();
        setCamera(result.data.camera);
        setObjects(result.data.objects);
        setViewSettings(result.data.viewSettings);
        setSelectedObjectId(result.data.objects[0]?.id || null);
        showToast('作品檔案已成功匯入！');
      } else {
        alert(result.error || '匯入失敗，請確認檔案格式正確。');
      }
    };
    reader.readAsText(file);
  }, [pushHistorySnapshot, showToast]);

  // 匯出 PNG 圖片
  const handleExportPng = useCallback(async () => {
    if (!svgRef.current) return;
    showToast('正在產生高畫質圖片...');
    const ok = await exportSvgAsPng(svgRef.current, '我的單點透視作品.png', 2);
    if (ok) {
      showToast('作品 PNG 圖片已成功下載！');
    } else {
      showToast('圖片匯出失敗，請重試。');
    }
  }, [showToast]);

  // 重設為預設教室場景
  const handleResetDefaultScene = useCallback(() => {
    if (window.confirm('確定要重新載入預設的透視教室場景嗎？目前尚未儲存的變更將會重設。')) {
      pushHistorySnapshot();
      setCamera(DEFAULT_CAMERA);
      setObjects(DEFAULT_CLASSROOM_OBJECTS);
      setViewSettings(DEFAULT_VIEW_SETTINGS);
      setSelectedObjectId('obj-demo-cube');
      showToast('已重新載入透視教室預設場景！');
    }
  }, [pushHistorySnapshot, showToast]);

  // 清空畫布
  const handleClearScene = useCallback(() => {
    if (window.confirm('確定要清空畫布上的所有物件嗎？')) {
      pushHistorySnapshot();
      setObjects([]);
      setSelectedObjectId(null);
      showToast('畫布已清空');
    }
  }, [pushHistorySnapshot, showToast]);

  // 鍵盤快速鍵 (Delete 鍵刪除, Escape 鍵取消選取, Ctrl+Z 復原)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjectId) {
        handleDeleteObject(selectedObjectId);
      } else if (e.key === 'Escape') {
        setSelectedObjectId(null);
      } else if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectId, handleDeleteObject, handleUndo, handleRedo]);

  const selectedObject = objects.find(o => o.id === selectedObjectId) || null;

  // 整合場景狀態供任務驗證器檢查
  const currentSceneState: SceneState = {
    camera,
    objects,
    selectedObjectId,
    viewSettings,
    mode,
    currentMissionId,
    history: { past: historyPast, future: historyFuture }
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-100 select-none overflow-hidden">
      {/* 浮動通知訊息 Toast */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-150">
          {toastMessage}
        </div>
      )}

      {/* 頂部功能選單列 */}
      <HeaderToolbar
        mode={mode}
        onToggleMode={setMode}
        canUndo={historyPast.length > 0}
        canRedo={historyFuture.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        viewSettings={viewSettings}
        onToggleViewSetting={handleToggleViewSetting}
        onSaveLocal={handleSaveLocal}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onExportPng={handleExportPng}
        onResetDefaultScene={handleResetDefaultScene}
        onClearScene={handleClearScene}
      />

      {/* 主工作區域：三欄式配置 (左側素材庫、中央畫布、右側檢視編輯) */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* 左側素材庫 */}
        <AssetLibrary
          onAddObject={handleAddObjectFromTemplate}
          onOpenCustomModal={() => setIsCustomModalOpen(true)}
        />

        {/* 中央互動畫布區域 */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-200/60 p-3 relative">
          <PerspectiveCanvas
            camera={camera}
            objects={objects}
            selectedObjectId={selectedObjectId}
            viewSettings={viewSettings}
            onSelectObject={setSelectedObjectId}
            onUpdateObjectPosition={handleUpdateObjectPosition}
            onUpdateVpX={handleUpdateVpX}
            svgRef={svgRef}
          />
        </main>

        {/* 右側物件編輯面板與即時動態教學提示 */}
        <div className="flex flex-col w-80 bg-white border-l border-slate-200 shadow-sm shrink-0">
          <div className="p-3 border-b border-slate-100">
            <EducationalTips
              selectedObject={selectedObject}
              camera={camera}
              objectCount={objects.length}
            />
          </div>
          <div className="flex-1 min-h-0">
            <ObjectInspector
              selectedObject={selectedObject}
              onUpdateObject={handleUpdateObject}
              onDeleteObject={handleDeleteObject}
              onDuplicateObject={handleDuplicateObject}
              onReorderObject={handleReorderObject}
            />
          </div>
        </div>
      </div>

      {/* 底部教學任務挑戰 Dock (僅在教學任務模式下顯示或常駐開展) */}
      {mode === 'mission' && (
        <MissionPanel
          currentMissionId={currentMissionId}
          sceneState={currentSceneState}
          onSelectMission={setCurrentMissionId}
          onExitMissionMode={() => setMode('explore')}
        />
      )}

      {/* 自訂方塊彈跳視窗 */}
      <CustomObjectModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onAddCustomObject={handleAddCustomObject}
      />
    </div>
  );
};
