import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const ProgressContext = createContext({});

export const useProgress = () => useContext(ProgressContext);

export const ProgressProvider = ({ children }) => {
  const { user } = useAuth();
  const [projectId, setProjectId] = useState(null);
  const [stages, setStages] = useState({});
  const [loading, setLoading] = useState(true);

  const STAGE_ORDER = ['Empathise', 'Define', 'Ideate', 'Prototype', 'Test'];

  useEffect(() => {
    if (!user) {
        setStages({});
        setLoading(false);
        return;
    }

    const fetchProgress = async () => {
      try {
        setLoading(true);
        
        // 1. Get or Create Project
        let { data: projects, error: projectError } = await supabase
          .from('projects')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle to avoid error if 0 rows

        if (projectError) throw projectError;

        if (!projects) {
             const { data: newProject, error: createError } = await supabase
            .from('projects')
            .insert([{ user_id: user.id, title: 'My Design Thinking Project' }])
            .select()
            .single();
           
           if (createError) throw createError;
           projects = newProject;
        }

        const pid = projects.id;
        setProjectId(pid);

        // 2. Get Stage Progress
        const { data: progressData, error: progressError } = await supabase
            .from('stage_progress')
            .select('stage_name, status')
            .eq('project_id', pid);

        if (progressError) throw progressError;

        // Convert to object for easier access
        const progressMap = {};
        progressData.forEach(p => {
            progressMap[p.stage_name] = p.status;
        });
        setStages(progressMap);

      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  const isStageUnlocked = (stageName) => {
    // Stage names in DB/Code: 'Empathise', 'Define', 'Ideate', 'Prototype', 'Test'
    // Ensure case match if needed, but we seem consistent
    const index = STAGE_ORDER.indexOf(stageName);
    if (index === 0) return true; // First stage always unlocked
    if (index === -1) return true; // Unknown stage, default open (or closed?) -> open for safety, but typically won't happen
    
    const prevStage = STAGE_ORDER[index - 1];
    // Check if previous stage is completed
    return stages[prevStage] === 'completed';
  };

  const updateStageStatus = async (stageName, status) => {
      if (!projectId) return;

      // Upsert progress
      const { error } = await supabase
        .from('stage_progress')
        .upsert({ 
            project_id: projectId, 
            stage_name: stageName, 
            status: status,
            updated_at: new Date().toISOString()
        }, { onConflict: 'project_id, stage_name' });
      
      if (error) throw error;
      
      // Update local state
      setStages(prev => ({
          ...prev,
          [stageName]: status
      }));
  };

  return (
    <ProgressContext.Provider value={{ stages, isStageUnlocked, updateStageStatus, projectId, loading }}>
      {children}
    </ProgressContext.Provider>
  );
};
