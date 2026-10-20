import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  PerspectiveCamera,
  SceneObject,
  ViewSettings,
  LearningMode,
  SceneState,
  MainMode,
  RoomSubMode,
  RoomColors,
  RoomFrame,
  RenderStyle
} from './models/types';
import {
  DEFAULT_CAMERA,
  DEFAULT_VIEW_SETTINGS,
  DEFAULT_ROOM_FRAME,
  DEFAULT_ROOM_COLORS,
  DEFAULT_ROOM_OBJECTS,
  DEFAULT_BASIC_OBJECTS
} from './models/defaultScenes';
import { ROOM_MISSIONS, BASIC_MISSIONS } from './models/missions';
import { AssetTemplate } from './models/catalog';
import { RoomAssetTemplate } from './models/roomCatalog';
import {
  saveSceneToLocal,
  loadSceneFromLocal,
  exportSceneAsJSON,
  parseAndValidateImportedJSON
} from './services/storage';
import { exportSvgAsPng } from './services/exportImage';

import { HeaderToolbar } from './components/Toolbar/HeaderToolbar';
import { AssetLibrary } from './components/Sidebar/AssetLibrary';
import { RoomAssetLibrary } from './components/Sidebar/RoomAssetLibrary';
import { PerspectiveCanvas } from './components/Canvas/PerspectiveCanvas';
import { RoomCanvas } from './components/Canvas/RoomCanvas';
import { ObjectInspector } from './components/Inspector/ObjectInspector';
import { RoomInspector } from './components/Inspector/RoomInspector';
import { EducationalTips } from './components/Inspector/EducationalTips';
import { CustomObjectModal } from './components/Sidebar/CustomObjectModal';
import { MissionPanel } from './components/MissionDock/MissionPanel';
import { PackagePlus, Sliders, X } from 'lucide-react';

export const App: React.FC = () => {
  // 主模式：'room' (室內空間透視) 或 'basic' (基礎透視練習)
  const [mainMode, setMainMode] = useState<MainMode>('room');
  const [roomSubMode, setRoomSubMode] = useState<RoomSubMode>('furnish');
  const [learningMode, setLearningMode] = useState<LearningMode>('explore');

  // 平板/iPad 畫布極大化：側邊欄收折狀態 (預設關閉以最大化畫布，點選物件或按鈕自動喚出)
  const [isLeftOpen, setIsLeftOpen] = useState<boolean>(false);
  const [isRightOpen, setIsRightOpen] = useState<boolean>(false);

  // 相機與視圖
  const [camera, setCamera] = useState<PerspectiveCamera>(DEFAULT_CAMERA);
  const [roomFrame] = useState<RoomFrame>(DEFAULT_ROOM_FRAME);
  const [roomColors, setRoomColors] = useState<RoomColors>(DEFAULT_ROOM_COLORS);
  const [objects, setObjects] = useState<SceneObject[]>(DEFAULT_ROOM_OBJECTS);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>('room-art-back');
  const [viewSettings, setViewSettings] = useState<ViewSettings>(DEFAULT_VIEW_SETTINGS);

  // 任務 ID (預設對應主模式之第一個任務)
  const [currentMissionId, setCurrentMissionId] = useState<string>(ROOM_MISSIONS[0].id);

  // 歷史記錄 (復原/重做)
  const [historyPast, setHistoryPast] = useState<{
    camera: PerspectiveCamera;
    objects: SceneObject[];
    roomColors: RoomColors;
    mainMode: MainMode;
  }[]>([]);
  const [historyFuture, setHistoryFuture] = useState<{
    camera: PerspectiveCamera;
    objects: SceneObject[];
    roomColors: RoomColors;
    mainMode: MainMode;
  }[]>([]);

  // 彈跳視窗與提示
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // 歷史快照
  const pushHistorySnapshot = useCallback(() => {
    setHistoryPast(prev => [
      ...prev.slice(-25),
      {
        camera: { ...camera },
        objects: [...objects],
        roomColors: { ...roomColors },
        mainMode
      }
    ]);
    setHistoryFuture([]);
  }, [camera, objects, roomColors, mainMode]);

  // 復原 (Undo)
  const handleUndo = useCallback(() => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    setHistoryPast(prev => prev.slice(0, -1));
    setHistoryFuture(prev => [
      {
        camera: { ...camera },
        objects: [...objects],
        roomColors: { ...roomColors },
        mainMode
      },
      ...prev
    ]);
    setCamera(previous.camera);
    setObjects(previous.objects);
    setRoomColors(previous.roomColors);
    setMainMode(previous.mainMode);
  }, [historyPast, camera, objects, roomColors, mainMode]);

  // 重做 (Redo)
  const handleRedo = useCallback(() => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    setHistoryFuture(prev => prev.slice(1));
    setHistoryPast(prev => [
      ...prev,
      {
        camera: { ...camera },
        objects: [...objects],
        roomColors: { ...roomColors },
        mainMode
      }
    ]);
    setCamera(next.camera);
    setObjects(next.objects);
    setRoomColors(next.roomColors);
    setMainMode(next.mainMode);
  }, [historyFuture, camera, objects, roomColors, mainMode]);

  // 切換主模式 (基礎透視 vs 室內空間)
  const handleToggleMainMode = useCallback((newMode: MainMode) => {
    if (newMode === mainMode) return;
    pushHistorySnapshot();
    setMainMode(newMode);
    if (newMode === 'room') {
      setObjects(DEFAULT_ROOM_OBJECTS);
      setSelectedObjectId('room-art-back');
      setCurrentMissionId(ROOM_MISSIONS[0].id);
      showToast('已切換至「室內空間透視」模式！');
    } else {
      setObjects(DEFAULT_BASIC_OBJECTS);
      setSelectedObjectId('basic-demo-cube');
      setCurrentMissionId(BASIC_MISSIONS[0].id);
      showToast('已切換至「基礎透視練習」模式！');
    }
  }, [mainMode, pushHistorySnapshot, showToast]);

  // 室內模式切換子階段 (空房間 / 房間佈置 / 完成作品)
  const handleToggleRoomSubMode = useCallback((subMode: RoomSubMode) => {
    setRoomSubMode(subMode);
    if (subMode === 'empty') {
      showToast('目前為「空房間」階段：觀察視平線與四角深度線條！');
    } else if (subMode === 'furnish') {
      showToast('目前為「房間佈置」階段：從左側素材庫新增家具與掛畫！');
    } else if (subMode === 'color') {
      showToast('目前為「完成作品」階段：在右側面板著色並下載圖片！');
    }
  }, [showToast]);

  // 更新透視點 X (保持嚴格水平移動)
  const handleUpdateVpX = useCallback((newVpX: number) => {
    setCamera(prev => {
      if (Math.abs(prev.vpX - newVpX) < 0.5) return prev;
      return { ...prev, vpX: newVpX };
    });
  }, []);

  // 更新物件屬性
  const handleUpdateObject = useCallback((updated: SceneObject) => {
    pushHistorySnapshot();
    setObjects(prev => prev.map(obj => (obj.id === updated.id ? updated : obj)));
  }, [pushHistorySnapshot]);

  // 更新物件位置 (基礎模式)
  const handleUpdateObjectPosition = useCallback((id: string, newX: number, newY: number) => {
    setObjects(prev =>
      prev.map(obj => (obj.id === id ? { ...obj, x: newX, y: newY } : obj))
    );
  }, []);

  // 新增室內房間物件
  const handleAddRoomObject = useCallback((template: RoomAssetTemplate) => {
    pushHistorySnapshot();
    const newId = `room-${template.type}-${Date.now().toString().slice(-4)}`;

    const newObj: SceneObject = {
      id: newId,
      name: template.name,
      category: template.category,
      x: 500,
      y: 450,
      z: 300,
      dimensions: { ...template.defaultDimensions },
      color: template.defaultColor,
      secondaryColor: template.secondaryColor,
      geometryType: template.type,
      imageUrl: template.imageUrl,
      order: objects.length + 1,
      showGuidelines: true,
      wallAnchor: template.defaultWallAnchor ? { ...template.defaultWallAnchor } : undefined,
      roomFloorX: template.isWallObject ? undefined : 0.5,
      roomFloorZ: template.isWallObject ? undefined : 0.45
    };

    setObjects(prev => [...prev, newObj]);
    setSelectedObjectId(newId);
    setIsLeftOpen(false);
    setIsRightOpen(true);
    showToast(`已將「${template.name}」加入房間！`);
  }, [objects.length, pushHistorySnapshot, showToast]);

  // 新增基礎模式物件
  const handleAddBasicObject = useCallback((template: AssetTemplate) => {
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
      order: objects.length + 1,
      showGuidelines: true
    };

    setObjects(prev => [...prev, newObj]);
    setSelectedObjectId(newId);
    setIsLeftOpen(false);
    setIsRightOpen(true);
    showToast(`已加入「${template.name}」到畫布中！`);
  }, [objects.length, pushHistorySnapshot, showToast]);

  // 平板優化：點選物件時自動開啟右側屬性，方便立即調整尺寸與顏色
  const handleSelectObject = useCallback((id: string | null) => {
    setSelectedObjectId(id);
    if (id) {
      setIsRightOpen(true);
    }
  }, []);

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
      order: objects.length + 1,
      wallAnchor: target.wallAnchor
        ? {
            ...target.wallAnchor,
            u: Math.min(0.7, target.wallAnchor.u + 0.08)
          }
        : undefined,
      roomFloorX: target.roomFloorX ? Math.min(0.85, target.roomFloorX + 0.08) : undefined,
      roomFloorZ: target.roomFloorZ ? Math.min(0.85, target.roomFloorZ + 0.08) : undefined,
      x: target.x + 35,
      z: target.z + 40
    };

    setObjects(prev => [...prev, cloned]);
    setSelectedObjectId(cloneId);
    showToast(`已複製「${target.name}」！`);
  }, [objects, pushHistorySnapshot, showToast]);

  // 更新風格與視圖開關
  const handleUpdateRenderStyle = useCallback((style: RenderStyle) => {
    setViewSettings(prev => ({ ...prev, renderStyle: style }));
  }, []);

  const handleToggleViewSetting = useCallback((key: keyof ViewSettings) => {
    setViewSettings(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // 儲存至瀏覽器
  const handleSaveLocal = useCallback(() => {
    const ok = saveSceneToLocal(
      mainMode,
      roomSubMode,
      camera,
      roomFrame,
      roomColors,
      objects,
      viewSettings
    );
    if (ok) {
      showToast('作品已成功儲存至瀏覽器！');
    } else {
      showToast('儲存失敗，請檢查瀏覽器設定。');
    }
  }, [mainMode, roomSubMode, camera, roomFrame, roomColors, objects, viewSettings, showToast]);

  // 匯出 JSON
  const handleExportJson = useCallback(() => {
    exportSceneAsJSON(
      mainMode,
      roomSubMode,
      camera,
      roomFrame,
      roomColors,
      objects,
      viewSettings
    );
    showToast('作品 JSON 檔案已匯出！');
  }, [mainMode, roomSubMode, camera, roomFrame, roomColors, objects, viewSettings, showToast]);

  // 匯入 JSON
  const handleImportJson = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      const result = parseAndValidateImportedJSON(content);
      if (result.success && result.data) {
        pushHistorySnapshot();
        setMainMode(result.data.mainMode);
        setRoomSubMode(result.data.roomSubMode);
        setCamera(result.data.camera);
        setRoomColors(result.data.roomColors);
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
    showToast('正在產生高畫質作品圖片...');
    const filename = `單點透視作品_${mainMode === 'room' ? '室內空間' : '基礎幾何'}.png`;
    const ok = await exportSvgAsPng(svgRef.current, filename, 2);
    if (ok) {
      showToast('作品圖片已成功下載！');
    } else {
      showToast('圖片匯出失敗，請重試。');
    }
  }, [mainMode, showToast]);

  // 重設為預設場景
  const handleResetDefaultScene = useCallback(() => {
    if (window.confirm('確定要重新載入預設場景嗎？')) {
      pushHistorySnapshot();
      setCamera(DEFAULT_CAMERA);
      setViewSettings(DEFAULT_VIEW_SETTINGS);
      if (mainMode === 'room') {
        setRoomColors(DEFAULT_ROOM_COLORS);
        setObjects(DEFAULT_ROOM_OBJECTS);
        setSelectedObjectId('room-art-back');
      } else {
        setObjects(DEFAULT_BASIC_OBJECTS);
        setSelectedObjectId('basic-demo-cube');
      }
      showToast('已重新載入預設場景！');
    }
  }, [mainMode, pushHistorySnapshot, showToast]);

  // 清空場景
  const handleClearScene = useCallback(() => {
    if (window.confirm('確定要清空畫布上的所有物件嗎？')) {
      pushHistorySnapshot();
      setObjects([]);
      setSelectedObjectId(null);
      showToast('畫布已清空');
    }
  }, [pushHistorySnapshot, showToast]);

  // 初始載入檢查 LocalStorage
  useEffect(() => {
    const saved = loadSceneFromLocal();
    if (saved && saved.objects.length > 0) {
      setMainMode(saved.mainMode);
      setRoomSubMode(saved.roomSubMode);
      setCamera(saved.camera);
      setRoomColors(saved.roomColors);
      setObjects(saved.objects);
      setViewSettings(saved.viewSettings);
      setSelectedObjectId(saved.objects[0]?.id || null);
    }
  }, []);

  const selectedObject = objects.find(o => o.id === selectedObjectId) || null;

  // 場景整合狀態 (供教學任務檢查)
  const currentSceneState: SceneState = {
    mainMode,
    roomSubMode,
    camera,
    roomFrame,
    roomColors,
    objects,
    selectedObjectId,
    viewSettings,
    mode: learningMode,
    currentMissionId,
    history: { past: historyPast, future: historyFuture }
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-100 select-none overflow-hidden font-sans">
      {/* 浮動訊息 Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xl backdrop-blur-sm">
          {toastMessage}
        </div>
      )}

      {/* 頂部全域工具列 (精簡單層平板設計) */}
      <HeaderToolbar
        mainMode={mainMode}
        roomSubMode={roomSubMode}
        learningMode={learningMode}
        onToggleMainMode={handleToggleMainMode}
        onToggleRoomSubMode={handleToggleRoomSubMode}
        onToggleLearningMode={setLearningMode}
        canUndo={historyPast.length > 0}
        canRedo={historyFuture.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        viewSettings={viewSettings}
        onToggleViewSetting={handleToggleViewSetting}
        onUpdateRenderStyle={handleUpdateRenderStyle}
        onSaveLocal={handleSaveLocal}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onExportPng={handleExportPng}
        onResetDefaultScene={handleResetDefaultScene}
        onClearScene={handleClearScene}
        isLeftOpen={isLeftOpen}
        onToggleLeft={() => setIsLeftOpen(prev => !prev)}
        isRightOpen={isRightOpen}
        onToggleRight={() => setIsRightOpen(prev => !prev)}
      />

      {/* 主工作區：畫布最大化容器 (iPad 平板全寬度設計) */}
      <div className="flex-1 relative min-h-0 w-full overflow-hidden flex bg-slate-200/80">
        
        {/* 左側抽屜：素材庫 (Drawer Overlay，不壓扁畫布) */}
        {isLeftOpen && (
          <div className="absolute top-0 left-0 bottom-0 z-30 w-72 sm:w-80 bg-white/95 backdrop-blur-md shadow-2xl border-r-2 border-amber-300 flex flex-col drawer-left h-full">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white font-black text-xs shadow-xs">
              <span className="flex items-center gap-1.5 text-sm">
                <PackagePlus className="w-4 h-4" />
                <span>🎒 物件素材庫</span>
              </span>
              <button
                onClick={() => setIsLeftOpen(false)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
                title="關閉素材庫"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              {mainMode === 'room' ? (
                <RoomAssetLibrary onAddRoomObject={handleAddRoomObject} />
              ) : (
                <AssetLibrary
                  onAddObject={handleAddBasicObject}
                  onOpenCustomModal={() => setIsCustomModalOpen(true)}
                />
              )}
            </div>
          </div>
        )}

        {/* 中央互動透視大畫布 (佔據 100% 空間) */}
        <main className="w-full h-full flex-1 flex flex-col min-w-0 p-1 sm:p-2 relative bg-slate-100 overflow-hidden">
          
          {/* 畫布左上浮動按鈕：🎒 + 加入物件 */}
          <button
            onClick={() => setIsLeftOpen(prev => !prev)}
            className={`absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl shadow-lg border-2 text-xs font-black transition-all active:scale-95 ${
              isLeftOpen
                ? 'bg-slate-800 text-white border-slate-700'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-white'
            }`}
            title="開啟物件素材庫"
          >
            <PackagePlus className="w-4 h-4" />
            <span>{isLeftOpen ? '✕ 關閉素材' : '🎒 + 加入物件'}</span>
          </button>

          {/* 畫布右上浮動按鈕：🎨 調整物件 */}
          <button
            onClick={() => setIsRightOpen(prev => !prev)}
            className={`absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl shadow-lg border-2 text-xs font-black transition-all active:scale-95 ${
              isRightOpen
                ? 'bg-slate-800 text-white border-slate-700'
                : selectedObject
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-white shadow-blue-200'
                : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-white'
            }`}
            title="開啟/收合物件屬性面板"
          >
            <Sliders className="w-4 h-4" />
            <span>{isRightOpen ? '✕ 關閉屬性' : selectedObject ? `🎨 調整：${selectedObject.name}` : '🎨 物件屬性'}</span>
          </button>

          {/* 畫布底部小幫手提示條 (平板防呆引導) */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3.5 py-1 rounded-full border border-amber-200/90 shadow-md text-[11px] font-bold text-amber-950">
            <span>💡 秘訣：用手指滑動黃色「透視點 (VP)」，或點選畫布上的物件改變尺寸！</span>
          </div>

          {/* 核心 SVG 畫布渲染 */}
          {mainMode === 'room' ? (
            <RoomCanvas
              camera={camera}
              roomFrame={roomFrame}
              roomColors={roomColors}
              objects={roomSubMode === 'empty' ? [] : objects}
              selectedObjectId={selectedObjectId}
              viewSettings={viewSettings}
              onSelectObject={handleSelectObject}
              onUpdateObject={handleUpdateObject}
              onUpdateVpX={handleUpdateVpX}
              svgRef={svgRef}
            />
          ) : (
            <PerspectiveCanvas
              camera={camera}
              objects={objects}
              selectedObjectId={selectedObjectId}
              viewSettings={viewSettings}
              onSelectObject={handleSelectObject}
              onUpdateObjectPosition={handleUpdateObjectPosition}
              onUpdateVpX={handleUpdateVpX}
              svgRef={svgRef}
            />
          )}
        </main>

        {/* 右側抽屜：物件屬性與顏色調整 (Drawer Overlay，不壓扁畫布) */}
        {isRightOpen && (
          <div className="absolute top-0 right-0 bottom-0 z-30 w-80 sm:w-88 bg-white/95 backdrop-blur-md shadow-2xl border-l-2 border-blue-300 flex flex-col drawer-right h-full">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs shadow-xs">
              <span className="flex items-center gap-1.5 text-sm">
                <Sliders className="w-4 h-4" />
                <span>🎨 物件屬性與微調</span>
              </span>
              <button
                onClick={() => setIsRightOpen(false)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
                title="關閉屬性面板"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 border-b border-amber-100 bg-amber-50/70 shrink-0">
              <EducationalTips
                selectedObject={selectedObject}
                camera={camera}
                objectCount={objects.length}
              />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              {mainMode === 'room' ? (
                <RoomInspector
                  selectedObject={selectedObject}
                  roomColors={roomColors}
                  renderStyle={viewSettings.renderStyle}
                  onUpdateObject={handleUpdateObject}
                  onDeleteObject={handleDeleteObject}
                  onDuplicateObject={handleDuplicateObject}
                  onUpdateRoomColors={setRoomColors}
                  onUpdateRenderStyle={handleUpdateRenderStyle}
                />
              ) : (
                <ObjectInspector
                  selectedObject={selectedObject}
                  onUpdateObject={handleUpdateObject}
                  onDeleteObject={handleDeleteObject}
                  onDuplicateObject={handleDuplicateObject}
                  onReorderObject={() => {}}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* 底部教學任務挑戰 Dock */}
      {learningMode === 'mission' && (
        <MissionPanel
          currentMissionId={currentMissionId}
          sceneState={currentSceneState}
          onSelectMission={setCurrentMissionId}
          onExitMissionMode={() => setLearningMode('explore')}
        />
      )}

      {/* 自訂方塊彈跳視窗 (基礎模式) */}
      <CustomObjectModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onAddCustomObject={obj => {
          if (obj.name) {
            handleAddBasicObject({
              type: 'custom',
              name: obj.name,
              category: 'custom',
              description: '自訂長方體',
              defaultDimensions: obj.dimensions || { width: 100, height: 100, depth: 100 },
              defaultColor: obj.color || '#3b82f6',
              iconName: 'Box',
              geometryType: 'cuboid'
            });
          }
        }}
      />
    </div>
  );
};
