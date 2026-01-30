import React from 'react';
import { Box, Image, Upload } from 'lucide-react';

/**
 * PrototypeEditor - For describing and uploading prototype concepts
 */
const PrototypeEditor = ({ content, onChange, projectTitle, isWireframes }) => {
  if (isWireframes) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-cyan-900/30 rounded-lg border border-cyan-500/30">
          <h3 className="font-medium text-cyan-300 mb-1">🎨 Wireframes & Sketches</h3>
          <p className="text-sm text-slate-300">
            Upload images or describe your visual designs for <strong>{projectTitle}</strong>.
          </p>
        </div>

        <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-4">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-cyan-400" />
            <h4 className="font-semibold text-white">Visual Representations</h4>
          </div>

          <div className="p-8 border-2 border-dashed border-slate-600 rounded-xl text-center">
            <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400 mb-2">Image upload coming soon</p>
            <p className="text-sm text-slate-500">For now, describe your wireframes below</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Wireframe Descriptions</label>
            <textarea
              value={content.wireframeDescription || ''}
              onChange={(e) => onChange({ ...content, wireframeDescription: e.target.value })}
              className="w-full h-40 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none resize-none"
              placeholder="Describe your wireframes/sketches:
- Screen 1: Home page with navigation menu...
- Screen 2: Search results showing...
- Screen 3: Detail view with..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">External Links (Figma, Canva, etc.)</label>
            <input
              type="url"
              value={content.externalLinks || ''}
              onChange={(e) => onChange({ ...content, externalLinks: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
              placeholder="https://figma.com/file/..."
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-orange-900/30 rounded-lg border border-orange-500/30">
        <h3 className="font-medium text-orange-300 mb-1">🛠️ Prototype Description</h3>
        <p className="text-sm text-slate-300">
          Describe your prototype concept for <strong>{projectTitle}</strong>.
        </p>
      </div>

      <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 space-y-4">
        <div className="flex items-center gap-2">
          <Box className="w-5 h-5 text-orange-400" />
          <h4 className="font-semibold text-white">Prototype Concept</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">What are you building?</label>
          <input
            type="text"
            value={content.prototypeType || ''}
            onChange={(e) => onChange({ ...content, prototypeType: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none"
            placeholder="e.g., Mobile app, Website, Physical product, Paper prototype"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Core Features</label>
          <textarea
            value={content.coreFeatures || ''}
            onChange={(e) => onChange({ ...content, coreFeatures: e.target.value })}
            className="w-full h-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none resize-none"
            placeholder="List the main features of your prototype:
1. Interactive campus map
2. Real-time navigation
3. ..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">User Flow</label>
          <textarea
            value={content.userFlow || ''}
            onChange={(e) => onChange({ ...content, userFlow: e.target.value })}
            className="w-full h-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none resize-none"
            placeholder="Describe the main user journey:
1. User opens app → 2. Enters destination → 3. ..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Why this approach?</label>
          <textarea
            value={content.justification || ''}
            onChange={(e) => onChange({ ...content, justification: e.target.value })}
            className="w-full h-16 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none resize-none"
            placeholder="Explain why this prototype addresses the user's needs..."
          />
        </div>
      </div>
    </div>
  );
};

export default PrototypeEditor;
