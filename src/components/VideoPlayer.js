import React, { useRef, useState, useEffect } from 'react';
import { CheckCircle, Play } from 'lucide-react';

const VideoPlayer = ({ src, onComplete, poster, isCompleted }) => {
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [played, setPlayed] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);

  // If passed completion state changes (e.g. from DB), update local
  useEffect(() => {
    if (isCompleted) setCompleted(true);
  }, [isCompleted]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      
      setDuration(total);
      
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

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setPlayed(true);
      } else {
        videoRef.current.pause();
      }
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-black shadow-lg group w-full h-full flex items-center justify-center">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        src={src}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        controls
      />
      
      {/* Overlay Badge for Completion */}
      {completed && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full flex items-center space-x-1 shadow-md z-10 pointer-events-none">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-bold">Watched</span>
        </div>
      )}

      {/* Custom Progress Bar (Optional overlay if native controls are hidden, but we use native for now) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <div 
          className="h-full bg-indigo-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
