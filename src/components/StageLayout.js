import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import VideoPlayer from './VideoPlayer';
import PlaylistSidebar from './PlaylistSidebar';
import NotesTab from './NotesTab';
import { PenTool, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import CourseHeader from './CourseHeader';

const StageLayout = ({ stageName, activeToolComponent }) => {
  const { user } = useAuth();
  const { updateStageStatus, stages } = useProgress(); 
  const [content, setContent] = useState([]);
  const [currentContent, setCurrentContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState({}); // { [id]: boolean }
  const [videoPositions, setVideoPositions] = useState({}); // { [id]: number (seconds) }

  // Right Panel State
  const [isToolActive, setIsToolActive] = useState(false);
  
  // Bottom Tab State
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'notes'

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('stage_content')
          .select('*')
          .eq('stage_name', stageName)
          .order('sequence_order', { ascending: true });
  
        if (error) throw error;
  
        setContent(data);
        if (data.length > 0) {
          const firstVideo = data.find(c => c.type === 'video') || data[0];
          setCurrentContent(firstVideo);
        }

        // Fetch progress for this user
        if (user?.id) {
            const { data: progressData } = await supabase
                .from('video_progress')
                .select('content_id, is_completed, last_position_seconds')
                .eq('user_id', user.id);
            
            if (progressData) {
                const progressMap = {};
                const positionMap = {};
                progressData.forEach(p => {
                    progressMap[p.content_id] = p.is_completed;
                    positionMap[p.content_id] = p.last_position_seconds || 0;
                });
                setCompletedIds(progressMap);
                setVideoPositions(positionMap);
            }
        }

      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [stageName, user?.id]); // Use user.id to avoid re-running on object reference changes

  const currentVideos = content.filter(c => c.type === 'video');
  const currentResources = content.filter(c => c.type !== 'video');

  // Check for Stage Completion (Auto-Unlock)
  useEffect(() => {
    if (loading || currentVideos.length === 0) return;
    
    // Ensure all videos are completed AND we haven't already marked it as completed
    const allWatched = currentVideos.every(v => completedIds[v.id]);
    const isAlreadyCompleted = stages[stageName] === 'completed';

    if (allWatched && !isAlreadyCompleted) {
        console.log(`All videos watched in ${stageName}. Unlocking next stage...`);
        updateStageStatus(stageName, 'completed');
    }
  }, [completedIds, currentVideos, stageName, updateStageStatus, stages, loading]);

  // Handle Video Progress Update (Resume Feature)
  const handleProgressUpdate = async (time) => {
    if (!currentContent || !user) return;
    
    // Update local state less frequently if needed, but for now we just keep it
    // Actually, we should probably debounce the DB save
    // For simplicity in this step, let's just save every 5 seconds or allow the component to handle debouncing?
    // Let's implement a simple throttle logic or just save on pause?
    // User requested "Resume", so we need to save periodically.
    
    // We will save to DB every ~5 seconds by checking integer modulo
    if (Math.floor(time) % 5 === 0) {
         await supabase
            .from('video_progress')
            .upsert({
                user_id: user.id,
                content_id: currentContent.id,
                last_position_seconds: time,
                updated_at: new Date()
            }, { onConflict: 'user_id, content_id' });
    }
  };

  // Handle Video Completion Toggle
  const handleToggleComplete = async (videoId, isComplete) => {
    // Optimistic Update
    setCompletedIds(prev => ({ ...prev, [videoId]: isComplete }));

    if (user) {
        // Upsert progress
        const { error } = await supabase
            .from('video_progress')
            .upsert({
                user_id: user.id,
                content_id: videoId,
                is_completed: isComplete,
                updated_at: new Date()
            }, { onConflict: 'user_id, content_id' });
        
        if (error) console.error('Error saving progress:', error);
    }
  };

  // Handle Tool Activation
  const toggleTool = (active) => {
    setIsToolActive(active);
  };

  // Calculate Progress % for Header
  const totalVideos = currentVideos.length;
  const completedCount = currentVideos.filter(v => completedIds[v.id]).length;
  const progressPercent = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;

  if (loading) return <div className="h-full flex items-center justify-center text-white bg-black">Loading...</div>;

  return (
    <div className="flex flex-col h-full w-full bg-black overflow-hidden relative pt-16">
      <CourseHeader title={stageName + " Stage"} progress={progressPercent} />

      <div className="flex-1 flex overflow-hidden relative">
      
      {/* LEFT / CENTER: Video & Bottom Panel */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        
        {/* 1. TOP: Video Area (Fixed Height ~60-65vh) */}
        <div className="flex-none h-[65vh] bg-black flex items-center justify-center relative border-b border-gray-800">
            {currentContent?.type === 'video' ? (
                <div className="w-full h-full p-4 flex flex-col items-center justify-center">
                    <div className="w-full h-full max-w-6xl flex items-center justify-center">
                       {/* Video Player Wrapper to maintain aspect ratio/clean look */}
                       {/* Pass completion handler to player too if we want auto-complete at end */}
                       <VideoPlayer 
                            src={currentContent.url} 
                            isCompleted={!!completedIds[currentContent.id]}
                            onComplete={() => handleToggleComplete(currentContent.id, true)}
                            initialTime={videoPositions[currentContent.id] || 0}
                            onProgressUpdate={handleProgressUpdate}
                       />
                    </div>
                </div>
            ) : (
                <div className="text-gray-500">Select content to view</div>
            )}
        </div>

        {/* 2. BOTTOM: Info & Tabs (Remaining Height) */}
        <div className="flex-1 bg-white flex flex-col min-h-0 overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-gray-200 bg-gray-50 px-4">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`py-3 px-4 text-sm font-medium flex items-center space-x-2 border-b-2 transition-colors ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <Info className="w-4 h-4" />
                    <span>Overview</span>
                </button>
                <button 
                    onClick={() => setActiveTab('notes')}
                    className={`py-3 px-4 text-sm font-medium flex items-center space-x-2 border-b-2 transition-colors ${activeTab === 'notes' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <PenTool className="w-4 h-4" />
                    <span>Notes</span>
                </button>
            </div>

            {/* Tab Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'overview' && currentContent && (
                    <div className="max-w-3xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentContent.title}</h2>
                        <p className="text-gray-600 leading-relaxed">{currentContent.description || 'No description available.'}</p>
                    </div>
                )}
                
                {activeTab === 'notes' && (
                    <NotesTab stageName={stageName} />
                )}
            </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: Playlist OR Tool (Fixed Width) */}
      <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col z-20 shadow-xl flex-shrink-0">
         {/* Toggle Header */}
         {activeToolComponent && (
            <div className="grid grid-cols-2 border-b border-gray-200 bg-white">
                <button 
                    onClick={() => toggleTool(false)}
                    className={`py-3 text-xs font-bold uppercase tracking-wide ${!isToolActive ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    Course Content
                </button>
                <button 
                    onClick={() => toggleTool(true)}
                    className={`py-3 text-xs font-bold uppercase tracking-wide ${isToolActive ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    AI Tools
                </button>
            </div>
         )}

         {/* Content Area */}
         <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
             {isToolActive && activeToolComponent ? (
                 <div className="h-full flex flex-col">
                    {/* Tool Wrapper */}
                    {activeToolComponent}
                 </div>
             ) : (
                <PlaylistSidebar 
                    content={currentVideos}
                    resources={currentResources}
                    currentContentId={currentContent?.id}
                    onSelectContent={setCurrentContent}
                    completedIds={completedIds}
                    onToggleComplete={handleToggleComplete}
                />
             )}
         </div>
      </div>
      </div>

    </div>
  );
};

export default StageLayout;
