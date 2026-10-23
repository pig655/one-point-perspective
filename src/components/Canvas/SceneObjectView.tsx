import React, { useRef, useCallback, useState, useEffect } from 'react';
import { ProjectedObject, SceneObject } from '../../models/types';

interface SceneObjectViewProps {
  projected: ProjectedObject;
  original: SceneObject;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdatePosition: (id: string, newX: number, newY: number) => void;
  svgRef: React.RefObject<SVGSVGElement>;
  canvasWidth: number;
}

export const SceneObjectView: React.FC<SceneObjectViewProps> = ({
  projected,
  original,
  isSelected,
  onSelect,
  onUpdatePosition,
  svgRef,
  canvasWidth
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPosRef = useRef({ screenX: 0, screenY: 0 });
  const initialObjPosRef = useRef({ x: original.x, y: original.y });

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    onSelect(original.id);

    if (original.isLocked) return;

    (e.target as Element).setPointerCapture?.(e.pointerId);
    setIsDragging(true);
    dragStartPosRef.current = { screenX: e.clientX, screenY: e.clientY };
    initialObjPosRef.current = { x: original.x, y: original.y };
  };

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDragging || !svgRef.current || original.isLocked) return;

      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = canvasWidth / rect.width;
      const deltaSvgX = (e.clientX - dragStartPosRef.current.screenX) * scaleX;
      const deltaSvgY = (e.clientY - dragStartPosRef.current.screenY) * scaleX;

      const newX = Math.round(initialObjPosRef.current.x + deltaSvgX);
      const newY = Math.round(initialObjPosRef.current.y + deltaSvgY);

      onUpdatePosition(original.id, newX, newY);
    },
    [isDragging, svgRef, canvasWidth, original.id, original.isLocked, onUpdatePosition]
  );

  const handlePointerUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  const { faces, edges, boundingBox } = projected;

  // 可見面排序：深度較大的面先畫，最前面的面後畫 (Painter's Algorithm)
  const visibleFaces = faces
    .filter(f => f.isVisible)
    .sort((a, b) => b.centerDepth - a.centerDepth);

  return (
    <g
      id={`scene-obj-${original.id}`}
      className={`scene-object select-none transition-opacity ${
        original.isLocked ? 'cursor-not-allowed opacity-90' : 'cursor-move'
      }`}
      onPointerDown={handlePointerDown}
      onClick={e => {
        e.stopPropagation();
        onSelect(original.id);
      }}
    >
      {/* 陰影效果 (底面投影至地面參考微陰影) */}
      <ellipse
        cx={(boundingBox.minX + boundingBox.maxX) / 2}
        cy={boundingBox.maxY + 2}
        rx={boundingBox.width * 0.45}
        ry={Math.max(3, boundingBox.width * 0.08)}
        fill="#0f172a"
        fillOpacity="0.18"
      />

      {/* 幾何多邊形面渲染 */}
      {visibleFaces.map(face => {
        const pointsString = face.points.map(p => `${p.x},${p.y}`).join(' ');
        return (
          <polygon
            key={face.id}
            points={pointsString}
            fill={face.color}
            stroke={face.strokeColor}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        );
      })}

      {/* 建築與家具結構表面細節 */}
      {(() => {
        const frontFace = faces.find(f => f.name.includes('前') || f.id.includes('front'));
        if (!frontFace || frontFace.points.length < 4 || !frontFace.isVisible) return null;

        const pTL = frontFace.points[0];
        const pTR = frontFace.points[1];
        const pBR = frontFace.points[2];
        const pBL = frontFace.points[3];
        const midX = (pTL.x + pTR.x + pBR.x + pBL.x) / 4;
        const midY = (pTL.y + pTR.y + pBR.y + pBL.y) / 4;
        const fw = Math.abs(pTR.x - pTL.x);
        const fh = Math.abs(pBL.y - pTL.y);

        if (fw < 15 || fh < 15) return null;

        // 1. 課桌細節：抽屜與圓把手
        if (original.geometryType === 'desk') {
          return (
            <g className="pointer-events-none">
              <rect
                x={pTL.x + fw * 0.15}
                y={pTL.y + fh * 0.25}
                width={fw * 0.7}
                height={fh * 0.35}
                fill="none"
                stroke="rgba(0,0,0,0.2)"
                strokeWidth="1.2"
                rx="2"
              />
              <circle cx={midX} cy={pTL.y + fh * 0.42} r={Math.max(2, fw * 0.03)} fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />
            </g>
          );
        }

        // 6. 小木屋細節：可愛拱門與窗戶
        if (original.geometryType === 'house') {
          return (
            <g className="pointer-events-none">
              {/* 木門 */}
              <rect
                x={midX - fw * 0.14}
                y={pBL.y - fh * 0.52}
                width={fw * 0.28}
                height={fh * 0.52}
                fill="#b45309"
                stroke="#78350f"
                strokeWidth="1.2"
                rx="3"
              />
              <circle cx={midX + fw * 0.07} cy={pBL.y - fh * 0.26} r="2" fill="#fbbf24" />
              {/* 小圓窗 */}
              <circle cx={midX} cy={pTL.y + fh * 0.22} r={Math.max(4, fw * 0.09)} fill="#93c5fd" stroke="#ffffff" strokeWidth="1.5" />
            </g>
          );
        }

        // 7. 樹木細節：紅蘋果
        if (original.geometryType === 'tree') {
          const appleR = Math.max(3, fw * 0.06);
          return (
            <g className="pointer-events-none" fill="#ef4444" stroke="#991b1b" strokeWidth="0.8">
              <circle cx={midX - fw * 0.18} cy={midY - fh * 0.1} r={appleR} />
              <circle cx={midX + fw * 0.15} cy={midY - fh * 0.15} r={appleR} />
              <circle cx={midX + fw * 0.05} cy={midY + fh * 0.1} r={appleR} />
            </g>
          );
        }

        return null;
      })()}

      {/* 結構邊線強調 */}
      {edges.map((edge, idx) => (
        <line
          key={`edge-${idx}`}
          x1={edge.start.x}
          y1={edge.start.y}
          x2={edge.end.x}
          y2={edge.end.y}
          stroke={edge.isDepthEdge ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.18)'}
          strokeWidth={edge.isDepthEdge ? '1.2' : '1'}
          strokeLinecap="round"
        />
      ))}

      {/* 選取狀態下的外框高亮與控制把手 */}
      {isSelected && (
        <g className="selection-highlight pointer-events-none">
          <rect
            x={boundingBox.minX - 6}
            y={boundingBox.minY - 6}
            width={boundingBox.width + 12}
            height={boundingBox.height + 12}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1.8"
            strokeDasharray="5 3"
            rx="4"
          />
          {/* 四角指示標記 */}
          <circle cx={boundingBox.minX - 6} cy={boundingBox.minY - 6} r="4" fill="#3b82f6" />
          <circle cx={boundingBox.maxX + 6} cy={boundingBox.minY - 6} r="4" fill="#3b82f6" />
          <circle cx={boundingBox.minX - 6} cy={boundingBox.maxY + 6} r="4" fill="#3b82f6" />
          <circle cx={boundingBox.maxX + 6} cy={boundingBox.maxY + 6} r="4" fill="#3b82f6" />

          {/* 懸浮資訊標籤 (名稱 + 深度 Z) */}
          <g transform={`translate(${boundingBox.minX}, ${boundingBox.minY - 14})`}>
            <rect
              x="-2"
              y="-14"
              width={Math.max(90, original.name.length * 14 + 40)}
              height="20"
              rx="4"
              fill="#1e293b"
              fillOpacity="0.9"
            />
            <text
              x="6"
              y="0"
              fill="#ffffff"
              fontSize="11"
              fontWeight="bold"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {original.name} (Z: {Math.round(original.z)})
            </text>
          </g>
        </g>
      )}

      {/* 鎖定小標籤 */}
      {original.isLocked && (
        <g transform={`translate(${boundingBox.maxX - 10}, ${boundingBox.minY - 8})`}>
          <circle r="7" fill="#ef4444" />
          <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9">🔒</text>
        </g>
      )}
    </g>
  );
};
