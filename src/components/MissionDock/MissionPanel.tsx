import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { SceneState } from '../../models/types';
import { ROOM_MISSIONS, BASIC_MISSIONS } from '../../models/missions';

interface MissionPanelProps {
  currentMissionId: string;
  sceneState: SceneState;
  onSelectMission: (missionId: string) => void;
  onExitMissionMode: () => void;
}

export const MissionPanel: React.FC<MissionPanelProps> = ({
  currentMissionId,
  sceneState,
  onSelectMission,
  onExitMissionMode
}) => {
  // 依據目前主模式 (room 或 basic) 選取對應的任務清單
  const missionList = sceneState.mainMode === 'room' ? ROOM_MISSIONS : BASIC_MISSIONS;

  // 取得目前選取的任務 (若不在目前清單中，預設選取第一個)
  const currentMission =
    missionList.find(m => m.id === currentMissionId) || missionList[0];

  const [hasCelebrated, setHasCelebrated] = useState(false);

  // 動態驗證任務步驟
  const stepResults = currentMission.steps.map(step => {
    return {
      ...step,
      isCompleted: step.validator(sceneState)
    };
  });

  const isMissionAllCompleted = stepResults.every(s => s.isCompleted);

  // 當任務剛達成時觸發彩帶特效
  useEffect(() => {
    if (isMissionAllCompleted && !hasCelebrated) {
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.85 }
      });
      setHasCelebrated(true);
    } else if (!isMissionAllCompleted) {
      setHasCelebrated(false);
    }
  }, [isMissionAllCompleted, hasCelebrated]);

  const currentIndex = missionList.findIndex(m => m.id === currentMission.id);
  const prevMission = currentIndex > 0 ? missionList[currentIndex - 1] : null;
  const nextMission = currentIndex < missionList.length - 1 ? missionList[currentIndex + 1] : null;

  return (
    <div className="bg-white border-t border-slate-200 px-6 py-3 shadow-lg select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* 左側：任務序號與切換導覽 */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="font-extrabold text-amber-900 text-sm">
              第 {currentMission.number} 關 / 共 {missionList.length} 關
            </span>
          </div>

          {/* 任務切換箭頭 */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => prevMission && onSelectMission(prevMission.id)}
              disabled={!prevMission}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="上一關"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => nextMission && onSelectMission(nextMission.id)}
              disabled={!nextMission}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="下一關"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 中央：任務目標與進度狀態 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-slate-800 text-sm truncate">
              {currentMission.title}
            </h3>
            {isMissionAllCompleted && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 animate-bounce">
                <Sparkles className="w-3.5 h-3.5" />
                <span>挑戰成功！</span>
              </span>
            )}
          </div>

          {/* 步驟即時狀態 */}
          <div className="mt-1 space-y-1">
            {stepResults.map(step => (
              <div key={step.id} className="flex items-start space-x-2 text-xs">
                {step.isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                )}
                <div className="leading-tight">
                  <span className={step.isCompleted ? 'text-emerald-700 font-semibold line-through' : 'text-slate-700 font-medium'}>
                    {step.targetDescription}
                  </span>
                  {!step.isCompleted && (
                    <span className="block text-slate-400 text-[11px] mt-0.5">
                      💡 提示：{step.hint}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右側：回饋與操作按鈕 */}
        <div className="flex items-center space-x-2 shrink-0">
          {isMissionAllCompleted ? (
            nextMission ? (
              <button
                onClick={() => onSelectMission(nextMission.id)}
                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-105"
              >
                <span>進入下一關</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="text-xs font-bold text-emerald-600 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200">
                🎉 全數通關！大師誕生
              </div>
            )
          ) : null}

          <button
            onClick={onExitMissionMode}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            返回自由探索
          </button>
        </div>
      </div>
    </div>
  );
};
