import React, { useRef, useState, useCallback, useEffect } from 'react';
import { PerspectiveCamera } from '../../models/types';
import { clampVanishingPoint } from '../../core/perspective';

interface VanishingPointProps {
  camera: PerspectiveCamera;
  show: boolean;
  onUpdateVpX: (newVpX: number) => void;
  svgRef: React.RefObject<SVGSVGElement>;
}

export const VanishingPoint: React.FC<VanishingPointProps> = ({
  camera,
  show,
  onUpdateVpX,
  svgRef
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const initialVpXRef = useRef(camera.vpX);

  const { vpX, vpY, canvasWidth } = camera;

  // 滑鼠/觸控按下事件
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);

    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    initialVpXRef.current = camera.vpX;
  };

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDragging || !svgRef.current) return;

      // 依據 SVG 的實際渲染大小計算縮放比
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = canvasWidth / rect.width;
      const deltaScreenX = e.clientX - dragStartXRef.current;
      const deltaSvgX = deltaScreenX * scaleX;

      const rawNewVpX = initialVpXRef.current + deltaSvgX;
      // 透視點只能沿水平線移動，不可拖曳至畫布外 (clamp)
      const clampedVpX = clampVanishingPoint(rawNewVpX, canvasWidth, 50);

      onUpdateVpX(clampedVpX);
    },
    [isDragging, canvasWidth, onUpdateVpX, svgRef]
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

  if (!show) return null;

  return (
    <g
      className="vanishing-point select-none cursor-ew-resize"
      transform={`translate(${vpX}, ${vpY})`}
      onPointerDown={handlePointerDown}
      role="slider"
      aria-label="透視點 (VP)"
      aria-valuenow={Math.round(vpX)}
      aria-valuemin={50}
      aria-valuemax={canvasWidth - 50}
    >
      {/* 拖曳感應加大熱區 (iPad 觸控友善 68px 大圓) */}
      <circle r="34" fill="transparent" />

      {/* 外圈光暈與脈動動效 */}
      <circle
        r={isDragging ? '20' : '15'}
        fill="#f59e0b"
        fillOpacity={isDragging ? '0.35' : '0.2'}
        stroke="#f59e0b"
        strokeWidth="1.5"
        strokeDasharray={isDragging ? 'none' : '3 3'}
        className="transition-all duration-150"
      />

      {/* 核心實心圓點 */}
      <circle
        r={isDragging ? '8' : '6.5'}
        fill="#f59e0b"
        stroke="#ffffff"
        strokeWidth="2.5"
      />

      {/* 左右拖曳指示箭頭 */}
      <path
        d="M -11 0 L -8 -3 L -8 3 Z M 11 0 L 8 -3 L 8 3 Z"
        fill="#d97706"
      />

      {/* 標籤氣泡 */}
      <g transform="translate(0, -22)">
        <rect
          x="-48"
          y="-18"
          width="96"
          height="22"
          rx="5"
          fill="#1e293b"
          fillOpacity="0.92"
          stroke="#f59e0b"
          strokeWidth="1.5"
        />
        <text
          x="0"
          y="-4"
          textAnchor="middle"
          fill="#fef08a"
          fontSize="11"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          透視點 (VP)
        </text>
        {/* 倒三角形尖端 */}
        <polygon points="-4,4 4,4 0,8" fill="#1e293b" />
      </g>
    </g>
  );
};
