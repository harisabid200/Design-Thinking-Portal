import React from 'react';
import { MessageCircle, RefreshCw, ThumbsUp, ThumbsDown, Plus, Trash2 } from 'lucide-react';

/**
 * FeedbackEditor - For documenting test feedback and iterations
 */
const FeedbackEditor = ({ content, onChange, projectTitle, isIterations }) => {
  const feedbackItems = content.feedbackItems || [{ feedback: '', sentiment: 'neutral', action: '' }];
  const iterations = content.iterations || [{ change: '', reason: '', result: '' }];

  const updateFeedback = (index, field, value) => {
    const updated = [...feedbackItems];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...content, feedbackItems: updated });
  };

  const addFeedback = () => {
    onChange({ 
      ...content, 
      feedbackItems: [...feedbackItems, { feedback: '', sentiment: 'neutral', action: '' }] 
    });
  };

  const removeFeedback = (index) => {
    if (feedbackItems.length > 1) {
      onChange({ 
        ...content, 
        feedbackItems: feedbackItems.filter((_, i) => i !== index) 
      });
    }
  };

  const updateIteration = (index, field, value) => {
    const updated = [...iterations];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...content, iterations: updated });
  };

  const addIteration = () => {
    onChange({ 
      ...content, 
      iterations: [...iterations, { change: '', reason: '', result: '' }] 
    });
  };

  const removeIteration = (index) => {
    if (iterations.length > 1) {
      onChange({ 
        ...content, 
        iterations: iterations.filter((_, i) => i !== index) 
      });
    }
  };

  if (isIterations) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
          <h3 className="font-medium text-blue-300 mb-1">🔄 Iteration Notes</h3>
          <p className="text-sm text-slate-300">
            Document changes made to <strong>{projectTitle}</strong> based on feedback.
          </p>
        </div>

        {iterations.map((item, index) => (
          <div key={index} className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-400" />
                <h4 className="font-semibold text-white">Iteration #{index + 1}</h4>
              </div>
              {iterations.length > 1 && (
                <button 
                  onClick={() => removeIteration(index)}
                  className="p-1.5 text-red-400 hover:bg-red-400/20 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">What did you change?</label>
              <input
                type="text"
                value={item.change}
                onChange={(e) => updateIteration(index, 'change', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                placeholder="e.g., Added bigger buttons, simplified navigation..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Why this change?</label>
              <textarea
                value={item.reason}
                onChange={(e) => updateIteration(index, 'reason', e.target.value)}
                className="w-full h-16 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none resize-none"
                placeholder="Based on feedback that..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Result of the change</label>
              <textarea
                value={item.result}
                onChange={(e) => updateIteration(index, 'result', e.target.value)}
                className="w-full h-16 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none resize-none"
                placeholder="Users now find it easier to..."
              />
            </div>
          </div>
        ))}

        <button
          onClick={addIteration}
          className="w-full py-3 border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-xl text-slate-400 hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Another Iteration
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-pink-900/30 rounded-lg border border-pink-500/30">
        <h3 className="font-medium text-pink-300 mb-1">💬 Test Feedback</h3>
        <p className="text-sm text-slate-300">
          Document feedback received from testing <strong>{projectTitle}</strong>.
        </p>
      </div>

      {/* Summary */}
      <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-3">
        <h4 className="font-semibold text-white">Testing Summary</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Testers (Number)</label>
            <input
              type="number"
              value={content.testerCount || ''}
              onChange={(e) => onChange({ ...content, testerCount: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-pink-500 focus:outline-none"
              placeholder="e.g., 5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Testing Method</label>
            <input
              type="text"
              value={content.testingMethod || ''}
              onChange={(e) => onChange({ ...content, testingMethod: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-pink-500 focus:outline-none"
              placeholder="e.g., Usability testing, A/B test"
            />
          </div>
        </div>
      </div>

      {/* Individual Feedback Items */}
      {feedbackItems.map((item, index) => (
        <div key={index} className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-pink-400" />
              <h4 className="font-semibold text-white">Feedback #{index + 1}</h4>
            </div>
            {feedbackItems.length > 1 && (
              <button 
                onClick={() => removeFeedback(index)}
                className="p-1.5 text-red-400 hover:bg-red-400/20 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Feedback Received</label>
            <textarea
              value={item.feedback}
              onChange={(e) => updateFeedback(index, 'feedback', e.target.value)}
              className="w-full h-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-pink-500 focus:outline-none resize-none"
              placeholder="What did the tester say or observe?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Sentiment</label>
            <div className="flex gap-3">
              <button
                onClick={() => updateFeedback(index, 'sentiment', 'positive')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-colors ${
                  item.sentiment === 'positive' 
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                    : 'border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                Positive
              </button>
              <button
                onClick={() => updateFeedback(index, 'sentiment', 'neutral')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-colors ${
                  item.sentiment === 'neutral' 
                    ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' 
                    : 'border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
              >
                Neutral
              </button>
              <button
                onClick={() => updateFeedback(index, 'sentiment', 'negative')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-colors ${
                  item.sentiment === 'negative' 
                    ? 'bg-red-500/20 border-red-500 text-red-400' 
                    : 'border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                Negative
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Action to Take</label>
            <input
              type="text"
              value={item.action}
              onChange={(e) => updateFeedback(index, 'action', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-pink-500 focus:outline-none"
              placeholder="What will you do based on this feedback?"
            />
          </div>
        </div>
      ))}

      <button
        onClick={addFeedback}
        className="w-full py-3 border-2 border-dashed border-slate-600 hover:border-pink-500 rounded-xl text-slate-400 hover:text-pink-400 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add Another Feedback
      </button>
    </div>
  );
};

export default FeedbackEditor;
