import React, { useState } from 'react';
import StageLayout from '../components/StageLayout';
import { generateContent } from '../lib/gemini';
import { useProgress } from '../context/ProgressContext';
import { MessageSquare, CheckCircle } from 'lucide-react';

const EmpathiseTool = ({ isCompleted, onComplete }) => {
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateQuestions = async () => {
    if (!topic) return alert("Please enter a topic first.");
    setLoading(true);
    try {
      const prompt = `
        I am a design thinking student working on the "Empathise" phase.
        My project topic is: "${topic}".
        My initial notes/observations are: "${notes}".
        
        Please generate 5-7 insightful interview questions.
        Format the output as a simple list.
      `;
      const response = await generateContent(prompt);
      setGeneratedQuestions(response);
    } catch (error) {
      alert("Failed to generate: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-white overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-indigo-600" />
            Interview Generator
        </h2>
        <p className="text-xs text-gray-600 mb-6">
            Enter your topic and initial observations to get AI-suggested interview questions.
        </p>

        <div className="space-y-4 mb-8">
            <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">PROJECT TOPIC</label>
            <input
                type="text"
                className="w-full text-sm rounded bg-gray-50 border-gray-300 p-2"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isCompleted}
            />
            </div>
            
            <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">INITIAL NOTES</label>
            <textarea
                className="w-full text-sm rounded bg-gray-50 border-gray-300 p-2 h-24 resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isCompleted}
            />
            </div>

            <button
            onClick={handleGenerateQuestions}
            disabled={loading || !topic || isCompleted}
            className="w-full py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
            >
            {loading ? 'Generating...' : 'Generate Questions'}
            </button>
        </div>

        {generatedQuestions && (
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100 mb-6">
                 <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wide mb-2">Suggestions</h3>
                 <div className="prose prose-sm text-indigo-900 text-xs">
                     {generatedQuestions}
                 </div>
            </div>
        )}

        <div className="mt-auto pt-6 border-t border-gray-100">
            {isCompleted ? (
                <div className="flex items-center justify-center text-green-600 font-bold text-sm bg-green-50 py-2 rounded">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Stage Completed
                </div>
            ) : (
                <button
                onClick={onComplete}
                className="w-full py-3 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm"
                >
                Mark Stage as Done
                </button>
            )}
        </div>
    </div>
  );
};

// Main Page Component
const Empathise = () => {
    const { updateStageStatus, stages } = useProgress();
    const isCompleted = stages['Empathise'] === 'completed';

    const handleComplete = async () => {
        await updateStageStatus('Empathise', 'completed');
    };

    return (
        <StageLayout 
            stageName="Empathise"
            activeToolComponent={
                <EmpathiseTool isCompleted={isCompleted} onComplete={handleComplete} />
            }
        />
    );
};

export default Empathise;
