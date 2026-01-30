import React, { useState } from 'react';
import { generateContent } from '../lib/gemini';
import { MessageSquare } from 'lucide-react';

const DefineTool = () => {
  const [problemCtx, setProblemCtx] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Simple prompt for now
      const prompt = `Based on this context: "${problemCtx}", generate a concise Design Thinking Problem Statement (How Might We...).`;
      const result = await generateContent(prompt);
      setProblemStatement(result);
    } catch (err) {
      console.error(err);
      alert('Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
       <div className="mb-4">
           <h3 className="font-bold text-lg mb-2 flex items-center">
               <MessageSquare className="w-5 h-5 mr-2 text-indigo-600" />
               Problem Statement Generator
           </h3>
           <p className="text-xs text-gray-500">Draft a clear problem statement to guide your ideation.</p>
       </div>

       <div className="flex-1 flex flex-col space-y-4">
            <textarea 
                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none flex-1"
                placeholder="Describe the user and their need (e.g. 'Busy parents need a way to... because...')"
                value={problemCtx}
                onChange={(e) => setProblemCtx(e.target.value)}
            />
            
            <button
                onClick={handleGenerate}
                disabled={loading || !problemCtx}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
                {loading ? 'Generating...' : 'Generate HMW Statement'}
            </button>

            {problemStatement && (
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 mt-2">
                    <h4 className="text-xs font-bold text-indigo-900 mb-1 uppercase">Generated Statement</h4>
                    <p className="text-sm text-indigo-800 leading-relaxed">
                        {problemStatement}
                    </p>
                </div>
            )}
       </div>
    </div>
  );
};

export default DefineTool;
