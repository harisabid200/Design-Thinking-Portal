import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trophy, Star, Share2, MoreVertical } from 'lucide-react';

const CourseHeader = ({ title, progress = 0 }) => {
  const navigate = useNavigate();

  return (
    <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50">
      {/* Left: Back & Title */}
      <div className="flex items-center text-white">
        <button 
           onClick={() => navigate('/dashboard')}
           className="mr-4 p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
           title="Back to Dashboard"
        >
            <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
            <h1 className="text-sm font-bold text-gray-100">{title}</h1>
            <span className="text-xs text-gray-400">Design Thinking Portal</span>
        </div>
      </div>

      {/* Right: Actions & Progress */}
      <div className="flex items-center space-x-4">
        {/* Progress Display */}
        <div className="hidden md:flex items-center space-x-2 mr-4">
             <Trophy className="w-4 h-4 text-indigo-400" />
             <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-white">Your Progress</span>
                <span className="text-xs text-gray-400">{progress}% completed</span>
             </div>
        </div>

        <button className="flex items-center px-3 py-1 text-sm font-medium text-white border border-gray-600 rounded hover:bg-gray-800">
            <Star className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Leave a rating</span>
        </button>

        <button className="flex items-center px-3 py-1 text-sm font-medium text-white border border-gray-600 rounded hover:bg-gray-800">
            <Share2 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Share</span>
        </button>

        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
            <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CourseHeader;
