import React from 'react';
import { Lightbulb } from 'lucide-react';
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
  // 依據操作狀態產生最合適的一句重點提示
  const getContextualTip = () => {
    if (selectedObject) {
      if (selectedObject.z > 350) {
        return {
          title: '觀察遠處物件',
          text: `「${selectedObject.name}」目前在較深的遠方 (Z=${Math.round(selectedObject.z)})。因為透視投影原理，即使它的實際尺寸沒變，畫面看起來也明顯變小了！`
        };
      }
      if (selectedObject.z < 60) {
        return {
          title: '觀察近處物件',
          text: `「${selectedObject.name}」目前距離你很近，所以視覺尺寸最大。試著拉大右側的「深度 Z」，觀察它如何往透視點縮小！`
        };
      }
      if (selectedObject.y < camera.vpY) {
        return {
          title: '仰視觀察 (在視平線之上)',
          text: `「${selectedObject.name}」位於視平線上方，此時我們是「抬頭看」，所以能看見它的底部，而看不見頂部喔！`
        };
      }
      if (selectedObject.y > camera.vpY + 80) {
        return {
          title: '俯視觀察 (在視平線之下)',
          text: `「${selectedObject.name}」位於視平線下方，此時我們是「低頭俯視」，所以能清楚看見它的頂面！`
        };
      }
      return {
        title: '深度邊線朝向透視點',
        text: '仔細看！方塊左右兩側向後延伸的邊線，無論方塊放在哪裡，延長後都筆直對準畫面中央的「透視點 (VP)」。'
      };
    }

    if (Math.abs(camera.vpX - 500) > 80) {
      return {
        title: '透視點移動的效果',
        text: '你改變了透視點的水平位置！透視點就代表你的「正前方焦點」，焦點往哪邊移，所有深度線條就往哪裡收斂。'
      };
    }

    if (objectCount <= 1) {
      return {
        title: '探索單點透視',
        text: '從左邊素材庫新增一張課桌或方塊，然後拖曳透視點，看看畫面會發生什麼神奇的變化！'
      };
    }

    return {
      title: '單點透視的核心秘密',
      text: '與畫面平行的正面線條保持水平或垂直；所有向縱深遠處延伸的平行線，全部匯集於視平線上的「透視點」。'
    };
  };

  const tip = getContextualTip();

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl p-3 shadow-xs">
      <div className="flex items-start space-x-2.5">
        <div className="p-1.5 bg-amber-200/70 rounded-lg text-amber-700 shrink-0 mt-0.5">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-amber-900 mb-0.5">{tip.title}</h4>
          <p className="text-xs text-amber-800 leading-relaxed">{tip.text}</p>
        </div>
      </div>
    </div>
  );
};
