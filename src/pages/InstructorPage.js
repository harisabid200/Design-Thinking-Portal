import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, Save, Trash2, Edit3, Plus, Video, FileText, Link as LinkIcon, X, ChevronDown, ChevronRight, Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const stages = ['Empathise', 'Define', 'Ideate', 'Prototype', 'Test'];

const InstructorPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [contentList, setContentList] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [expandedStages, setExpandedStages] = useState({ 'Empathise': true });
  
  const [formData, setFormData] = useState({
    stage_name: 'Empathise',
    type: 'video',
    title: '',
    url: '',
    description: '',
    parent_id: null
  });

  // Fetch all content organized by stage
  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stage_content')
        .select('*')
        .order('sequence_order', { ascending: true });

      if (error) throw error;

      // Group by stage_name
      const grouped = {};
      stages.forEach(s => grouped[s] = []);
      data?.forEach(item => {
        if (grouped[item.stage_name]) {
          grouped[item.stage_name].push(item);
        }
      });
      setContentList(grouped);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'link': return <LinkIcon className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Get type color
  const getTypeColor = (type) => {
    switch (type) {
      case 'video': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'pdf': return 'bg-red-100 text-red-700 border-red-200';
      case 'link': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Calculate next sequence order for a stage
  const getNextSequenceOrder = (stage) => {
    const stageContent = contentList[stage] || [];
    if (stageContent.length === 0) return 0;
    return Math.max(...stageContent.map(item => item.sequence_order || 0)) + 1;
  };

  // Handle form submission (add or edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      
      // Videos can't have a parent
      if (payload.type === 'video') payload.parent_id = null;
      if (payload.parent_id === '') payload.parent_id = null;
      
      // Auto-calculate sequence order for new items
      if (!editingItem) {
        payload.sequence_order = getNextSequenceOrder(payload.stage_name);
      }

      if (editingItem) {
        // Update existing (don't change sequence_order)
        const { error } = await supabase
          .from('stage_content')
          .update({
            stage_name: payload.stage_name,
            type: payload.type,
            title: payload.title,
            url: payload.url,
            description: payload.description,
            parent_id: payload.parent_id
          })
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('stage_content')
          .insert([payload]);
        if (error) throw error;
      }

      resetForm();
      fetchContent();
    } catch (error) {
      alert('Error saving content: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content? This will also unlink any attached resources.')) return;
    
    try {
      // First, unlink any resources attached to this item
      await supabase
        .from('stage_content')
        .update({ parent_id: null })
        .eq('parent_id', id);
      
      // Then delete the item
      const { error } = await supabase
        .from('stage_content')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchContent();
    } catch (error) {
      alert('Error deleting content: ' + error.message);
    }
  };

  // Edit item
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      stage_name: item.stage_name,
      type: item.type,
      title: item.title,
      url: item.url,
      description: item.description || '',
      parent_id: item.parent_id
    });
    setShowForm(true);
  };

  // Reset form
  const resetForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({
      stage_name: 'Empathise',
      type: 'video',
      title: '',
      url: '',
      description: '',
      parent_id: null
    });
  };

  // Open add form for a specific stage and type
  const openAddForm = (stage, type = 'video', parentId = null) => {
    setFormData({
      stage_name: stage,
      type: type,
      title: '',
      url: '',
      description: '',
      parent_id: parentId
    });
    setEditingItem(null);
    setShowForm(true);
  };

  // Toggle stage expansion
  const toggleStage = (stage) => {
    setExpandedStages(prev => ({ ...prev, [stage]: !prev[stage] }));
  };

  // Get videos for a stage (for parent selection)
  const getStageVideos = (stage) => {
    return contentList[stage]?.filter(item => item.type === 'video') || [];
  };

  // Get resources attached to a video
  const getVideoResources = (videoId, stage) => {
    return contentList[stage]?.filter(item => item.parent_id === videoId) || [];
  };

  // Get standalone resources (no parent video)
  const getStandaloneResources = (stage) => {
    return contentList[stage]?.filter(item => item.type !== 'video' && !item.parent_id) || [];
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Content Manager</h1>
              <p className="text-white/60 text-sm">Add videos and attach resources to them</p>
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {stages.map(stage => {
            const videos = getStageVideos(stage).length;
            const resources = (contentList[stage]?.length || 0) - videos;
            return (
              <div key={stage} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                <div className="text-white/60 text-sm font-medium">{stage}</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-white">{videos}</span>
                  <span className="text-white/40 text-sm">videos</span>
                </div>
                {resources > 0 && (
                  <div className="text-white/50 text-xs mt-1">{resources} resources attached</div>
                )}
              </div>
            );
          })}
        </div>

        {/* How It Works Card */}
        <div className="bg-indigo-500/20 backdrop-blur-lg rounded-xl p-4 border border-indigo-400/30 mb-6">
          <h3 className="text-white font-semibold mb-2">📚 How Content Organization Works</h3>
          <div className="text-white/70 text-sm space-y-1">
            <p>• <strong>Videos</strong> are the main content items that students watch.</p>
            <p>• <strong>Resources</strong> (PDFs, links) can be attached to a video - they'll appear nested under it in the course player.</p>
            <p>• Click the <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded"><Paperclip className="w-3 h-3" /> Attach Resource</span> button on any video to add materials to it.</p>
          </div>
        </div>

        {/* Content by Stage */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <h2 className="text-xl font-bold text-white">Course Content</h2>
          </div>

          {/* Stage Sections */}
          <div className="divide-y divide-white/10">
            {stages.map(stage => {
              const videos = getStageVideos(stage);
              const standaloneResources = getStandaloneResources(stage);
              
              return (
                <div key={stage}>
                  {/* Stage Header */}
                  <button
                    onClick={() => toggleStage(stage)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedStages[stage] ? (
                        <ChevronDown className="w-5 h-5 text-white/60" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-white/60" />
                      )}
                      <span className="text-lg font-semibold text-white">{stage}</span>
                      <span className="px-2 py-0.5 bg-purple-500/30 rounded-full text-xs text-purple-200">
                        {videos.length} videos
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); openAddForm(stage, 'video'); }}
                      className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Video
                    </button>
                  </button>

                  {/* Stage Content */}
                  {expandedStages[stage] && (
                    <div className="px-6 pb-6 space-y-3">
                      {videos.length === 0 && standaloneResources.length === 0 ? (
                        <div className="text-center py-8 text-white/40 border border-dashed border-white/20 rounded-xl">
                          <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No videos yet. Add your first video to get started.</p>
                        </div>
                      ) : (
                        <>
                          {/* Videos with their attached resources */}
                          {videos.map((video) => {
                            const resources = getVideoResources(video.id, stage);
                            return (
                              <div key={video.id} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                                {/* Video Item */}
                                <div className="p-4 flex items-center gap-4 group">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor('video')}`}>
                                    <Video className="w-5 h-5" />
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-white">{video.title}</div>
                                    <div className="text-sm text-white/40 truncate">{video.url}</div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    {/* Attach Resource Button */}
                                    <button
                                      onClick={() => openAddForm(stage, 'pdf', video.id)}
                                      className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm rounded-lg transition-colors flex items-center gap-1"
                                      title="Attach a resource to this video"
                                    >
                                      <Paperclip className="w-4 h-4" />
                                      Attach Resource
                                    </button>
                                    <button
                                      onClick={() => handleEdit(video)}
                                      className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(video.id)}
                                      className="p-2 hover:bg-red-500/20 rounded-lg text-white/60 hover:text-red-400 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Attached Resources */}
                                {resources.length > 0 && (
                                  <div className="border-t border-white/10 bg-white/5 px-4 py-2 space-y-2">
                                    <div className="text-xs text-white/40 font-medium uppercase tracking-wide">Attached Resources</div>
                                    {resources.map(resource => (
                                      <div key={resource.id} className="flex items-center gap-3 py-2 pl-4 group">
                                        <div className="w-1 h-6 bg-white/20 rounded-full" />
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTypeColor(resource.type)}`}>
                                          {getTypeIcon(resource.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-medium text-white/80">{resource.title}</div>
                                          <div className="text-xs text-white/40 truncate">{resource.url}</div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-xs border ${getTypeColor(resource.type)}`}>
                                          {resource.type.toUpperCase()}
                                        </span>
                                        <button
                                          onClick={() => handleEdit(resource)}
                                          className="p-1.5 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                          <Edit3 className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => handleDelete(resource.id)}
                                          className="p-1.5 hover:bg-red-500/20 rounded text-white/40 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Standalone Resources (not attached to any video) */}
                          {standaloneResources.length > 0 && (
                            <div className="mt-4">
                              <div className="text-xs text-white/40 font-medium uppercase tracking-wide mb-2">
                                Standalone Resources (not attached to a video)
                              </div>
                              {standaloneResources.map(resource => (
                                <div key={resource.id} className="bg-white/5 rounded-xl p-3 flex items-center gap-3 group mb-2">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTypeColor(resource.type)}`}>
                                    {getTypeIcon(resource.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-white/80">{resource.title}</div>
                                    <div className="text-xs text-white/40 truncate">{resource.url}</div>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-xs border ${getTypeColor(resource.type)}`}>
                                    {resource.type.toUpperCase()}
                                  </span>
                                  <button
                                    onClick={() => handleEdit(resource)}
                                    className="p-1.5 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(resource.id)}
                                    className="p-1.5 hover:bg-red-500/20 rounded text-white/40 hover:text-red-400 transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {editingItem ? 'Edit Content' : formData.parent_id ? 'Attach Resource to Video' : 'Add New Content'}
                </h3>
                {formData.parent_id && !editingItem && (
                  <p className="text-sm text-white/50 mt-1">
                    This resource will appear under the selected video
                  </p>
                )}
              </div>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Stage</label>
                  <select
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.stage_name}
                    onChange={e => setFormData({...formData, stage_name: e.target.value, parent_id: null})}
                    disabled={!!formData.parent_id && !editingItem}
                  >
                    {stages.map(s => (
                      <option key={s} value={s} className="bg-slate-800">{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Type</label>
                  <select
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="video" className="bg-slate-800" disabled={!!formData.parent_id}>📹 Video</option>
                    <option value="pdf" className="bg-slate-800">📄 PDF Document</option>
                    <option value="link" className="bg-slate-800">🔗 External Link</option>
                  </select>
                </div>
              </div>

              {/* Parent Video Selection (only for resources when not pre-selected) */}
              {formData.type !== 'video' && (
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">
                    Attached to Video
                    <span className="text-white/40 font-normal ml-2">(optional)</span>
                  </label>
                  <select
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.parent_id || ''}
                    onChange={e => setFormData({...formData, parent_id: e.target.value === '' ? null : e.target.value})}
                  >
                    <option value="" className="bg-slate-800">— Standalone (not attached) —</option>
                    {getStageVideos(formData.stage_name).map(v => (
                      <option key={v.id} value={v.id} className="bg-slate-800">📹 {v.title}</option>
                    ))}
                  </select>
                  <p className="text-xs text-white/40 mt-1">
                    Attached resources appear nested under the video in the course player.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-white/30"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder={formData.type === 'video' ? 'e.g., Introduction to Empathy Mapping' : 'e.g., Empathy Map Template'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">URL *</label>
                <input
                  type="url"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-white/30"
                  value={formData.url}
                  onChange={e => setFormData({...formData, url: e.target.value})}
                  placeholder={formData.type === 'video' ? 'https://youtube.com/watch?v=...' : 'https://drive.google.com/...'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Description</label>
                <textarea
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-20 resize-none placeholder-white/30"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of this content..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? 'Saving...' : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingItem ? 'Update' : 'Save'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorPage;
