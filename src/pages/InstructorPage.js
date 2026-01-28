import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InstructorPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    stage_name: 'Empathise',
    type: 'video',
    title: '',
    url: '',
    description: '',
    sequence_order: 0,
    parent_id: null
  });
  const [stageVideos, setStageVideos] = useState([]); // Store videos for parent selection

  const fetchStageVideos = React.useCallback(async () => {
    const { data } = await supabase
        .from('stage_content')
        .select('id, title')
        .eq('stage_name', formData.stage_name)
        .eq('type', 'video');
    if (data) setStageVideos(data);
  }, [formData.stage_name]);

  // Fetch videos whenever stage changes
  React.useEffect(() => {
    fetchStageVideos();
  }, [fetchStageVideos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // If we are adding a video, it can't have a parent.
      // If adding a resource, it CAN have a parent.
      const payload = { ...formData };
      if (payload.type === 'video') {
         payload.parent_id = null;
      }
      // If parent_id is empty string, make it null
      if (payload.parent_id === '') payload.parent_id = null;

      const { error } = await supabase
        .from('stage_content')
        .insert([payload]);

      if (error) throw error;
      alert('Content added successfully!');
      setFormData({ ...formData, title: '', url: '', description: '', parent_id: null });
      // Refresh videos list if we just added a video
      if (payload.type === 'video') fetchStageVideos();
    } catch (error) {
      alert('Error adding content: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Instructor Content Manager</h1>
            <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 hover:text-indigo-600"
            >
                <LayoutDashboard className="w-5 h-5 mr-2" />
                Back to Dashboard
            </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Stage</label>
              <select
                className="w-full rounded-lg border-gray-300 shadow-sm p-2 border"
                value={formData.stage_name}
                onChange={e => setFormData({...formData, stage_name: e.target.value})}
              >
                {['Empathise', 'Define', 'Ideate', 'Prototype', 'Test'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                <select
                    className="w-full rounded-lg border-gray-300 shadow-sm p-2 border"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                >
                    <option value="video">Video</option>
                    <option value="pdf">PDF Resource</option>
                    <option value="link">External Link</option>
                </select>
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sequence Order</label>
                <input
                    type="number"
                    className="w-full rounded-lg border-gray-300 shadow-sm p-2 border"
                    value={formData.sequence_order}
                    onChange={e => setFormData({...formData, sequence_order: parseInt(e.target.value)})}
                />
                </div>
            </div>

            {/* Parent Video Selection (Only if not a video) */}
            {formData.type !== 'video' && (
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Parent Video (Optional: Link this resource to a video)</label>
                   <select
                        className="w-full rounded-lg border-gray-300 shadow-sm p-2 border"
                        value={formData.parent_id || ''}
                        onChange={e => setFormData({...formData, parent_id: e.target.value === '' ? null : e.target.value})}
                    >
                        <option value="">-- No Parent (Standalone) --</option>
                        {stageVideos.map(v => (
                            <option key={v.id} value={v.id}>{v.title}</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">If selected, this resource will appear nested under the video in the course playlist.</p>
                </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                required
                className="w-full rounded-lg border-gray-300 shadow-sm p-2 border"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                type="url"
                required
                placeholder="https://..."
                className="w-full rounded-lg border-gray-300 shadow-sm p-2 border"
                value={formData.url}
                onChange={e => setFormData({...formData, url: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                className="w-full rounded-lg border-gray-300 shadow-sm p-2 border h-24"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 font-bold"
            >
              {loading ? 'Saving...' : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Add Content
                  </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InstructorPage;
