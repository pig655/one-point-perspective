import React, { useMemo } from 'react';
import { SceneObject, PerspectiveCamera, ViewSettings, ProjectedObject } from '../../models/types';
import { projectSceneObject } from '../../core/geometry';
import { GroundGrid } from './GroundGrid';
import { HorizonLine } from './HorizonLine';
import { VanishingPoint } from './VanishingPoint';
import { PerspectiveLines } from './PerspectiveLines';
import { SceneObjectView } from './SceneObjectView';

interface PerspectiveCanvasProps {
  camera: PerspectiveCamera;
  objects: SceneObject[];
  selectedObjectId: string | null;
  viewSettings: ViewSettings;
  onSelectObject: (id: string | null) => void;
  onUpdateObjectPosition: (id: string, x: number, y: number) => void;
  onUpdateVpX: (newVpX: number) => void;
  svgRef: React.RefObject<SVGSVGElement>;
}

export const PerspectiveCanvas: React.FC<PerspectiveCanvasProps> = ({
  camera,
  objects,
  selectedObjectId,
  viewSettings,
  onSelectObject,
  onUpdateObjectPosition,
  onUpdateVpX,
  svgRef
}) => {
  const { canvasWidth, canvasHeight, vpY } = camera;

  // 計算並投影所有場景物件
  const projectedObjects: ProjectedObject[] = useMemo(() => {
    return objects.map(obj => {
      const isSelected = obj.id === selectedObjectId;
      return projectSceneObject(obj, camera, isSelected);
    });
  }, [objects, camera, selectedObjectId]);

  // 物件深度排序 (畫家演算法：深度 Z 較大的物件先畫，近處物件後畫遮擋遠處)
  const sortedObjects = useMemo(() => {
    return [...objects]
      .map(obj => {
        const proj = projectedObjects.find(p => p.id === obj.id);
        return {
          original: obj,
          projected: proj!,
          depth: proj ? proj.centerDepth : obj.z
        };
      })
      .sort((a, b) => b.depth - a.depth);
  }, [objects, projectedObjects]);

  // 點擊畫布空白處取消選取
  const handleCanvasClick = (e: React.MouseEvent) => {
    if ((e.target as Element).tagName === 'svg' || (e.target as Element).id === 'canvas-backdrop') {
      onSelectObject(null);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-100 overflow-hidden select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        className="w-full h-full max-h-[82vh] shadow-lg rounded-xl border border-slate-300 bg-white"
        onClick={handleCanvasClick}
        style={{ touchAction: 'none' }}
      >
        <defs>
          {/* 天空與遠景漸層 */}
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>

          {/* 地面微漸層 */}
          <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>

        {/* 背景：天空區域 (視平線以上) */}
        <rect
          id="canvas-backdrop-sky"
          x="0"
          y="0"
          width={canvasWidth}
          height={vpY}
          fill="url(#skyGradient)"
        />

        {/* 背景：地面區域 (視平線以下) */}
        <rect
          id="canvas-backdrop-ground"
          x="0"
          y={vpY}
          width={canvasWidth}
          height={canvasHeight - vpY}
          fill="url(#groundGradient)"
        />

        {/* 1. 地面透視網格 */}
        <GroundGrid camera={camera} show={viewSettings.showGroundGrid} />

        {/* 2. 視平線 */}
        <HorizonLine camera={camera} show={viewSettings.showHorizonLine} />

        {/* 3. 透視射線/輔助線 (位於物體下方或穿透顯示) */}
        <PerspectiveLines
          projectedObjects={projectedObjects}
          showGlobalLines={viewSettings.showPerspectiveLines}
          selectedObjectId={selectedObjectId}
        />

        {/* 4. 物件幾何渲染 (依深度由遠到近渲染) */}
        {sortedObjects.map(({ original, projected }) => (
          <SceneObjectView
            key={original.id}
            projected={projected}
            original={original}
            isSelected={original.id === selectedObjectId}
            onSelect={onSelectObject}
            onUpdatePosition={onUpdateObjectPosition}
            svgRef={svgRef}
            canvasWidth={canvasWidth}
          />
        ))}

        {/* 5. 透視點控制手柄 (最頂層，確保隨時可抓取拖曳) */}
        <VanishingPoint
          camera={camera}
          show={viewSettings.showVanishingPoint}
          onUpdateVpX={onUpdateVpX}
          svgRef={svgRef}
        />
      </svg>
    </div>
  );
};
