import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import VideoPlayer from './VideoPlayer';
import NotesTab from './NotesTab';
import UpNextOverlay from './UpNextOverlay';
import ProjectWorkspace from './project/ProjectWorkspace';
import ProjectSelectionModal from './project/ProjectSelectionModal';
import StageUnlockProgress from './StageUnlockProgress';
import AIAssistant from './ai/AIAssistant';
import { PenTool, Info, FolderKanban, List, Sparkles, X, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { useProject } from '../context/ProjectContext';
import { useCourseContent } from '../context/CourseContentContext';
import CourseHeader from './CourseHeader';
import CourseSidebar from './CourseSidebar';

const StageLayout = ({ stageName, activeToolComponent }) => {
  const { user } = useAuth();
  const { isStageUnlocked, refreshProgress, getStageInfo } = useProgress();
  const { showProjectModal, setShowProjectModal } = useProject();
  
  // Get cached content from global context
  const { 
    allContent, 
    videoProgress, 
    videoPositions: cachedPositions,
    loading: contentLoading, 
    initialLoadComplete,
    getStageVideos
  } = useCourseContent();

  // Local state
  const [currentContent, setCurrentContent] = useState(null);
  const [completedIds, setCompletedIds] = useState({});
  const [videoPositions, setVideoPositions] = useState({});

  // Right Panel State - 3 tabs: content, project, tools
  const [sidebarTab, setSidebarTab] = useState('content');
  
  // Mobile sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Bottom Tab State
  const [activeTab, setActiveTab] = useState('overview');

  // Up Next Overlay State
  const [showUpNext, setShowUpNext] = useState(false);
  const [justCompletedVideoId, setJustCompletedVideoId] = useState(null);

  // Sync progress from context to local state
  useEffect(() => {
    setCompletedIds(videoProgress);
    setVideoPositions(cachedPositions);
  }, [videoProgress, cachedPositions]);

  // Set initial current content when stage changes (INSTANT - no loading)
  useEffect(() => {
    if (initialLoadComplete) {
      const stageVideos = getStageVideos(stageName);
      if (stageVideos.length > 0 && (!currentContent || currentContent.stage_name !== stageName)) {
        setCurrentContent(stageVideos[0]);
      }
    }
  }, [stageName, initialLoadComplete, getStageVideos, currentContent]);

  // Close mobile sidebar when switching tabs
  const handleSidebarTabChange = (tab) => {
    setSidebarTab(tab);
  };

  // Handle Video Progress Update (Resume Feature)
  const handleProgressUpdate = async (time) => {
    if (!currentContent || !user) return;
    
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
  const handleToggleComplete = useCallback(async (videoId, isComplete) => {
    setCompletedIds(prev => ({ ...prev, [videoId]: isComplete }));

    if (user) {
        const { error } = await supabase
            .from('video_progress')
            .upsert({
                user_id: user.id,
                content_id: videoId,
                is_completed: isComplete,
                updated_at: new Date()
            }, { onConflict: 'user_id, content_id' });
        
        if (error) console.error('Error saving progress:', error);
        
        // Refresh stage completion status (for locking/unlocking)
        if (refreshProgress) {
          refreshProgress();
        }
    }
  }, [user, refreshProgress]);

  // Handle Video Completion - Show Up Next Overlay
  const handleVideoComplete = useCallback((videoId) => {
    // Mark as completed
    handleToggleComplete(videoId, true);
    
    // Show up next overlay
    setJustCompletedVideoId(videoId);
    setShowUpNext(true);
  }, [handleToggleComplete]);

  // Filter content for CURRENT stage (using cached allContent)
  const currentStageVideos = allContent.filter(c => c.stage_name === stageName && c.type === 'video');
  const allVideos = allContent.filter(c => c.type === 'video');
  const allResources = allContent.filter(c => c.type !== 'video');

  // Find next video in current stage
  const getNextVideo = useCallback(() => {
    if (!currentContent) return null;
    const currentIndex = currentStageVideos.findIndex(v => v.id === currentContent.id);
    if (currentIndex >= 0 && currentIndex < currentStageVideos.length - 1) {
      return currentStageVideos[currentIndex + 1];
    }
    return null;
  }, [currentContent, currentStageVideos]);

  // Check if all videos in stage are complete (including the just-completed one)
  const isStageFullyComplete = useCallback(() => {
    return currentStageVideos.every(v => 
      completedIds[v.id] || v.id === justCompletedVideoId
    );
  }, [currentStageVideos, completedIds, justCompletedVideoId]);

  // Handle Play Next
  const handlePlayNext = useCallback(() => {
    const nextVideo = getNextVideo();
    if (nextVideo) {
      setCurrentContent(nextVideo);
    }
    setShowUpNext(false);
    setJustCompletedVideoId(null);
  }, [getNextVideo]);

  // Handle Cancel Up Next
  const handleCancelUpNext = useCallback(() => {
    setShowUpNext(false);
    setJustCompletedVideoId(null);
  }, []);

  // Calculate Progress % for Header
  const totalStageVideos = currentStageVideos.length;
  const completedStageCount = currentStageVideos.filter(v => completedIds[v.id]).length;
  const videoProgressPercent = totalStageVideos > 0 ? Math.round((completedStageCount / totalStageVideos) * 100) : 0;
  
  // Check true stage completion (videos + assignments)
  const stageInfo = getStageInfo(stageName);
  const isStageComplete = stageInfo?.isComplete === true;

  if (contentLoading && !initialLoadComplete) return <div className="h-full flex items-center justify-center text-white bg-slate-900"><div className="animate-pulse">Loading course...</div></div>;

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 overflow-hidden relative pt-14">
      <CourseHeader 
        title={stageName + " Stage"} 
        videoProgress={videoProgressPercent} 
        isStageComplete={isStageComplete}
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
      
      {/* LEFT / CENTER: Video & Bottom Panel */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        
        {/* 1. TOP: Video Area - Responsive height */}
        <div className="flex-none h-[35vh] sm:h-[45vh] lg:h-[60vh] bg-black flex items-center justify-center relative">
            {currentContent?.type === 'video' ? (
                <div className="w-full h-full p-2 sm:p-4 flex flex-col items-center justify-center">
                    <div className="w-full h-full max-w-6xl flex items-center justify-center">
                       <VideoPlayer 
                            src={currentContent.url} 
                            isCompleted={!!completedIds[currentContent.id]}
                            onComplete={() => handleVideoComplete(currentContent.id)}
                            initialTime={videoPositions[currentContent.id] || 0}
                            onProgressUpdate={handleProgressUpdate}
                       />
                    </div>
                </div>
            ) : (
                <div className="text-gray-500">Select content to view</div>
            )}

            {/* Up Next Overlay */}
            {showUpNext && (
              <UpNextOverlay
                nextVideo={getNextVideo()}
                onPlayNext={handlePlayNext}
                onCancel={handleCancelUpNext}
                countdown={5}
                isStageComplete={isStageFullyComplete()}
                stageName={stageName}
              />
            )}
        </div>

        {/* 2. BOTTOM: Info & Tabs */}
        <div className="flex-1 bg-slate-800 flex flex-col min-h-0 overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-700 bg-slate-800/50 px-2 sm:px-4">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2 border-b-2 transition-colors ${activeTab === 'overview' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                >
                    <Info className="w-4 h-4" />
                    <span>Overview</span>
                </button>
                <button 
                    onClick={() => setActiveTab('notes')}
                    className={`py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2 border-b-2 transition-colors ${activeTab === 'notes' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                >
                    <PenTool className="w-4 h-4" />
                    <span>Notes</span>
                </button>
            </div>

            {/* Tab Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                {activeTab === 'overview' && currentContent && (
                    <div className="max-w-3xl">
                        {/* Video Title & Description - PRIMARY CONTENT */}
                        <div className="mb-4 sm:mb-6">
                          <h2 className="text-lg sm:text-xl font-bold text-white mb-2">{currentContent.title}</h2>
                          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                            {currentContent.description || 'No description available for this lesson.'}
                          </p>
                        </div>
                        
                        {/* Stage Progress - shows requirements (hide when fully complete) */}
                        {!isStageComplete && (
                          <StageUnlockProgress
                            videosComplete={videoProgressPercent === 100}
                            videosWatched={completedStageCount}
                            videoCount={totalStageVideos}
                            deliverablesComplete={stageInfo?.deliverablesComplete}
                            stageName={stageName}
                            onGoToProject={() => {
                              setSidebarTab('project');
                              setMobileSidebarOpen(true);
                            }}
                          />
                        )}
                    </div>
                )}
                
                {activeTab === 'notes' && (
                    <NotesTab stageName={stageName} />
                )}
            </div>
        </div>
      </div>

      {/* Mobile Sidebar Toggle Button - Fixed at bottom right */}
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-30 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* RIGHT SIDEBAR: Content / Project / Tools - Slides in on mobile */}
      <div className={`
        fixed lg:relative inset-y-0 right-0 
        w-full sm:w-96 lg:w-80 
        bg-slate-900 border-l border-slate-700/50 
        flex flex-col z-50 lg:z-20 flex-shrink-0
        transform transition-transform duration-300 ease-in-out
        ${mobileSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        pt-14 lg:pt-0
      `}>
         {/* Mobile Close Button */}
         <button
           onClick={() => setMobileSidebarOpen(false)}
           className="lg:hidden absolute top-16 right-4 z-10 p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
         >
           <X className="w-5 h-5" />
         </button>

         {/* 3-Tab Header */}
         <div className="grid grid-cols-3 border-b border-slate-700/50 bg-slate-800">
             <button 
                 onClick={() => handleSidebarTabChange('content')}
                 className={`py-3 text-xs font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-1
                   ${sidebarTab === 'content' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-900' : 'text-slate-400 hover:bg-slate-700'}`}
             >
                 <List className="w-3.5 h-3.5" />
                 <span className="hidden sm:inline">Content</span>
                 <span className="sm:hidden">List</span>
             </button>
             <button 
                 onClick={() => handleSidebarTabChange('project')}
                 className={`py-3 text-xs font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-1
                   ${sidebarTab === 'project' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-900' : 'text-slate-400 hover:bg-slate-700'}`}
             >
                 <FolderKanban className="w-3.5 h-3.5" />
                 Project
             </button>
             <button 
                 onClick={() => handleSidebarTabChange('tools')}
                 className={`py-3 text-xs font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-1
                   ${sidebarTab === 'tools' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-900' : 'text-slate-400 hover:bg-slate-700'}`}
             >
                 <Sparkles className="w-3.5 h-3.5" />
                 AI
             </button>
         </div>

         {/* Content Area */}
         <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
             {sidebarTab === 'content' && (
                <CourseSidebar 
                    allVideos={allVideos}
                    allResources={allResources}
                    currentStage={stageName}
                    currentContentId={currentContent?.id}
                    onSelectContent={(content) => {
                      setCurrentContent(content);
                      setMobileSidebarOpen(false); // Close sidebar on mobile after selection
                    }}
                    completedIds={completedIds}
                    onToggleComplete={handleToggleComplete}
                    isStageUnlocked={isStageUnlocked}
                    onSwitchToProjectTab={() => setSidebarTab('project')}
                />
             )}
             
             {sidebarTab === 'project' && (
                <ProjectWorkspace currentStage={stageName} />
             )}
             
             {sidebarTab === 'tools' && (
                <AIAssistant stageName={stageName} />
             )}
         </div>
      </div>
      
      {/* Project Selection Modal */}
      <ProjectSelectionModal 
        isOpen={showProjectModal} 
        onClose={() => setShowProjectModal(false)} 
      />
      </div>

    </div>
  );
};

export default StageLayout;
