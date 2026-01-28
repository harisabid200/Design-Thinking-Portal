import React, { useRef, useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

const VideoPlayer = ({ src, onComplete, poster, isCompleted, initialTime = 0, onProgressUpdate }) => {
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(isCompleted);
  const [hasSought, setHasSought] = useState(false);

  // If passed completion state changes (e.g. from DB), update local
  useEffect(() => {
    if (isCompleted) setCompleted(true);
  }, [isCompleted]);

  // Attempt to resume video on load (Native only)
  useEffect(() => {
    if (videoRef.current && initialTime > 0 && !hasSought) {
        videoRef.current.currentTime = initialTime;
        setHasSought(true);
    }
  }, [src, initialTime, hasSought]); // Reset seek when source changes

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      
      // Notify parent of progress (frequency controlled by parent or native event firing)
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

  // Helper to determine if we need an iframe (Drive/YouTube)
  const getEmbedUrl = (url) => {
    if (!url) return null;
    
    // Google Drive
    if (url.includes('drive.google.com')) {
      // Convert /view or /share to /preview
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

  return (
    <div className="relative rounded-xl overflow-hidden bg-black shadow-lg group w-full h-full flex items-center justify-center">
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
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full flex items-center space-x-1 shadow-md z-10 pointer-events-none">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-bold">Watched</span>
        </div>
      )}

      {/* Custom Progress Bar (Only for native video) */}
      {!embedUrl && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
            <div 
            className="h-full bg-indigo-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
            />
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
