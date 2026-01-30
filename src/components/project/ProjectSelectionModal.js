import React from 'react';
import { useProject, PROJECT_TEMPLATES } from '../../context/ProjectContext';
import { X, ArrowRight, Sparkles } from 'lucide-react';

const ProjectSelectionModal = ({ isOpen, onClose }) => {
  const { createProject } = useProject();
  const [selectedTemplate, setSelectedTemplate] = React.useState(null);
  const [isCreating, setIsCreating] = React.useState(false);

  if (!isOpen) return null;

  const handleSelectTemplate = async (template) => {
    setSelectedTemplate(template.id);
    setIsCreating(true);
    try {
      await createProject(template);
      onClose();
    } catch (error) {
      alert('Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-slate-700 shadow-2xl animate-scaleIn">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-indigo-900/50 to-purple-900/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Start Your Project</h2>
              <p className="text-slate-300 mt-1">Choose a Design Thinking project to work through all 5 stages</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROJECT_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                disabled={isCreating}
                className={`text-left p-5 rounded-xl border-2 transition-all duration-200 group
                  ${selectedTemplate === template.id 
                    ? 'border-indigo-500 bg-indigo-500/20' 
                    : 'border-slate-700 hover:border-indigo-500/50 bg-slate-800/50 hover:bg-slate-800'
                  }
                  ${isCreating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{template.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg group-hover:text-indigo-300 transition-colors">
                      {template.title}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">{template.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded-full">
                        👥 {template.targetUsers}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className={`w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-all
                    ${selectedTemplate === template.id ? 'translate-x-1' : 'group-hover:translate-x-1'}
                  `} />
                </div>
              </button>
            ))}
          </div>

          {/* Coming Soon: Custom & AI */}
          <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700 border-dashed">
            <div className="flex items-center gap-3 text-slate-400">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="font-medium text-slate-300">Coming Soon</p>
                <p className="text-sm">Define your own problem or get AI-suggested projects</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <p className="text-center text-slate-400 text-sm">
            Your project will guide you through Empathise → Define → Ideate → Prototype → Test
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectSelectionModal;
