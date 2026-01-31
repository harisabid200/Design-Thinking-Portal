import React, { useState, useEffect } from 'react';
import { Play, X, Trophy, Sparkles } from 'lucide-react';

/**
 * UpNextOverlay - Shows after video completion with countdown to next video
 * Similar to Coursera/Udemy auto-advance behavior
 */
const UpNextOverlay = ({ 
  nextVideo, 
  onPlayNext, 
  onCancel, 
  countdown = 5,
  isStageComplete = false,
  stageName = ''
}) => {
  const [secondsLeft, setSecondsLeft] = useState(countdown);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Show brief celebration
    setShowConfetti(true);
    const confettiTimer = setTimeout(() => setShowConfetti(false), 2000);

    // If there's a next video, start countdown
    if (nextVideo && !isStageComplete) {
      const interval = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            onPlayNext();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(interval);
        clearTimeout(confettiTimer);
      };
    }

    return () => clearTimeout(confettiTimer);
  }, [nextVideo, onPlayNext, isStageComplete]);

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-30 animate-fadeIn">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#818cf8', '#a78bfa', '#f472b6', '#34d399', '#fbbf24'][i % 5],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="text-center max-w-md px-6">
        {isStageComplete ? (
          // Stage Completion Celebration
          <div className="animate-scaleIn">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/30">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {stageName} Stage Complete! 🎉
            </h2>
            <p className="text-slate-300 mb-6">
              Congratulations! You've finished all videos in this stage. Keep up the great work!
            </p>
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg"
            >
              Continue Learning
            </button>
          </div>
        ) : nextVideo ? (
          // Up Next with Countdown
          <div className="animate-slideUp">
            <div className="flex items-center justify-center gap-2 text-emerald-400 mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Lesson Complete!</span>
            </div>
            
            <h3 className="text-sm text-slate-400 uppercase tracking-wide mb-2">Up Next</h3>
            <h2 className="text-xl font-bold text-white mb-6">{nextVideo.title}</h2>
            
            {/* Countdown Ring */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-slate-700"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-indigo-500"
                  strokeDasharray={276}
                  strokeDashoffset={276 - (276 * secondsLeft) / countdown}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{secondsLeft}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={onCancel}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={onPlayNext}
                className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Play Now
              </button>
            </div>
          </div>
        ) : (
          // No More Videos in Stage (but not complete - edge case)
          <div className="animate-scaleIn">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Great Progress!</h2>
            <p className="text-slate-400 mb-4">You've completed this lesson.</p>
            <button
              onClick={onCancel}
              className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpNextOverlay;
