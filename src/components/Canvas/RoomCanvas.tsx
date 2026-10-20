import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import {
  PerspectiveCamera,
  RoomFrame,
  RoomColors,
  SceneObject,
  ViewSettings,
  Point2D,
  RenderStyle
} from '../../models/types';
import {
  calculateRoomSurfaces,
  projectWallObjectCorners,
  projectRoomFloorObject
} from '../../core/roomGeometry';
import { VanishingPoint } from './VanishingPoint';
import { HorizonLine } from './HorizonLine';

interface RoomCanvasProps {
  camera: PerspectiveCamera;
  roomFrame: RoomFrame;
  roomColors: RoomColors;
  objects: SceneObject[];
  selectedObjectId: string | null;
  viewSettings: ViewSettings;
  onSelectObject: (id: string | null) => void;
  onUpdateObject: (updated: SceneObject) => void;
  onUpdateVpX: (newVpX: number) => void;
  svgRef: React.RefObject<SVGSVGElement>;
}

export const RoomCanvas: React.FC<RoomCanvasProps> = ({
  camera,
  roomFrame,
  roomColors,
  objects,
  selectedObjectId,
  viewSettings,
  onSelectObject,
  onUpdateObject,
  onUpdateVpX,
  svgRef
}) => {
  const { canvasWidth, canvasHeight } = camera;
  const renderStyle: RenderStyle = viewSettings.renderStyle || 'colored';

  // 1. 計算房間 8 角點與 5 大面
  const roomSurfaces = useMemo(() => {
    return calculateRoomSurfaces(roomFrame, camera);
  }, [roomFrame, camera]);

  const { corners, leftWall, rightWall, backWall, ceiling, floor, floorLines, ceilingLines, depthRays } = roomSurfaces;

  // 輔助將頂點陣列轉為 SVG points 字串
  const toPointsString = (pts: Point2D[]) => pts.map(p => `${p.x},${p.y}`).join(' ');

  // 判定面填充顏色 (依據渲染風格)
  const getSurfaceFill = (baseColor: string, wireframeFill = '#ffffff') => {
    if (renderStyle === 'wireframe') return wireframeFill;
    return baseColor;
  };

  const strokeColor = renderStyle === 'wireframe' ? '#334155' : 'rgba(71, 85, 105, 0.5)';
  const strokeWidth = renderStyle === 'wireframe' ? '1.8' : '1.2';

  // 分離牆面物件與地板物件
  const wallObjects = useMemo(() => {
    return objects.filter(o => o.wallAnchor);
  }, [objects]);

  const floorObjects = useMemo(() => {
    return objects.filter(o => !o.wallAnchor);
  }, [objects]);

  // 地板物件投影並依深度排序 (Z 較大在後，先畫)
  const projectedFloorObjects = useMemo(() => {
    return floorObjects
      .map(obj => {
        const proj = projectRoomFloorObject(obj, corners, camera, roomFrame, obj.id === selectedObjectId);
        return { original: obj, proj, depth: proj.centerDepth };
      })
      .sort((a, b) => b.depth - a.depth);
  }, [floorObjects, corners, camera, roomFrame, selectedObjectId]);

  // 拖曳狀態管理 (牆面物件沿牆面滑動，地板物件沿地板滑動)
  const [draggingObjId, setDraggingObjId] = useState<string | null>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; initU?: number; initV?: number; initXFrac?: number; initZFrac?: number }>({
    clientX: 0,
    clientY: 0
  });

  const handleObjectPointerDown = (e: React.PointerEvent, obj: SceneObject) => {
    e.stopPropagation();
    onSelectObject(obj.id);
    if (obj.isLocked) return;

    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDraggingObjId(obj.id);

    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initU: obj.wallAnchor?.u ?? 0.3,
      initV: obj.wallAnchor?.v ?? 0.3,
      initXFrac: obj.roomFloorX ?? 0.5,
      initZFrac: obj.roomFloorZ ?? 0.5
    };
  };

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!draggingObjId || !svgRef.current) return;
      const targetObj = objects.find(o => o.id === draggingObjId);
      if (!targetObj || targetObj.isLocked) return;

      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = canvasWidth / rect.width;
      const deltaX = (e.clientX - dragStartRef.current.clientX) * scaleX;
      const deltaY = (e.clientY - dragStartRef.current.clientY) * scaleX;

      if (targetObj.wallAnchor) {
        // 牆面物件：調整 u, v 比例
        const deltaU = deltaX / (targetObj.wallAnchor.wall === 'back' ? (corners.btr.x - corners.btl.x) : 350);
        const deltaV = -deltaY / 300; // Y 朝下為負

        const maxU = 1.0 - targetObj.wallAnchor.widthU;
        const maxV = 1.0 - targetObj.wallAnchor.heightV;

        const newU = Math.max(0, Math.min(maxU, (dragStartRef.current.initU ?? 0.3) + deltaU));
        const newV = Math.max(0, Math.min(maxV, (dragStartRef.current.initV ?? 0.3) + deltaV));

        onUpdateObject({
          ...targetObj,
          wallAnchor: {
            ...targetObj.wallAnchor,
            u: Number(newU.toFixed(3)),
            v: Number(newV.toFixed(3))
          }
        });
      } else {
        // 地板立體家具物件：調整 roomFloorX, roomFloorZ 比例
        const deltaXFrac = deltaX / (roomFrame.right - roomFrame.left);
        const deltaZFrac = deltaY / 280; // 往下拖曳代表靠近前緣 (Z 變小)，往上拖曳代表推向後牆 (Z 變大)

        const newXFrac = Math.max(0.08, Math.min(0.92, (dragStartRef.current.initXFrac ?? 0.5) + deltaXFrac));
        const newZFrac = Math.max(0.05, Math.min(0.95, (dragStartRef.current.initZFrac ?? 0.5) - deltaZFrac));

        onUpdateObject({
          ...targetObj,
          roomFloorX: Number(newXFrac.toFixed(3)),
          roomFloorZ: Number(newZFrac.toFixed(3)),
          z: Number((newZFrac * 1000).toFixed(0))
        });
      }
    },
    [draggingObjId, objects, svgRef, canvasWidth, corners, roomFrame, onUpdateObject]
  );

  const handlePointerUp = useCallback(() => {
    if (draggingObjId) {
      setDraggingObjId(null);
    }
  }, [draggingObjId]);

  useEffect(() => {
    if (draggingObjId) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [draggingObjId, handlePointerMove, handlePointerUp]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-100 overflow-hidden select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        className="w-full h-full max-h-[82vh] shadow-xl rounded-xl border border-slate-300 bg-white"
        onClick={() => onSelectObject(null)}
        style={{ touchAction: 'none' }}
      >
        <defs>
          {/* 天花板微漸層 */}
          <linearGradient id="roomCeilingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={roomColors.ceiling} stopOpacity="1" />
            <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.85" />
          </linearGradient>

          {/* 地板微漸層 */}
          <linearGradient id="roomFloorGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={roomColors.floor} stopOpacity="1" />
            <stop offset="100%" stopColor="#9a3412" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* 畫布最外層背景 */}
        <rect x="0" y="0" width={canvasWidth} height={canvasHeight} fill="#f8fafc" />

        {/* 1. 繪製房間 5 大牆面 (接縫嚴密吻合) */}
        {/* 天花板 */}
        <polygon
          points={toPointsString(ceiling)}
          fill={getSurfaceFill(renderStyle === 'colored' ? 'url(#roomCeilingGrad)' : roomColors.ceiling)}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          className="transition-colors duration-200"
        />

        {/* 左牆 */}
        <polygon
          points={toPointsString(leftWall)}
          fill={getSurfaceFill(roomColors.leftWall)}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          className="transition-colors duration-200"
        />

        {/* 右牆 */}
        <polygon
          points={toPointsString(rightWall)}
          fill={getSurfaceFill(roomColors.rightWall)}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          className="transition-colors duration-200"
        />

        {/* 後牆 */}
        <polygon
          points={toPointsString(backWall)}
          fill={getSurfaceFill(roomColors.backWall)}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          className="transition-colors duration-200"
        />

        {/* 地板 */}
        <polygon
          points={toPointsString(floor)}
          fill={getSurfaceFill(renderStyle === 'colored' ? 'url(#roomFloorGrad)' : roomColors.floor)}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          className="transition-colors duration-200"
        />

        {/* 2. 房間透視輔助線 (地板線、天花板線、深度角射線) */}
        {/* 地板縱向線與橫向等深線 */}
        {viewSettings.showFloorLines && (
          <g className="room-floor-lines pointer-events-none">
            {floorLines.map((line, idx) => (
              <line
                key={`floor-line-${idx}`}
                x1={line.start.x}
                y1={line.start.y}
                x2={line.end.x}
                y2={line.end.y}
                stroke={renderStyle === 'wireframe' ? '#64748b' : '#ea580c'}
                strokeWidth="1.2"
                strokeDasharray="4 3"
                strokeOpacity="0.65"
              />
            ))}
          </g>
        )}

        {/* 天花板縱向線 */}
        {viewSettings.showCeilingLines && (
          <g className="room-ceiling-lines pointer-events-none">
            {ceilingLines.map((line, idx) => (
              <line
                key={`ceiling-line-${idx}`}
                x1={line.start.x}
                y1={line.start.y}
                x2={line.end.x}
                y2={line.end.y}
                stroke="#94a3b8"
                strokeWidth="1.2"
                strokeDasharray="4 3"
                strokeOpacity="0.6"
              />
            ))}
          </g>
        )}

        {/* 房間 4 角落向透視點延伸的透視線 */}
        {(viewSettings.showPerspectiveLines || renderStyle === 'guidelines') && (
          <g className="room-depth-rays pointer-events-none">
            {depthRays.map((ray, idx) => (
              <line
                key={`depth-ray-${idx}`}
                x1={ray.start.x}
                y1={ray.start.y}
                x2={ray.end.x}
                y2={ray.end.y}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="5 3"
                strokeOpacity="0.75"
              />
            ))}
          </g>
        )}

        {/* 3. 牆面錨定物件渲染 (掛畫、門、窗戶、時鐘) */}
        {wallObjects.map(obj => {
          if (!obj.wallAnchor) return null;
          const isSelected = obj.id === selectedObjectId;
          const cornerPts = projectWallObjectCorners(obj.wallAnchor, corners);
          // [pBL, pBR, pTR, pTL]
          const [pBL, pBR, pTR, pTL] = cornerPts;

          return (
            <g
              key={obj.id}
              className={`wall-object ${obj.isLocked ? 'cursor-not-allowed' : 'cursor-move'}`}
              onPointerDown={e => handleObjectPointerDown(e, obj)}
            >
              {/* 外框主體多邊形 */}
              <polygon
                points={toPointsString([pBL, pBR, pTR, pTL])}
                fill={obj.color}
                stroke={obj.strokeColor || '#1e293b'}
                strokeWidth="2"
                strokeLinejoin="round"
              />

              {/* 依物件種類渲染生動細節 */}
              {obj.geometryType === 'room-window' && (
                // 窗格十字線
                <g className="pointer-events-none">
                  {/* 水平窗欞 */}
                  <line
                    x1={(pBL.x + pTL.x) / 2}
                    y1={(pBL.y + pTL.y) / 2}
                    x2={(pBR.x + pTR.x) / 2}
                    y2={(pBR.y + pTR.y) / 2}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />
                  {/* 垂直窗欞 */}
                  <line
                    x1={(pBL.x + pBR.x) / 2}
                    y1={(pBL.y + pBR.y) / 2}
                    x2={(pTL.x + pTR.x) / 2}
                    y2={(pTL.y + pTR.y) / 2}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />
                </g>
              )}

              {obj.geometryType === 'room-door' && (
                // 門把手
                <circle
                  cx={obj.wallAnchor.wall === 'left' ? pBR.x - 8 : pBL.x + 8}
                  cy={(pBL.y + pTL.y) / 2}
                  r="4"
                  fill="#fef08a"
                  stroke="#78350f"
                  strokeWidth="1.5"
                />
              )}

              {(obj.geometryType === 'landscape-painting' || obj.geometryType === 'portrait-painting') && (
                // 內縮畫布內芯與藝術小裝飾
                <polygon
                  points={toPointsString([
                    { x: pBL.x * 0.85 + pTR.x * 0.15, y: pBL.y * 0.85 + pTR.y * 0.15 },
                    { x: pBR.x * 0.85 + pTL.x * 0.15, y: pBR.y * 0.85 + pTL.y * 0.15 },
                    { x: pTR.x * 0.85 + pBL.x * 0.15, y: pTR.y * 0.85 + pBL.y * 0.15 },
                    { x: pTL.x * 0.85 + pBR.x * 0.15, y: pTL.y * 0.85 + pBR.y * 0.15 }
                  ])}
                  fill={obj.secondaryColor || '#f8fafc'}
                  stroke="#0284c7"
                  strokeWidth="1"
                />
              )}

              {obj.geometryType === 'wall-clock' && (
                // 時鐘刻度
                <g className="pointer-events-none">
                  <circle
                    cx={(pBL.x + pTR.x) / 2}
                    cy={(pBL.y + pTR.y) / 2}
                    r={Math.min(Math.abs(pBR.x - pBL.x), Math.abs(pTL.y - pBL.y)) * 0.35}
                    fill="#ffffff"
                    stroke="#334155"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={(pBL.x + pTR.x) / 2}
                    y1={(pBL.y + pTR.y) / 2}
                    x2={(pBL.x + pTR.x) / 2}
                    y2={(pBL.y + pTR.y) / 2 - 8}
                    stroke="#0f172a"
                    strokeWidth="1.8"
                  />
                </g>
              )}

              {/* 選取外框高亮 */}
              {isSelected && (
                <g className="pointer-events-none">
                  <polygon
                    points={toPointsString([pBL, pBR, pTR, pTL])}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeDasharray="5 3"
                  />
                  <circle cx={pBL.x} cy={pBL.y} r="4" fill="#3b82f6" />
                  <circle cx={pBR.x} cy={pBR.y} r="4" fill="#3b82f6" />
                  <circle cx={pTR.x} cy={pTR.y} r="4" fill="#3b82f6" />
                  <circle cx={pTL.x} cy={pTL.y} r="4" fill="#3b82f6" />
                </g>
              )}
            </g>
          );
        })}

        {/* 4. 地板立體家具物件渲染 (由遠至近) */}
        {projectedFloorObjects.map(({ original, proj }) => {
          const isSelected = original.id === selectedObjectId;

          return (
            <g
              key={original.id}
              className={`room-floor-object ${original.isLocked ? 'cursor-not-allowed' : 'cursor-move'}`}
              onPointerDown={e => handleObjectPointerDown(e, original)}
            >
              {/* 地面陰影 */}
              <ellipse
                cx={(proj.boundingBox.minX + proj.boundingBox.maxX) / 2}
                cy={proj.boundingBox.maxY}
                rx={proj.boundingBox.width * 0.45}
                ry={Math.max(3, proj.boundingBox.width * 0.08)}
                fill="#0f172a"
                fillOpacity="0.22"
              />

              {/* 各面渲染 */}
              {proj.faces
                .filter(f => f.isVisible)
                .map(face => (
                  <polygon
                    key={face.id}
                    points={face.points.map(p => `${p.x},${p.y}`).join(' ')}
                    fill={getSurfaceFill(face.color, '#ffffff')}
                    stroke={face.strokeColor}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                ))}

              {/* 選取狀態指示外框 */}
              {isSelected && (
                <g className="pointer-events-none">
                  <rect
                    x={proj.boundingBox.minX - 4}
                    y={proj.boundingBox.minY - 4}
                    width={proj.boundingBox.width + 8}
                    height={proj.boundingBox.height + 8}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray="5 3"
                    rx="4"
                  />
                  <circle cx={proj.boundingBox.minX - 4} cy={proj.boundingBox.minY - 4} r="4" fill="#3b82f6" />
                  <circle cx={proj.boundingBox.maxX + 4} cy={proj.boundingBox.minY - 4} r="4" fill="#3b82f6" />
                  <circle cx={proj.boundingBox.minX - 4} cy={proj.boundingBox.maxY + 4} r="4" fill="#3b82f6" />
                  <circle cx={proj.boundingBox.maxX + 4} cy={proj.boundingBox.maxY + 4} r="4" fill="#3b82f6" />
                </g>
              )}
            </g>
          );
        })}

        {/* 5. 視平線 */}
        <HorizonLine camera={camera} show={viewSettings.showHorizonLine} />

        {/* 6. 透視點 (VP) 互動手柄 */}
        <VanishingPoint
          camera={camera}
          show={viewSettings.showVanishingPoint}
          onUpdateVpX={onUpdateVpX}
          svgRef={svgRef}
        />

        {/* 7. 房間固定外框飾框 (深色外框線，突顯畫框邊界) */}
        <rect
          x={roomFrame.left}
          y={roomFrame.top}
          width={roomFrame.right - roomFrame.left}
          height={roomFrame.bottom - roomFrame.top}
          fill="none"
          stroke="#1e293b"
          strokeWidth="3.5"
          className="pointer-events-none"
        />
      </svg>
    </div>
  );
};
