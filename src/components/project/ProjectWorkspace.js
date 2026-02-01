import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject, STAGE_DELIVERABLES } from '../../context/ProjectContext';
import { useProgress, STAGE_ORDER } from '../../context/ProgressContext';
import AssignmentEditorModal from './AssignmentEditorModal';
import UnlockToast from '../UnlockToast';
import { 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  FileText,
  ChevronDown,
  Lock
} from 'lucide-react';

const STAGE_ICONS = {
  Empathise: '❤️',
  Define: '🎯',
  Ideate: '💡',
  Prototype: '✏️',
  Test: '🧪'
};

const ProjectWorkspace = ({ currentStage }) => {
  const navigate = useNavigate();
  const { 
    project, 
    isDeliverableComplete, 
    getStageProgress,
    setShowProjectModal 
  } = useProject();
  const { refreshProgress, isStageUnlocked, getStageInfo } = useProgress();
  
  // Selected stage for viewing (defaults to current stage from video)
  const [selectedStage, setSelectedStage] = useState(currentStage);
  const [showStageDropdown, setShowStageDropdown] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);
  
  // UnlockToast state
  const [showUnlockToast, setShowUnlockToast] = useState(false);
  const [lockedStageInfo, setLockedStageInfo] = useState({ locked: null, required: null, info: null });

  // Sync with currentStage when it changes (user navigates via video)
  useEffect(() => {
    setSelectedStage(currentStage);
  }, [currentStage]);

  // Handle opening assignment editor
  const handleOpenAssignment = (stageName, deliverable) => {
    setSelectedDeliverable({ stageName, deliverable });
    setEditorOpen(true);
  };

  // Handle closing assignment editor
  const handleCloseEditor = () => {
    setEditorOpen(false);
    setSelectedDeliverable(null);
    // Refresh progress after closing (in case something was saved)
    if (refreshProgress) {
      refreshProgress();
    }
  };

  // Handle stage selection
  const handleStageSelect = (stage) => {
    setSelectedStage(stage);
    setShowStageDropdown(false);
  };

  // Handle locked stage click - show UnlockToast
  const handleLockedStageClick = (stage, index) => {
    const prevStageName = STAGE_ORDER[index - 1];
    const prevStageInfo = getStageInfo(prevStageName);
    setLockedStageInfo({
      locked: stage,
      required: prevStageName,
      info: prevStageInfo
    });
    setShowUnlockToast(true);
    setShowStageDropdown(false);
  };

  // Navigate to required stage
  const handleNavigateToStage = (stageName) => {
    navigate(`/stage/${stageName.toLowerCase()}`);
  };

  // If no project, show prompt to create one
  if (!project) {
    return (
      <div className="p-4 h-full flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="font-bold text-white mb-2">No Active Project</h3>
        <p className="text-slate-400 text-sm mb-4">
          Start a Design Thinking project to work through all stages
        </p>
        <button
          onClick={() => setShowProjectModal(true)}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition-colors"
        >
          Start Project
        </button>
      </div>
    );
  }

  const stageDeliverables = STAGE_DELIVERABLES[selectedStage] || [];
  const stageProgress = getStageProgress(selectedStage);
  const isViewingDifferentStage = selectedStage !== currentStage;

  return (
    <>
      <div className="h-full flex flex-col bg-slate-900">
        {/* Project Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-2 text-sm text-indigo-400 mb-1">
            <FileText className="w-4 h-4" />
            <span>Your Project</span>
          </div>
          <h3 className="font-bold text-white truncate">{project.title}</h3>
          <p className="text-xs text-slate-400 mt-1 truncate">{project.target_users}</p>
        </div>

        {/* Stage Selector */}
        <div className="p-3 border-b border-slate-700 bg-slate-800/50">
          <div className="relative">
            <button
              onClick={() => setShowStageDropdown(!showStageDropdown)}
              className="w-full flex items-center justify-between p-2.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{STAGE_ICONS[selectedStage]}</span>
                <span className="font-medium text-white">{selectedStage}</span>
                {isViewingDifferentStage && (
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                    Browsing
                  </span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showStageDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {showStageDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-20 overflow-hidden">
                {STAGE_ORDER.map((stage) => {
                  const unlocked = isStageUnlocked(stage);
                  const isSelected = stage === selectedStage;
                  const isCurrent = stage === currentStage;
                  
                  return (
                    <button
                      key={stage}
                      onClick={() => unlocked 
                        ? handleStageSelect(stage) 
                        : handleLockedStageClick(stage, STAGE_ORDER.indexOf(stage))
                      }
                      className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left
                        ${isSelected ? 'bg-indigo-500/20' : 'hover:bg-slate-700/50'}
                        ${!unlocked ? 'opacity-75 hover:opacity-100' : ''}
                      `}
                    >
                      <span className="text-lg">{STAGE_ICONS[stage]}</span>
                      <span className={`flex-1 font-medium ${isSelected ? 'text-indigo-300' : 'text-white'}`}>
                        {stage}
                      </span>
                      {!unlocked && <Lock className="w-3.5 h-3.5 text-amber-400" />}
                      {isCurrent && unlocked && (
                        <span className="text-xs bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Viewing different stage hint */}
          {isViewingDifferentStage && (
            <p className="text-xs text-amber-400/80 mt-2 text-center">
              Viewing {selectedStage} assignments • 
              <button 
                onClick={() => setSelectedStage(currentStage)}
                className="underline hover:text-amber-300 ml-1"
              >
                Back to {currentStage}
              </button>
            </p>
          )}
        </div>

        {/* Stage Progress */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">{selectedStage} Progress</span>
            <span className="text-sm font-bold text-indigo-400">{stageProgress}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${stageProgress}%` }}
            />
          </div>
        </div>

        {/* Assignments List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
              Assignments
            </h4>
            <div className="space-y-2">
              {stageDeliverables.map((del) => {
                const isComplete = isDeliverableComplete(selectedStage, del.type);
                return (
                  <button
                    key={del.type}
                    onClick={() => handleOpenAssignment(selectedStage, del)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left group
                      ${isComplete 
                        ? 'bg-emerald-500/10 border border-emerald-500/30' 
                        : 'bg-slate-800/50 border border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800'
                      }
                    `}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5 group-hover:text-indigo-400" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h5 className={`font-medium text-sm ${isComplete ? 'text-emerald-300' : 'text-white'}`}>
                        {del.label}
                      </h5>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{del.description}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-1 transition-transform
                      ${isComplete ? 'text-emerald-500' : 'text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5'}
                    `} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Editor Modal */}
      <AssignmentEditorModal
        isOpen={editorOpen}
        onClose={handleCloseEditor}
        stageName={selectedDeliverable?.stageName}
        deliverable={selectedDeliverable?.deliverable}
      />

      {/* Unlock Requirements Toast */}
      <UnlockToast
        isOpen={showUnlockToast}
        onClose={() => setShowUnlockToast(false)}
        lockedStage={lockedStageInfo.locked}
        requiredStage={lockedStageInfo.required}
        stageInfo={lockedStageInfo.info}
        onNavigate={handleNavigateToStage}
      />
    </>
  );
};

export default ProjectWorkspace;
