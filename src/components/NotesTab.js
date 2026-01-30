import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Save, Loader2, Sparkles, Clock, FileText } from 'lucide-react';

const NotesTab = ({ stageName }) => {
  const { user } = useAuth();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const loadNotes = useCallback(async () => {
    if (!user || !stageName) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_notes')
        .select('content, updated_at')
        .eq('user_id', user.id)
        .eq('stage_name', stageName)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setNote(data.content);
        setLastSaved(new Date(data.updated_at));
      }
    } catch (err) {
      console.error('Error loading notes:', err);
    } finally {
      setLoading(false);
    }
  }, [user, stageName]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const saveNotes = useCallback(async () => {
    if (!user || saving) return;
    
    try {
      setSaving(true);
      const { error } = await supabase
        .from('user_notes')
        .upsert({
            user_id: user.id,
            stage_name: stageName,
            content: note,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, stage_name' });

      if (error) throw error;
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setSaving(false);
    }
  }, [user, stageName, note, saving]);

  // Auto-save after 3 seconds of inactivity
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    
    const timer = setTimeout(() => {
      saveNotes();
    }, 3000);

    return () => clearTimeout(timer);
  }, [note, hasUnsavedChanges, saveNotes]);

  const handleNoteChange = (e) => {
    setNote(e.target.value);
    setHasUnsavedChanges(true);
  };

  const formatLastSaved = () => {
    if (!lastSaved) return 'Never saved';
    const now = new Date();
    const diff = Math.floor((now - lastSaved) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    return lastSaved.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading notes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">Your Notes</h3>
            <p className="text-xs text-slate-400">{stageName} Stage</p>
          </div>
        </div>
        
        <button
          onClick={saveNotes}
          disabled={saving || !hasUnsavedChanges}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
            ${hasUnsavedChanges 
              ? 'bg-indigo-500 hover:bg-indigo-600 text-white' 
              : 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
            }
          `}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : hasUnsavedChanges ? 'Save' : 'Saved'}
        </button>
      </div>

      {/* Textarea Container */}
      <div className="flex-1 flex flex-col bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <textarea
          className="flex-1 w-full p-4 bg-transparent resize-none focus:outline-none text-slate-200 placeholder-slate-500 leading-relaxed"
          placeholder="Take notes while watching the video...

💡 Tips:
• Summarize key concepts
• Note timestamps for important moments
• Write down questions to research later
• Connect ideas to your project"
          value={note}
          onChange={handleNoteChange}
          style={{ minHeight: '200px' }}
        />
        
        {/* Footer Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatLastSaved()}
            </span>
            <span>{note.length} characters</span>
          </div>
          
          {hasUnsavedChanges && (
            <span className="text-xs text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Auto-saving...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesTab;
