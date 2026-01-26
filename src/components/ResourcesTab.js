import React from 'react';
import { FileText, Link as LinkIcon, Download } from 'lucide-react';

const ResourcesTab = ({ resources = [] }) => {
  if (!resources || resources.length === 0) {
    return (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            No resources available for this section.
        </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-gray-900 mb-4">Resources</h3>
      {resources.map((res) => (
        <a 
            key={res.id}
            href={res.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all group"
        >
            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mr-4 group-hover:bg-indigo-100 group-hover:scale-110 transition-transform">
                {res.type === 'pdf' ? <FileText className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
            </div>
            <div>
                <h4 className="font-medium text-gray-900 group-hover:text-indigo-700">{res.title}</h4>
                <p className="text-sm text-gray-500">{res.description || 'Click to view resource'}</p>
            </div>
        </a>
      ))}
    </div>
  );
};

export default ResourcesTab;
