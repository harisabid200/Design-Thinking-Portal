import React from 'react';
import { Target, Lightbulb } from 'lucide-react';

/**
 * ProblemStatementEditor - For defining POV and HMW statements only
 */
const ProblemStatementEditor = ({ content, onChange, projectTitle }) => {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-amber-900/30 rounded-lg border border-amber-500/30">
        <h3 className="font-medium text-amber-300 mb-1">🎯 Problem Statement Guide</h3>
        <p className="text-sm text-slate-300">
          Based on your research and user persona for <strong>{projectTitle}</strong>, 
          craft clear POV & HMW statements to frame your design challenge.
        </p>
      </div>

      {/* POV Statement */}
      <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-400" />
          <h4 className="font-semibold text-white">Point of View (POV) Statement</h4>
        </div>
        
        <p className="text-sm text-slate-400">
          Format: <span className="text-amber-300">[User]</span> needs <span className="text-amber-300">[need]</span> because <span className="text-amber-300">[insight]</span>
        </p>

        <textarea
          value={content.povStatement || ''}
          onChange={(e) => onChange({ ...content, povStatement: e.target.value })}
          className="w-full h-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none resize-none"
          placeholder="e.g., New students need a reliable way to navigate campus because they waste valuable time getting lost and feel embarrassed asking for directions."
        />
      </div>

      {/* HMW Statement */}
      <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <h4 className="font-semibold text-white">How Might We (HMW) Statements</h4>
        </div>
        
        <p className="text-sm text-slate-400">
          Reframe the problem as opportunities. Add 2-3 HMW questions.
        </p>

        <textarea
          value={content.hmwStatements || ''}
          onChange={(e) => onChange({ ...content, hmwStatements: e.target.value })}
          className="w-full h-32 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-yellow-500 focus:outline-none resize-none"
          placeholder="How might we make campus navigation intuitive for new students?
How might we help students discover shortcuts and hidden gems on campus?
How might we make asking for directions feel less awkward?"
        />
      </div>
    </div>
  );
};

export default ProblemStatementEditor;
