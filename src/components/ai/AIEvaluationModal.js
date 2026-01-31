import React, { useEffect, useState, useCallback } from 'react';
import { X, Loader2, Sparkles, CheckCircle, Lightbulb, Target, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { evaluateAssignment } from '../../services/aiService';

/**
 * AI Evaluation Modal
 * 
 * Shows constructive feedback after a student submits an assignment.
 * Focuses on strengths, growth opportunities, and next steps.
 */
const AIEvaluationModal = ({ 
  isOpen, 
  onClose, 
  project, 
  stageName, 
  deliverableType, 
  content,
  deliverables 
}) => {
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvaluation = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await evaluateAssignment(
        project,
        stageName,
        deliverableType,
        content,
        deliverables
      );
      setEvaluation(result);
    } catch (err) {
      console.error('Evaluation error:', err);
      setError('Unable to generate feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [project, stageName, deliverableType, content, deliverables]);

  // Fetch evaluation when modal opens
  useEffect(() => {
    if (isOpen && project && content) {
      fetchEvaluation();
    }
  }, [isOpen, project, content, fetchEvaluation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex-none px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">AI Feedback</h2>
                <p className="text-xs text-gray-500">
                  {formatDeliverableType(deliverableType)} • {stageName} Stage
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4 animate-pulse">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
              <p className="text-gray-600 font-medium">Reviewing your work...</p>
              <p className="text-sm text-gray-400 mt-1">This usually takes a few seconds</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-gray-600 font-medium">{error}</p>
              <button
                onClick={fetchEvaluation}
                className="mt-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          ) : evaluation ? (
            <div className="space-y-6">
              {/* Intro */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                <p className="text-sm text-gray-700">
                  Great work submitting your <strong>{formatDeliverableType(deliverableType)}</strong>! 
                  Here's some feedback to help you grow:
                </p>
              </div>

              {/* Parsed Sections or Raw */}
              {evaluation.parsed.strengths || evaluation.parsed.suggestions || evaluation.parsed.nextSteps ? (
                <>
                  {/* Strengths */}
                  {evaluation.parsed.strengths && (
                    <FeedbackSection 
                      icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
                      title="What's Working Well"
                      content={evaluation.parsed.strengths}
                      bgColor="bg-emerald-50"
                      borderColor="border-emerald-100"
                      iconBg="bg-emerald-100"
                    />
                  )}

                  {/* Suggestions */}
                  {evaluation.parsed.suggestions && (
                    <FeedbackSection 
                      icon={<Lightbulb className="w-5 h-5 text-amber-600" />}
                      title="Opportunities to Explore"
                      content={evaluation.parsed.suggestions}
                      bgColor="bg-amber-50"
                      borderColor="border-amber-100"
                      iconBg="bg-amber-100"
                    />
                  )}

                  {/* Next Steps */}
                  {evaluation.parsed.nextSteps && (
                    <FeedbackSection 
                      icon={<Target className="w-5 h-5 text-indigo-600" />}
                      title="Suggested Next Steps"
                      content={evaluation.parsed.nextSteps}
                      bgColor="bg-indigo-50"
                      borderColor="border-indigo-100"
                      iconBg="bg-indigo-100"
                    />
                  )}
                </>
              ) : (
                /* Fallback: Raw response */
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{evaluation.raw}</ReactMarkdown>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Got it, thanks!
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">
            Remember: This is guidance, not a grade. Keep iterating!
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Feedback Section Component
 */
const FeedbackSection = ({ icon, title, content, bgColor, borderColor, iconBg }) => {
  // Clean up the content - remove the section header if present
  const cleanedContent = content
    .replace(/^##?\s*[✨💡🎯]?\s*(What's Working|Opportunities|Suggested|Strengths|Growth|Next Steps)[^\n]*\n?/i, '')
    .trim();

  return (
    <div className={`rounded-xl p-4 ${bgColor} border ${borderColor}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center`}>
          {icon}
        </div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="prose prose-sm max-w-none text-gray-700 pl-10">
        <ReactMarkdown
          components={{
            ul: ({ children }) => <ul className="list-disc list-inside space-y-1">{children}</ul>,
            li: ({ children }) => <li>{children}</li>,
            p: ({ children }) => <p className="mb-2">{children}</p>,
          }}
        >
          {cleanedContent}
        </ReactMarkdown>
      </div>
    </div>
  );
};

/**
 * Format deliverable type to human-readable label
 */
const formatDeliverableType = (type) => {
  const labels = {
    'interview_notes': 'Interview Notes',
    'pov': 'Point of View Statement',
    'hmw': 'How Might We Statement',
    'brainstorm': 'Brainstorm Ideas',
    'prototype_description': 'Prototype Description',
    'test_feedback': 'Test Feedback',
  };
  return labels[type] || type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export default AIEvaluationModal;
