import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trophy, CheckCircle2, Video } from 'lucide-react';

/**
 * CourseHeader - Top navigation for course player
 * 
 * Props:
 * - title: Stage name
 * - videoProgress: Percentage of videos watched (0-100)
 * - isStageComplete: True when BOTH videos AND assignment complete (unlocks next stage)
 */
const CourseHeader = ({ title, videoProgress = 0, isStageComplete = false }) => {
  const navigate = useNavigate();

  return (
    <div className="h-14 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50 backdrop-blur-lg">
      {/* Left: Back & Title */}
      <div className="flex items-center">
        <button 
           onClick={() => navigate('/dashboard')}
           className="mr-3 p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all duration-200 group"
           title="Back to Dashboard"
        >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <div className="flex flex-col">
            <h1 className="text-sm font-bold text-white tracking-wide">{title}</h1>
            <span className="text-xs text-slate-400">Design Thinking Portal</span>
        </div>
      </div>

      {/* Center: Video Progress Bar (Desktop) */}
      <div className="hidden md:flex items-center gap-3 flex-1 max-w-md mx-8">
        <div className="flex items-center gap-2 text-slate-400">
          <Video className="w-4 h-4" />
          <span className="text-xs">Videos</span>
        </div>
        <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isStageComplete 
                ? 'bg-gradient-to-r from-emerald-500 to-green-400' 
                : videoProgress === 100
                  ? 'bg-gradient-to-r from-amber-500 to-orange-400' // Videos done but not complete
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500'
            }`}
            style={{ width: `${videoProgress}%` }}
          />
        </div>
        <span className={`text-xs font-bold min-w-[3rem] text-right ${
          isStageComplete ? 'text-emerald-400' : 
          videoProgress === 100 ? 'text-amber-400' : 'text-white'
        }`}>
          {videoProgress}%
        </span>
      </div>

      {/* Right: Status Badge */}
      <div className="flex items-center gap-2">
        {isStageComplete ? (
          // Stage fully complete (videos + assignment)
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-emerald-500/20 border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-300">Stage Complete</span>
          </div>
        ) : videoProgress === 100 ? (
          // Videos done but assignment pending
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-amber-500/20 border-amber-500/30">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-300">Assignment Pending</span>
          </div>
        ) : (
          // Still watching videos
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-indigo-500/20 border-indigo-500/30">
            <Trophy className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-300">{videoProgress}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseHeader;
