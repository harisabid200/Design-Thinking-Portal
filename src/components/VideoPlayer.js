import React, { useRef, useState, useEffect } from 'react';
import { CheckCircle, Check, SkipForward } from 'lucide-react';

const VideoPlayer = ({ src, onComplete, poster, isCompleted, initialTime = 0, onProgressUpdate }) => {
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(isCompleted);
  const [hasSought, setHasSought] = useState(false);

  // If passed completion state changes (e.g. from DB), update local
  useEffect(() => {
    if (isCompleted) setCompleted(true);
    else setCompleted(false); // Reset when changing videos
  }, [isCompleted]);

  // Attempt to resume video on load (Native only)
  useEffect(() => {
    if (videoRef.current && initialTime > 0 && !hasSought) {
        videoRef.current.currentTime = initialTime;
        setHasSought(true);
    }
  }, [src, initialTime, hasSought]);

  // Reset hasSought when src changes
  useEffect(() => {
    setHasSought(false);
  }, [src]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      
      if (onProgressUpdate) onProgressUpdate(current);

      if (total > 0) {
        const percent = (current / total) * 100;
        setProgress(percent);

        // Mark as complete if > 90% and not already completed
        if (percent > 90 && !completed) {
          setCompleted(true);
          if (onComplete) onComplete();
        }
      }
    }
  };

  // Manual completion handler for embedded videos
  const handleManualComplete = () => {
    if (!completed) {
      setCompleted(true);
      if (onComplete) onComplete();
    }
  };

  // Helper to determine if we need an iframe (Drive/YouTube)
  const getEmbedUrl = (url) => {
    if (!url) return null;
    
    // Google Drive
    if (url.includes('drive.google.com')) {
      return url.replace(/\/view.*/, '/preview').replace(/\/share.*/, '/preview');
    }
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtu.be')) {
          videoId = url.split('/').pop();
      } else {
          videoId = new URLSearchParams(new URL(url).search).get('v');
      }
      return `https://www.youtube.com/embed/${videoId}`;
    }

    return null; // Standard video file
  };

  const embedUrl = getEmbedUrl(src);
  const isEmbedded = !!embedUrl;

  return (
    <div className="relative rounded-xl overflow-hidden bg-black shadow-2xl group w-full h-full flex items-center justify-center">
      {embedUrl ? (
        <iframe 
            src={embedUrl}
            className="w-full h-full border-0"
            allow="autoplay; encrypted-media; fullscreen"
            title="Video Content"
            allowFullScreen
        />
      ) : (
        <video
            ref={videoRef}
            className="w-full h-full object-contain"
            src={src}
            poster={poster}
            onTimeUpdate={handleTimeUpdate}
            controls
        />
      )}
      
      {/* Overlay Badge for Completion */}
      {completed && (
        <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-lg z-10 pointer-events-none">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-bold">Watched</span>
        </div>
      )}

      {/* Manual Complete Button for Embedded Videos */}
      {isEmbedded && !completed && (
        <div className="absolute bottom-4 right-4 z-20">
          <button
            onClick={handleManualComplete}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
          >
            <Check className="w-4 h-4" />
            <span>Mark Complete</span>
          </button>
        </div>
      )}

      {/* Skip to Next hint (bottom left) */}
      {isEmbedded && completed && (
        <div className="absolute bottom-4 left-4 z-20">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 text-slate-300 text-sm rounded-lg backdrop-blur-sm">
            <SkipForward className="w-4 h-4" />
            <span>Waiting for next video...</span>
          </div>
        </div>
      )}

      {/* Custom Progress Bar (Only for native video) */}
      {!embedUrl && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
            <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
            />
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
