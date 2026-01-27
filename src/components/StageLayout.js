import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import VideoPlayer from './VideoPlayer';
import PlaylistSidebar from './PlaylistSidebar';
import NotesTab from './NotesTab';
import ResourcesTab from './ResourcesTab';
import { FileText, PenTool, Info } from 'lucide-react';

const StageLayout = ({ stageName, activeToolComponent }) => {
  const [content, setContent] = useState([]);
  const [currentContent, setCurrentContent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Right Panel State
  const [isToolActive, setIsToolActive] = useState(false);
  
  // Bottom Tab State
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'notes', 'resources'

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
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [stageName]);

  const currentVideos = content.filter(c => c.type === 'video');
  const currentResources = content.filter(c => c.type !== 'video');

  // Handle Tool Activation
  const toggleTool = (active) => {
    setIsToolActive(active);
    // If tool is active, maybe auto-switch bottom tab to 'playlist' or 'overview'? 
    // For now keeping user choice or default.
  };

  if (loading) return <div className="h-full flex items-center justify-center text-white bg-black">Loading...</div>;

  return (
    <div className="flex h-full w-full bg-black overflow-hidden relative">
      
      {/* LEFT / CENTER: Video & Bottom Panel */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        
        {/* 1. TOP: Video Area (Fixed Height ~60-65vh) */}
        <div className="flex-none h-[65vh] bg-black flex items-center justify-center relative border-b border-gray-800">
            {currentContent?.type === 'video' ? (
                <div className="w-full h-full p-4 flex flex-col items-center justify-center">
                    <div className="w-full h-full max-w-6xl flex items-center justify-center">
                       {/* Video Player Wrapper to maintain aspect ratio/clean look */}
                       <VideoPlayer src={currentContent.url} />
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
                <button 
                    onClick={() => setActiveTab('resources')}
                    className={`py-3 px-4 text-sm font-medium flex items-center space-x-2 border-b-2 transition-colors ${activeTab === 'resources' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <FileText className="w-4 h-4" />
                    <span>Resources</span>
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

                {activeTab === 'resources' && (
                    <ResourcesTab resources={currentResources} />
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
                    Content
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
                    currentContentId={currentContent?.id}
                    onSelectContent={setCurrentContent}
                />
             )}
         </div>
      </div>

    </div>
  );
};

export default StageLayout;
