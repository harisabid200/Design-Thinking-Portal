import React, { useState } from 'react';
import { ChevronDown, FileText, Link as LinkIcon, Square, CheckSquare } from 'lucide-react';

// completedIds is a Set or Object of IDs that are completed
const PlaylistSidebar = ({ content = [], resources = [], currentContentId, onSelectContent, completedIds = {}, onToggleComplete }) => {
  const [expanded, setExpanded] = useState({}); // Track expanded resource sections

  const toggleExpanded = (id, e) => {
    e.stopPropagation();
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // toggleCompleted removed, uses parent prop onToggleComplete instead

  return (
    <div className="bg-white border-l border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-900">Course Content</h3>
        <p className="text-xs text-gray-500 mt-1">{content.length} lectures</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {content.map((item, index) => {
           const isActive = item.id === currentContentId;
           const itemResources = resources.filter(r => r.parent_id === item.id);
           const hasResources = itemResources.length > 0;
           const isExpanded = expanded[item.id];
           // Use prop, default to false if undefined
           const isDone = !!completedIds[item.id]; 

           return (
            <div key={item.id} className={`border-b border-gray-50 transition-colors ${isActive ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                {/* Video Row */}
                <div 
                    className={`flex items-start p-4 cursor-pointer relative ${isActive ? 'bg-indigo-50' : ''}`}
                    onClick={() => onSelectContent(item)}
                >
                    {/* Checkbox */}
                    <button 
                        className="mt-1 mr-3 text-gray-400 hover:text-indigo-600 focus:outline-none"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onToggleComplete) onToggleComplete(item.id, !isDone);
                        }}
                    >
                        {isDone ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}
                    </button>

                    <div className="flex-1">
                        <h4 className={`text-sm font-medium ${isActive ? 'text-indigo-900' : 'text-gray-700'}`}>
                            {index + 1}. {item.title}
                        </h4>
                        <div className="flex items-center justify-between mt-1 relative">
                            <span className="text-xs text-gray-400">Video • {item.duration || '5m'}</span>
                            
                            {/* Resources Toggle */}
                            {hasResources && (
                                <div className="relative">
                                    <button 
                                        onClick={(e) => toggleExpanded(item.id, e)}
                                        className="flex items-center text-xs text-indigo-600 font-medium hover:text-indigo-800 border border-indigo-200 rounded px-2 py-0.5 bg-white"
                                    >
                                        <FileText className="w-3 h-3 mr-1" />
                                        Resources
                                        <ChevronDown className={`w-3 h-3 ml-1 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Resources Dropdown Popover */}
                                    {isExpanded && (
                                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1">
                                            {itemResources.map(res => (
                                                <a 
                                                    key={res.id}
                                                    href={res.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center px-4 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {res.type === 'pdf' ? <FileText className="w-3 h-3 mr-2" /> : <LinkIcon className="w-3 h-3 mr-2" />}
                                                    <span className="truncate">{res.title}</span>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
           );
        })}
      </div>
    </div>
  );
};

export default PlaylistSidebar;
