import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, FileText, Link as LinkIcon, Circle, CheckCircle2, Lock, Play, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STAGE_ORDER = ['Empathise', 'Define', 'Ideate', 'Prototype', 'Test'];

const STAGE_COLORS = {
  'Empathise': { bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/30' },
  'Define': { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/30' },
  'Ideate': { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'Prototype': { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/30' },
  'Test': { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/30' }
};

const CourseSidebar = ({ 
    allVideos = [], 
    allResources = [], 
    currentStage, 
    currentContentId, 
    onSelectContent, 
    completedIds = {}, 
    onToggleComplete,
    isStageUnlocked 
}) => {
  const navigate = useNavigate();
  const [expandedStages, setExpandedStages] = useState({});
  const [expandedResources, setExpandedResources] = useState({});

  useEffect(() => {
    if (currentStage) {
        setExpandedStages(prev => ({ ...prev, [currentStage]: true }));
    }
  }, [currentStage]);

  const toggleStage = (stageName) => {
    setExpandedStages(prev => ({ ...prev, [stageName]: !prev[stageName] }));
  };

  const toggleResources = (id, e) => {
    e.stopPropagation();
    setExpandedResources(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const contentByStage = STAGE_ORDER.reduce((acc, stage) => {
    acc[stage] = {
        videos: allVideos.filter(v => v.stage_name === stage),
        resources: allResources.filter(r => r.stage_name === stage)
    };
    return acc;
  }, {});

  const handleItemClick = (item) => {
    if (item.stage_name === currentStage) {
        onSelectContent(item);
    } else {
        navigate(`/stage/${item.stage_name.toLowerCase()}`);
    }
  };

  return (
    <div className="bg-slate-900 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <h3 className="font-bold text-white text-sm">Course Content</h3>
        <p className="text-xs text-slate-400 mt-0.5">{allVideos.length} lessons</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {STAGE_ORDER.map((stageName, stageIndex) => {
            const { videos, resources } = contentByStage[stageName];
            const isLocked = isStageUnlocked ? !isStageUnlocked(stageName) : false;
            const isOpen = expandedStages[stageName];
            const completedCount = videos.filter(v => completedIds[v.id]).length;
            const totalCount = videos.length;
            const isCurrentStage = stageName === currentStage;
            const stageColor = STAGE_COLORS[stageName];
            
            return (
                <div key={stageName} className="border-b border-slate-700/30">
                    {/* Stage Header */}
                    <button 
                        onClick={() => !isLocked && toggleStage(stageName)}
                        disabled={isLocked}
                        className={`w-full flex items-center justify-between p-4 transition-all duration-200 text-left
                            ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800/50 cursor-pointer'}
                            ${isCurrentStage ? 'bg-slate-800/70' : ''}
                        `}
                    >
                        <div className="flex items-center gap-3 flex-1">
                            {/* Stage Number Badge */}
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
                                ${isLocked ? 'bg-slate-700 text-slate-500' : isCurrentStage ? stageColor.bg + ' text-white' : 'bg-slate-700 text-slate-300'}
                            `}>
                                {isLocked ? <Lock className="w-3.5 h-3.5" /> : stageIndex + 1}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <span className={`font-semibold text-sm block truncate ${isLocked ? 'text-slate-500' : 'text-white'}`}>
                                    {stageName}
                                </span>
                                <span className="text-xs text-slate-500">
                                    {isLocked ? 'Locked' : `${completedCount}/${totalCount} complete`}
                                </span>
                            </div>
                        </div>
                        
                        {/* Chevron */}
                        {!isLocked && (
                            <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                            </div>
                        )}
                    </button>

                    {/* Stage Videos */}
                    {isOpen && !isLocked && (
                        <div className="bg-slate-800/30">
                            {videos.length === 0 ? (
                                <div className="px-4 py-6 text-center text-slate-500 text-sm">
                                    No content yet
                                </div>
                            ) : videos.map((item, index) => {
                                const isActive = item.id === currentContentId;
                                const itemResources = resources.filter(r => r.parent_id === item.id);
                                const hasResources = itemResources.length > 0;
                                const isResExpanded = expandedResources[item.id];
                                const isDone = !!completedIds[item.id];

                                return (
                                    <div key={item.id}>
                                        <div 
                                            className={`flex items-start gap-3 p-3 pl-6 cursor-pointer transition-all duration-200 group
                                                ${isActive ? 'bg-indigo-500/20 border-l-2 border-indigo-500' : 'hover:bg-slate-700/30 border-l-2 border-transparent'}
                                            `}
                                            onClick={() => handleItemClick(item)}
                                        >
                                            {/* Completion Toggle */}
                                            <button 
                                                className="mt-0.5 flex-shrink-0 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onToggleComplete) onToggleComplete(item.id, !isDone);
                                                }}
                                            >
                                                {isDone ? (
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                ) : isActive ? (
                                                    <Play className="w-5 h-5 text-indigo-400 fill-indigo-400" />
                                                ) : (
                                                    <Circle className="w-5 h-5 text-slate-500 group-hover:text-slate-400" />
                                                )}
                                            </button>

                                            <div className="flex-1 min-w-0">
                                                <h4 className={`text-sm font-medium truncate leading-tight
                                                    ${isActive ? 'text-white' : isDone ? 'text-slate-400' : 'text-slate-200'}
                                                `}>
                                                    {index + 1}. {item.title}
                                                </h4>
                                                
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="text-xs text-slate-500">
                                                        {item.duration || '5'} min
                                                    </span>

                                                    {/* Resources Button */}
                                                    {hasResources && (
                                                        <button 
                                                            onClick={(e) => toggleResources(item.id, e)}
                                                            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                                                        >
                                                            <FileText className="w-3 h-3" />
                                                            <span>{itemResources.length} resources</span>
                                                            <ChevronRight className={`w-3 h-3 transition-transform ${isResExpanded ? 'rotate-90' : ''}`} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Resources Dropdown */}
                                        {isResExpanded && hasResources && (
                                            <div className="bg-slate-800/50 border-l-2 border-slate-600 ml-6 py-1">
                                                {itemResources.map(res => (
                                                    <a 
                                                        key={res.id}
                                                        href={res.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-700/50 hover:text-indigo-300 transition-colors"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {res.type === 'pdf' ? <FileText className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />}
                                                        <span className="truncate flex-1">{res.title}</span>
                                                        <ExternalLink className="w-3 h-3 opacity-50" />
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default CourseSidebar;
