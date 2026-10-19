import React from 'react';
import { ProjectedObject } from '../../models/types';

interface PerspectiveLinesProps {
  projectedObjects: ProjectedObject[];
  showGlobalLines: boolean;
  selectedObjectId: string | null;
}

export const PerspectiveLines: React.FC<PerspectiveLinesProps> = ({
  projectedObjects,
  showGlobalLines,
  selectedObjectId
}) => {
  // 決定哪些物件需要繪製透視線：
  // 1. 全域開啟時，繪製所有有 showGuidelines 或選取物件的射線
  // 2. 當選取某一物件時，即使全域未開啟，也顯示該被選取物件的輔助線（讓學生清楚聚焦）
  const objectsToDraw = projectedObjects.filter(obj => {
    if (obj.id === selectedObjectId) return true;
    if (showGlobalLines) return true;
    return false;
  });

  if (objectsToDraw.length === 0) return null;

  return (
    <g className="perspective-lines pointer-events-none select-none">
      {objectsToDraw.map(obj => {
        const isSelected = obj.id === selectedObjectId;
        const strokeColor = isSelected ? '#eab308' : '#38bdf8';
        const strokeWidth = isSelected ? 1.8 : 1.2;
        const strokeOpacity = isSelected ? 0.85 : 0.45;
        const strokeDasharray = isSelected ? '5 3' : '3 3';

        return (
          <g key={`guidelines-${obj.id}`}>
            {obj.guidelineRays.map((ray, rayIdx) => (
              <React.Fragment key={`ray-${obj.id}-${rayIdx}`}>
                {/* 透視輔助射線 */}
                <line
                  x1={ray.start.x}
                  y1={ray.start.y}
                  x2={ray.end.x}
                  y2={ray.end.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeOpacity={strokeOpacity}
                  strokeDasharray={strokeDasharray}
                />
                {/* 頂點起點圓環標記 */}
                {isSelected && (
                  <circle
                    cx={ray.start.x}
                    cy={ray.start.y}
                    r="3.5"
                    fill="#ffffff"
                    stroke={strokeColor}
                    strokeWidth="1.5"
                  />
                )}
              </React.Fragment>
            ))}
          </g>
        );
      })}
    </g>
  );
};
