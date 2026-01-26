import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Save, Loader2 } from 'lucide-react';

const NotesTab = ({ stageName }) => {
  const { user } = useAuth();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && stageName) {
      loadNotes();
    }
  }, [user, stageName]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_notes')
        .select('content')
        .eq('user_id', user.id)
        .eq('stage_name', stageName)
        .maybeSingle();

      if (error) throw error;
      if (data) setNote(data.content);
    } catch (err) {
      console.error('Error loading notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async () => {
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
    } catch (err) {
      console.error('Error saving notes:', err);
      alert('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4 text-gray-500">Loading notes...</div>;

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Your Notes</h3>
        <button
            onClick={saveNotes}
            disabled={saving}
            className="flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            Save
        </button>
      </div>
      <textarea
        className="flex-1 w-full p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        placeholder="Take notes here..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{ minHeight: '300px' }}
      />
    </div>
  );
};

export default NotesTab;
