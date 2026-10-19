import React from 'react';
import { PerspectiveCamera } from '../../models/types';

interface HorizonLineProps {
  camera: PerspectiveCamera;
  show: boolean;
}

export const HorizonLine: React.FC<HorizonLineProps> = ({ camera, show }) => {
  if (!show) return null;

  const { vpY, canvasWidth } = camera;

  return (
    <g className="horizon-line select-none">
      {/* 視平線主軸 */}
      <line
        x1="0"
        y1={vpY}
        x2={canvasWidth}
        y2={vpY}
        stroke="#ef4444"
        strokeWidth="2.5"
        strokeDasharray="6 4"
        strokeOpacity="0.8"
      />

      {/* 左側標籤 */}
      <g transform={`translate(16, ${vpY - 8})`}>
        <rect
          x="-4"
          y="-14"
          width="118"
          height="20"
          rx="4"
          fill="#ef4444"
          fillOpacity="0.9"
        />
        <text
          x="4"
          y="0"
          fill="#ffffff"
          fontSize="11"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          視平線 (眼睛高度)
        </text>
      </g>

      {/* 右側標籤 */}
      <g transform={`translate(${canvasWidth - 110}, ${vpY - 8})`}>
        <rect
          x="-4"
          y="-14"
          width="106"
          height="20"
          rx="4"
          fill="#ef4444"
          fillOpacity="0.9"
        />
        <text
          x="4"
          y="0"
          fill="#ffffff"
          fontSize="11"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          水平視線基準
        </text>
      </g>
    </g>
  );
};
