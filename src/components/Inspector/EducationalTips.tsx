import React, { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { SceneObject, PerspectiveCamera } from '../../models/types';

interface EducationalTipsProps {
  selectedObject: SceneObject | null;
  camera: PerspectiveCamera;
  objectCount: number;
}

export const EducationalTips: React.FC<EducationalTipsProps> = ({
  selectedObject,
  camera,
  objectCount
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 依據操作狀態產生最合適的一句重點提示
  const getContextualTip = () => {
    if (selectedObject) {
      if (selectedObject.z > 350) {
        return {
          title: '遠處觀察：近大遠小',
          text: `「${selectedObject.name}」在遠方 (Z=${Math.round(selectedObject.z)})。因為透視原理，尺寸沒變但視覺明顯縮小囉！`
        };
      }
      if (selectedObject.z < 60) {
        return {
          title: '近處觀察：視覺最大',
          text: `「${selectedObject.name}」目前距離你很近，視覺尺寸最大。試著拉大右側「深度 Z」，觀察它如何向遠方縮小！`
        };
      }
      if (selectedObject.y < camera.vpY) {
        return {
          title: '仰視觀察 (在視平線之上)',
          text: `「${selectedObject.name}」在視平線上方，抬頭看能看到它的底面，看不到頂部喔！`
        };
      }
      if (selectedObject.y > camera.vpY + 80) {
        return {
          title: '俯視觀察 (在視平線之下)',
          text: `「${selectedObject.name}」在視平線下方，低頭俯視能清楚看見它的頂面！`
        };
      }
      return {
        title: '深度邊線朝向透視點',
        text: '仔細看！兩側向後延伸的邊線，無論物體放哪，延長後都對準視平線上的「透視點 (VP)」。'
      };
    }

    if (Math.abs(camera.vpX - 500) > 80) {
      return {
        title: '透視點移動效果',
        text: '透視點代表正前方焦點！焦點往哪移，所有深度線條就往哪裡收斂。'
      };
    }

    if (objectCount <= 1) {
      return {
        title: '快試試看！',
        text: '從左邊素材庫新增方塊或課桌，拖曳透視點觀察神奇的視角變化！'
      };
    }

    return {
      title: '透視核心秘密',
      text: '正面邊線保持水平或垂直；向遠處延伸的邊線全部匯集到透視點。'
    };
  };

  const tip = getContextualTip();

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl p-2.5 shadow-xs transition-all">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? '點擊收合提示' : '點擊展開完整提示'}
      >
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-amber-400 text-amber-900 flex items-center justify-center shrink-0 shadow-xs">
            <Lightbulb className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-amber-900 truncate">
            💡 {tip.title}
          </span>
        </div>
        <button
          type="button"
          className="text-amber-700 hover:text-amber-900 p-1 flex items-center gap-0.5 text-[11px] font-semibold shrink-0"
        >
          <span>{isExpanded ? '收合' : '小秘笈'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-amber-200/60 text-xs text-amber-900 leading-relaxed animate-fadeIn">
          {tip.text}
        </div>
      )}
    </div>
  );
};
