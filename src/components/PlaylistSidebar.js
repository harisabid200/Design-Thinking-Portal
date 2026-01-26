import React from 'react';
import { PlayCircle, CheckCircle, Lock } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

const PlaylistSidebar = ({ content = [], currentContentId, onSelectContent }) => {
  // Mock progress for now, eventually check video_progress table
  const isVideoCompleted = (id) => false; 

  return (
    <div className="bg-white border-l border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-900">Course Content</h3>
        <p className="text-xs text-gray-500 mt-1">{content.length} items</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {content.map((item, index) => {
           const isActive = item.id === currentContentId;
           return (
            <button
                key={item.id}
                onClick={() => onSelectContent(item)}
                className={`w-full flex items-start p-4 text-left transition-colors border-b border-gray-50 hover:bg-gray-50 ${
                    isActive ? 'bg-indigo-50 border-indigo-100' : ''
                }`}
            >
                <div className="mt-1 mr-3 flex-shrink-0">
                    {isVideoCompleted(item.id) ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                        <PlayCircle className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                    )}
                </div>
                <div>
                    <h4 className={`text-sm font-medium ${isActive ? 'text-indigo-900' : 'text-gray-700'}`}>
                        {index + 1}. {item.title}
                    </h4>
                    <span className="text-xs text-gray-400 mt-1 block">Video • {item.duration || '5 mins'}</span>
                </div>
            </button>
           );
        })}
      </div>
    </div>
  );
};

export default PlaylistSidebar;
