import React from 'react';
import { CheckCircle2, Circle, ArrowRight, FileEdit, Unlock } from 'lucide-react';
import { useProgress, STAGE_ORDER } from '../context/ProgressContext';
import { useProject } from '../context/ProjectContext';

/**
 * UnlockProgressPanel - Shows what's needed to unlock the next stage
 * Displayed at the bottom of the Content tab
 */
const UnlockProgressPanel = ({ currentStage, onGoToProject }) => {
  const { getStageInfo, isStageUnlocked } = useProgress();
  const { project } = useProject();
  
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const nextStage = currentIndex < STAGE_ORDER.length - 1 ? STAGE_ORDER[currentIndex + 1] : null;
  const stageInfo = getStageInfo(currentStage);
  
  // Don't show if:
  // - No next stage (Test is last)
  // - Current stage is already complete
  // - Next stage is already unlocked
  if (!nextStage || stageInfo?.isComplete || isStageUnlocked(nextStage)) {
    return null;
  }

  // Don't show if no project selected yet
  if (!project) {
    return null;
  }

  const videosComplete = stageInfo?.videosComplete;
  const assignmentsComplete = stageInfo?.deliverablesComplete;
  const videosWatched = stageInfo?.videosWatched || 0;
  const videoCount = stageInfo?.videoCount || 0;

  const STAGE_ICONS = {
    Empathise: '❤️',
    Define: '🎯',
    Ideate: '💡',
    Prototype: '✏️',
    Test: '🧪'
  };

  return (
    <div className="border-t border-slate-700 bg-gradient-to-r from-amber-900/20 to-orange-900/20">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Unlock className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white">
            Unlock {STAGE_ICONS[nextStage]} {nextStage}
          </span>
        </div>

        {/* Requirements */}
        <div className="space-y-2 mb-4">
          {/* Videos */}
          <div className="flex items-center gap-2">
            {videosComplete ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : (
              <Circle className="w-4 h-4 text-slate-500" />
            )}
            <span className={`text-sm ${videosComplete ? 'text-green-400' : 'text-slate-300'}`}>
              Watch all videos
            </span>
            <span className={`text-xs ml-auto ${videosComplete ? 'text-green-400' : 'text-slate-500'}`}>
              {videosWatched}/{videoCount}
            </span>
          </div>

          {/* Assignments */}
          <div className="flex items-center gap-2">
            {assignmentsComplete ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : (
              <Circle className="w-4 h-4 text-slate-500" />
            )}
            <span className={`text-sm ${assignmentsComplete ? 'text-green-400' : 'text-slate-300'}`}>
              Complete assignments
            </span>
            <span className={`text-xs ml-auto ${assignmentsComplete ? 'text-green-400' : 'text-amber-400'}`}>
              {assignmentsComplete ? 'Done' : 'Pending'}
            </span>
          </div>
        </div>

        {/* Call to Action */}
        {videosComplete && !assignmentsComplete && (
          <button
            onClick={onGoToProject}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors text-sm"
          >
            <FileEdit className="w-4 h-4" />
            Complete Assignments
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {!videosComplete && (
          <p className="text-xs text-slate-400 text-center">
            Keep watching to complete this stage
          </p>
        )}
      </div>
    </div>
  );
};

export default UnlockProgressPanel;
