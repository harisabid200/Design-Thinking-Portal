import React, { useState } from 'react';
import { useProject, STAGE_DELIVERABLES } from '../../context/ProjectContext';
import { useProgress } from '../../context/ProgressContext';
import AssignmentEditorModal from './AssignmentEditorModal';
import { 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  FileText,
  Sparkles,
  MessageSquare,
  ChevronDown
} from 'lucide-react';

const ProjectWorkspace = ({ currentStage }) => {
  const { 
    project, 
    isDeliverableComplete, 
    getStageProgress,
    setShowProjectModal 
  } = useProject();
  const { refreshProgress } = useProgress();
  
  const [showAIChat, setShowAIChat] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);

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

  const stageDeliverables = STAGE_DELIVERABLES[currentStage] || [];
  const stageProgress = getStageProgress(currentStage);

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

        {/* Stage Progress */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">{currentStage} Progress</span>
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
                const isComplete = isDeliverableComplete(currentStage, del.type);
                return (
                  <button
                    key={del.type}
                    onClick={() => handleOpenAssignment(currentStage, del)}
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

        {/* AI Assistant Section */}
        <div className="border-t border-slate-700">
          <button
            onClick={() => setShowAIChat(!showAIChat)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">AI Assistant</h4>
                <p className="text-xs text-slate-400">Get contextual help</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showAIChat ? 'rotate-180' : ''}`} />
          </button>

          {showAIChat && (
            <div className="p-4 pt-0">
              <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                <div className="flex items-start gap-2 text-sm text-slate-300 mb-3">
                  <MessageSquare className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <p>Ask me about your project, this stage, or how to complete assignments...</p>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type your question..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  AI integration coming soon
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Editor Modal */}
      <AssignmentEditorModal
        isOpen={editorOpen}
        onClose={handleCloseEditor}
        stageName={selectedDeliverable?.stageName}
        deliverable={selectedDeliverable?.deliverable}
      />
    </>
  );
};

export default ProjectWorkspace;
