import React, { useState, useEffect } from 'react';
import { X, Lock, CheckCircle2, Circle, ArrowRight } from 'lucide-react';

/**
 * UnlockToast - Shows unlock requirements when clicking a locked stage
 */
const UnlockToast = ({ 
  isOpen, 
  onClose, 
  lockedStage, 
  requiredStage, 
  stageInfo,
  onNavigate 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const videoProgress = stageInfo?.videoCount > 0 
    ? Math.round((stageInfo.videosWatched / stageInfo.videoCount) * 100) 
    : 0;

  // Determine what's needed
  const needsVideos = !stageInfo?.videosComplete;
  const needsAssignments = !stageInfo?.deliverablesComplete;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      
      {/* Toast Card */}
      <div className={`relative bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-md w-full overflow-hidden transform transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-900/50 to-orange-900/50 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{lockedStage} is Locked</h3>
                <p className="text-amber-200/80 text-sm">Complete {requiredStage} first</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Requirements */}
        <div className="p-6 space-y-4">
          <p className="text-slate-300 text-sm">
            To unlock <span className="text-white font-semibold">{lockedStage}</span>, 
            you must complete all requirements in <span className="text-amber-400 font-semibold">{requiredStage}</span>:
          </p>

          {/* Video Progress */}
          <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl">
            {stageInfo?.videosComplete ? (
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-slate-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white font-medium">Watch all videos</span>
                <span className={`text-xs font-semibold ${stageInfo?.videosComplete ? 'text-green-400' : 'text-slate-400'}`}>
                  {stageInfo?.videosWatched || 0}/{stageInfo?.videoCount || 0}
                </span>
              </div>
              <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${stageInfo?.videosComplete ? 'bg-green-500' : 'bg-amber-500'}`}
                  style={{ width: `${videoProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Assignment Progress */}
          <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl">
            {stageInfo?.deliverablesComplete ? (
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-slate-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              <span className="text-sm text-white font-medium">Complete all assignments</span>
              {needsAssignments && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Submit your work in the Project tab
                </p>
              )}
            </div>
            {stageInfo?.deliverablesComplete ? (
              <span className="text-xs font-semibold text-green-400">Done</span>
            ) : (
              <span className="text-xs font-semibold text-amber-400">Pending</span>
            )}
          </div>

          {/* What's Missing Summary */}
          {(needsVideos || needsAssignments) && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <p className="text-sm text-amber-200">
                {needsVideos && needsAssignments 
                  ? "⚠️ Watch remaining videos and complete assignments"
                  : needsVideos 
                    ? "⚠️ Watch remaining videos to continue"
                    : "⚠️ Complete your assignments in the Project tab"
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            Close
          </button>
          <button
            onClick={() => {
              onNavigate(requiredStage);
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl transition-colors"
          >
            Go to {requiredStage}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnlockToast;
