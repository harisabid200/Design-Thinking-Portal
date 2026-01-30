import React from 'react';
import { Zap, Star, Plus, Trash2 } from 'lucide-react';

/**
 * BrainstormEditor - For brainstorming ideas and selecting top picks
 */
const BrainstormEditor = ({ content, onChange, projectTitle, isTopIdeas }) => {
  const ideas = content.ideas || [''];
  const topIdeas = content.topIdeas || [{ idea: '', justification: '' }];

  const updateIdea = (index, value) => {
    const updated = [...ideas];
    updated[index] = value;
    onChange({ ...content, ideas: updated });
  };

  const addIdea = () => {
    onChange({ ...content, ideas: [...ideas, ''] });
  };

  const removeIdea = (index) => {
    if (ideas.length > 1) {
      onChange({ ...content, ideas: ideas.filter((_, i) => i !== index) });
    }
  };

  const updateTopIdea = (index, field, value) => {
    const updated = [...topIdeas];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...content, topIdeas: updated });
  };

  if (isTopIdeas) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-amber-900/30 rounded-lg border border-amber-500/30">
          <h3 className="font-medium text-amber-300 mb-1">⭐ Top Ideas Selection</h3>
          <p className="text-sm text-slate-300">
            Select and justify your top 3 ideas for <strong>{projectTitle}</strong>.
          </p>
        </div>

        {[0, 1, 2].map((index) => (
          <div key={index} className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" fill={topIdeas[index]?.idea ? '#f59e0b' : 'none'} />
              <h4 className="font-semibold text-white">Top Idea #{index + 1}</h4>
            </div>
            
            <input
              type="text"
              value={topIdeas[index]?.idea || ''}
              onChange={(e) => updateTopIdea(index, 'idea', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
              placeholder="Describe your idea..."
            />
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Why this idea?</label>
              <textarea
                value={topIdeas[index]?.justification || ''}
                onChange={(e) => updateTopIdea(index, 'justification', e.target.value)}
                className="w-full h-16 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none resize-none"
                placeholder="Justify why this is a promising solution..."
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-emerald-900/30 rounded-lg border border-emerald-500/30">
        <h3 className="font-medium text-emerald-300 mb-1">💡 Brainstorm Ideas</h3>
        <p className="text-sm text-slate-300">
          Generate as many ideas as possible for <strong>{projectTitle}</strong>. 
          No idea is too crazy at this stage - quantity over quality!
        </p>
      </div>

      <div className="space-y-3">
        {ideas.map((idea, index) => (
          <div key={index} className="flex gap-2">
            <div className="flex items-center justify-center w-8 h-10 bg-slate-800 rounded-lg text-slate-500 text-sm font-medium">
              {index + 1}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={idea}
                onChange={(e) => updateIdea(index, e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                placeholder="Enter an idea..."
              />
              {ideas.length > 1 && (
                <button 
                  onClick={() => removeIdea(index)}
                  className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addIdea}
        className="w-full py-3 border-2 border-dashed border-slate-600 hover:border-emerald-500 rounded-xl text-slate-400 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add Another Idea
      </button>

      <div className="p-3 bg-slate-800/50 rounded-lg text-center">
        <Zap className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
        <p className="text-sm text-slate-400">
          <strong className="text-white">{ideas.filter(i => i.trim()).length}</strong> ideas generated
        </p>
      </div>
    </div>
  );
};

export default BrainstormEditor;
