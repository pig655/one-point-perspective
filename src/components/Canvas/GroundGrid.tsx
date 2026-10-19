import React from 'react';
import { PerspectiveCamera } from '../../models/types';
import { calculatePerspectiveScale } from '../../core/perspective';

interface GroundGridProps {
  camera: PerspectiveCamera;
  show: boolean;
}

export const GroundGrid: React.FC<GroundGridProps> = ({ camera, show }) => {
  if (!show) return null;

  const { vpX, vpY, focalLength, canvasWidth, canvasHeight } = camera;
  const groundY = canvasHeight; // 地面參考基準在畫布底部

  // 縱向深度射線 (向透視點收斂的縱向地磚線)
  const xStep = 70;
  const numRays = Math.ceil(canvasWidth / xStep) + 4;
  const rays: { x1: number; y1: number; x2: number; y2: number }[] = [];

  for (let i = -numRays; i <= numRays; i++) {
    const bottomX = vpX + i * xStep;
    if (bottomX >= -100 && bottomX <= canvasWidth + 100) {
      rays.push({
        x1: vpX,
        y1: vpY,
        x2: bottomX,
        y2: canvasHeight
      });
    }
  }

  // 橫向平行線 (近密遠疏的地面等深橫線)
  // 在透視中，等間距的地面線隨深度增加，在畫面上呈現漸漸密集收斂於視平線
  const depthLines: { y: number; opacity: number }[] = [];
  const maxZ = 1200;
  const zIntervals = [30, 70, 130, 210, 320, 480, 700, 1000];

  zIntervals.forEach(z => {
    if (z <= maxZ) {
      const scale = calculatePerspectiveScale(z, focalLength);
      // y' = vpY + (groundY - vpY) * scale
      const lineY = vpY + (groundY - vpY) * scale;
      if (lineY > vpY + 2 && lineY <= canvasHeight) {
        depthLines.push({
          y: lineY,
          opacity: Math.max(0.15, scale * 0.45)
        });
      }
    }
  });

  return (
    <g className="ground-grid pointer-events-none select-none">
      {/* 縱向收斂線 */}
      {rays.map((ray, idx) => (
        <line
          key={`ray-${idx}`}
          x1={ray.x1}
          y1={ray.y1}
          x2={ray.x2}
          y2={ray.y2}
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="4 3"
          strokeOpacity="0.4"
        />
      ))}

      {/* 橫向等深線 */}
      {depthLines.map((line, idx) => (
        <line
          key={`depth-line-${idx}`}
          x1="0"
          y1={line.y}
          x2={canvasWidth}
          y2={line.y}
          stroke="#94a3b8"
          strokeWidth="1"
          strokeOpacity={line.opacity}
        />
      ))}
    </g>
  );
};
