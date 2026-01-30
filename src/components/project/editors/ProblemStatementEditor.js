import React from 'react';
import { Target, Users, Lightbulb } from 'lucide-react';

/**
 * ProblemStatementEditor - For defining POV and HMW statements
 */
const ProblemStatementEditor = ({ content, onChange, projectTitle }) => {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
        <h3 className="font-medium text-purple-300 mb-1">🎯 Problem Statement Guide</h3>
        <p className="text-sm text-slate-300">
          Based on your research for <strong>{projectTitle}</strong>, define your user persona 
          and craft clear POV & HMW statements.
        </p>
      </div>

      {/* User Persona */}
      <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          <h4 className="font-semibold text-white">User Persona</h4>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Persona Name</label>
            <input
              type="text"
              value={content.personaName || ''}
              onChange={(e) => onChange({ ...content, personaName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
              placeholder="e.g., Frustrated Freshman"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Demographics</label>
            <input
              type="text"
              value={content.demographics || ''}
              onChange={(e) => onChange({ ...content, demographics: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
              placeholder="e.g., 18-22, new to campus"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Goals & Motivations</label>
          <textarea
            value={content.goals || ''}
            onChange={(e) => onChange({ ...content, goals: e.target.value })}
            className="w-full h-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none resize-none"
            placeholder="What are they trying to achieve?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Pain Points & Frustrations</label>
          <textarea
            value={content.painPoints || ''}
            onChange={(e) => onChange({ ...content, painPoints: e.target.value })}
            className="w-full h-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none resize-none"
            placeholder="What frustrates them? What problems do they face?"
          />
        </div>
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
