import React from 'react';
import { MessageSquare, Plus, Trash2, User } from 'lucide-react';

/**
 * InterviewNotesEditor - For documenting user interviews
 * Allows adding multiple interview entries
 */
const InterviewNotesEditor = ({ content, onChange, projectTitle }) => {
  const interviews = content.interviews || [{ name: '', role: '', notes: '', quotes: '' }];

  const updateInterview = (index, field, value) => {
    const updated = [...interviews];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...content, interviews: updated });
  };

  const addInterview = () => {
    onChange({ 
      ...content, 
      interviews: [...interviews, { name: '', role: '', notes: '', quotes: '' }] 
    });
  };

  const removeInterview = (index) => {
    if (interviews.length > 1) {
      onChange({ 
        ...content, 
        interviews: interviews.filter((_, i) => i !== index) 
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-indigo-900/30 rounded-lg border border-indigo-500/30">
        <h3 className="font-medium text-indigo-300 mb-1">📋 Interview Notes Guide</h3>
        <p className="text-sm text-slate-300">
          Document your user interviews for <strong>{projectTitle}</strong>. 
          Record key insights, quotes, and observations from each person you interview.
        </p>
      </div>

      {interviews.map((interview, index) => (
        <div key={index} className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              <h4 className="font-semibold text-white">Interview #{index + 1}</h4>
            </div>
            {interviews.length > 1 && (
              <button 
                onClick={() => removeInterview(index)}
                className="p-1.5 text-red-400 hover:bg-red-400/20 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Name (or pseudonym)</label>
              <input
                type="text"
                value={interview.name}
                onChange={(e) => updateInterview(index, 'name', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                placeholder="e.g., Student A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Role/Background</label>
              <input
                type="text"
                value={interview.role}
                onChange={(e) => updateInterview(index, 'role', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                placeholder="e.g., Freshman, Computer Science"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Key Observations & Notes</label>
            <textarea
              value={interview.notes}
              onChange={(e) => updateInterview(index, 'notes', e.target.value)}
              className="w-full h-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none resize-none"
              placeholder="What did you learn? What problems did they mention? What are their current behaviors?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Memorable Quotes
            </label>
            <textarea
              value={interview.quotes}
              onChange={(e) => updateInterview(index, 'quotes', e.target.value)}
              className="w-full h-16 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none resize-none italic"
              placeholder='"I always get lost when trying to find the library..."'
            />
          </div>
        </div>
      ))}

      <button
        onClick={addInterview}
        className="w-full py-3 border-2 border-dashed border-slate-600 hover:border-indigo-500 rounded-xl text-slate-400 hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add Another Interview
      </button>
    </div>
  );
};

export default InterviewNotesEditor;
