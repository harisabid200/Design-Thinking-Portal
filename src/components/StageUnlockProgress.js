import React from 'react';
import { CheckCircle2, Circle, Video, FileText, ArrowRight, Sparkles } from 'lucide-react';

/**
 * StageUnlockProgress - Shows the user what's needed to unlock the next stage
 * Displays when videos are complete but assignments are not
 */
const StageUnlockProgress = ({ 
  videosComplete, 
  videosWatched, 
  videoCount,
  deliverablesComplete, 
  stageName,
  onGoToProject 
}) => {
  // Don't show if everything is complete
  if (videosComplete && deliverablesComplete) {
    return (
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-400">Stage Complete!</h3>
            <p className="text-sm text-emerald-300/70">You've unlocked the next stage</p>
          </div>
        </div>
      </div>
    );
  }

  // Show when videos complete but assignments pending
  if (videosComplete && !deliverablesComplete) {
    return (
      <div className="p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl animate-pulse-subtle">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-400">Almost There!</h3>
            <p className="text-sm text-amber-200/80 mt-1">
              Videos complete! Now complete your <strong>assignment</strong> to unlock the next stage.
            </p>
            
            {/* Progress checklist */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-300">All videos watched ({videosWatched}/{videoCount})</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Circle className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300">Complete assignment</span>
              </div>
            </div>

            <button
              onClick={onGoToProject}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-all"
            >
              <FileText className="w-4 h-4" />
              Go to Assignment
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default: Show progress while watching videos
  return (
    <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
      <h4 className="text-sm font-bold text-slate-300 mb-3">To Unlock Next Stage:</h4>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          {videosComplete ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <Circle className="w-4 h-4 text-slate-500" />
          )}
          <Video className="w-4 h-4 text-slate-400" />
          <span className={videosComplete ? 'text-emerald-300' : 'text-slate-400'}>
            Watch all videos ({videosWatched}/{videoCount})
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {deliverablesComplete ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <Circle className="w-4 h-4 text-slate-500" />
          )}
          <FileText className="w-4 h-4 text-slate-400" />
          <span className={deliverablesComplete ? 'text-emerald-300' : 'text-slate-400'}>
            Complete assignment
          </span>
        </div>
      </div>
    </div>
  );
};

export default StageUnlockProgress;
