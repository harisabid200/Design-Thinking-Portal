import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import AIEvaluationModal from '../ai/AIEvaluationModal';

// Import specific editors
import InterviewNotesEditor from './editors/InterviewNotesEditor';
import ProblemStatementEditor from './editors/ProblemStatementEditor';
import BrainstormEditor from './editors/BrainstormEditor';
import PrototypeEditor from './editors/PrototypeEditor';
import FeedbackEditor from './editors/FeedbackEditor';

/**
 * AssignmentEditorModal - Modal for editing stage deliverables
 * Now includes AI evaluation after successful submission
 */
const AssignmentEditorModal = ({ isOpen, onClose, stageName, deliverable }) => {
  const { getDeliverable, saveDeliverable, project, deliverables } = useProject();
  const [content, setContent] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // AI Evaluation Modal state
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [savedContent, setSavedContent] = useState(null);

  // Load existing content when modal opens
  useEffect(() => {
    if (isOpen && deliverable) {
      const existing = getDeliverable(stageName, deliverable.type);
      setContent(existing?.content || {});
      setSaved(false);
      setShowEvaluation(false);
    }
  }, [isOpen, stageName, deliverable, getDeliverable]);

  if (!isOpen || !deliverable) return null;

  const handleSave = async () => {
    if (!project) return;
    
    setSaving(true);
    try {
      await saveDeliverable(stageName, deliverable.type, content);
      setSaved(true);
      setSavedContent(content);
      
      // Show AI evaluation modal after successful save
      setTimeout(() => {
        setShowEvaluation(true);
      }, 500);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseEvaluation = () => {
    setShowEvaluation(false);
    onClose(); // Close the assignment modal after viewing feedback
  };

  const renderEditor = () => {
    switch (deliverable.type) {
      case 'interview_notes':
        return <InterviewNotesEditor content={content} onChange={setContent} projectTitle={project?.title} />;
      case 'problem_statement':
        return <ProblemStatementEditor content={content} onChange={setContent} projectTitle={project?.title} />;
      case 'brainstorm':
      case 'top_ideas':
        return <BrainstormEditor content={content} onChange={setContent} projectTitle={project?.title} isTopIdeas={deliverable.type === 'top_ideas'} />;
      case 'prototype_description':
      case 'wireframes':
        return <PrototypeEditor content={content} onChange={setContent} projectTitle={project?.title} isWireframes={deliverable.type === 'wireframes'} />;
      case 'test_feedback':
      case 'iterations':
        return <FeedbackEditor content={content} onChange={setContent} projectTitle={project?.title} isIterations={deliverable.type === 'iterations'} />;
      default:
        return <GenericEditor content={content} onChange={setContent} />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-700 shadow-2xl flex flex-col animate-scaleIn">
          {/* Header */}
          <div className="p-5 border-b border-slate-700 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{deliverable.label}</h2>
                <p className="text-slate-300 text-sm mt-1">{stageName} Stage • {project?.title}</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {renderEditor()}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex items-center justify-between flex-shrink-0">
            <p className="text-sm text-slate-400">
              {saved ? '✓ Saved! Getting AI feedback...' : 'Submit to get AI feedback'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    ✓ Saved
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save & Get Feedback
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Evaluation Modal */}
      <AIEvaluationModal
        isOpen={showEvaluation}
        onClose={handleCloseEvaluation}
        project={project}
        stageName={stageName}
        deliverableType={deliverable?.type}
        content={savedContent}
        deliverables={deliverables}
      />
    </>
  );
};

// Generic fallback editor
const GenericEditor = ({ content, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-slate-300 mb-2">Content</label>
    <textarea
      value={content.text || ''}
      onChange={(e) => onChange({ ...content, text: e.target.value })}
      className="w-full h-48 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none resize-none"
      placeholder="Enter your content..."
    />
  </div>
);

export default AssignmentEditorModal;

