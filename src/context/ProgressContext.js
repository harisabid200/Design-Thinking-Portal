import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const ProgressContext = createContext({});

export const useProgress = () => useContext(ProgressContext);

export const STAGE_ORDER = ['Empathise', 'Define', 'Ideate', 'Prototype', 'Test'];

export const ProgressProvider = ({ children }) => {
  const { user } = useAuth();
  const [stageCompletion, setStageCompletion] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch completion status for all stages
  const fetchStageCompletion = useCallback(async () => {
    if (!user?.id) {
      setStageCompletion({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // 1. Get all videos per stage from stage_content
      const { data: allContent, error: contentError } = await supabase
        .from('stage_content')
        .select('id, stage_name, type')
        .eq('type', 'video');

      if (contentError) throw contentError;

      // 2. Get user's video progress
      const { data: videoProgress, error: progressError } = await supabase
        .from('video_progress')
        .select('content_id, is_completed')
        .eq('user_id', user.id)
        .eq('is_completed', true);

      if (progressError) throw progressError;

      // 3. Get user's project deliverables
      const { data: userProject } = await supabase
        .from('user_projects')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let deliverableCompletion = {};
      if (userProject) {
        const { data: deliverables } = await supabase
          .from('project_deliverables')
          .select('stage_name, deliverable_type, content')
          .eq('project_id', userProject.id);

        if (deliverables) {
          deliverables.forEach(d => {
            if (d.content && Object.keys(d.content).length > 0) {
              if (!deliverableCompletion[d.stage_name]) {
                deliverableCompletion[d.stage_name] = [];
              }
              deliverableCompletion[d.stage_name].push(d.deliverable_type);
            }
          });
        }
      }

      // 4. Calculate completion per stage
      const completedVideoIds = new Set(videoProgress?.map(p => p.content_id) || []);
      
      const stageStatus = {};
      STAGE_ORDER.forEach(stage => {
        const stageVideos = allContent?.filter(c => c.stage_name === stage) || [];
        const allVideosWatched = stageVideos.length > 0 && 
          stageVideos.every(v => completedVideoIds.has(v.id));
        
        // Required deliverables per stage (at least one for MVP)
        const requiredDeliverables = {
          'Empathise': ['interview_notes'],
          'Define': ['problem_statement'],
          'Ideate': ['brainstorm'],
          'Prototype': ['prototype_description'],
          'Test': ['test_feedback']
        };

        const requiredForStage = requiredDeliverables[stage] || [];
        const completedDeliverables = deliverableCompletion[stage] || [];
        const hasRequiredDeliverables = requiredForStage.length === 0 || 
          requiredForStage.every(d => completedDeliverables.includes(d));

        stageStatus[stage] = {
          videosComplete: allVideosWatched,
          deliverablesComplete: hasRequiredDeliverables,
          isComplete: allVideosWatched && hasRequiredDeliverables,
          videoCount: stageVideos.length,
          videosWatched: stageVideos.filter(v => completedVideoIds.has(v.id)).length
        };
      });

      setStageCompletion(stageStatus);
    } catch (error) {
      console.error('Error fetching stage completion:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchStageCompletion();
  }, [fetchStageCompletion]);

  // Check if a stage is unlocked (previous stage must be complete)
  const isStageUnlocked = useCallback((stageName) => {
    const index = STAGE_ORDER.indexOf(stageName);
    
    // First stage always unlocked
    if (index === 0) return true;
    // Unknown stage
    if (index === -1) return true;
    
    // Previous stage must be complete (videos + deliverables)
    const prevStage = STAGE_ORDER[index - 1];
    return stageCompletion[prevStage]?.isComplete === true;
  }, [stageCompletion]);

  // Check if stage videos are complete
  const areStageVideosComplete = useCallback((stageName) => {
    return stageCompletion[stageName]?.videosComplete === true;
  }, [stageCompletion]);

  // Check if stage deliverables are complete  
  const areStageDeliverablesComplete = useCallback((stageName) => {
    return stageCompletion[stageName]?.deliverablesComplete === true;
  }, [stageCompletion]);

  // Get stage progress info
  const getStageInfo = useCallback((stageName) => {
    return stageCompletion[stageName] || {
      videosComplete: false,
      deliverablesComplete: false,
      isComplete: false,
      videoCount: 0,
      videosWatched: 0
    };
  }, [stageCompletion]);

  // Legacy support - get stages object (for backward compatibility)
  const stages = React.useMemo(() => {
    const result = {};
    STAGE_ORDER.forEach(stage => {
      result[stage] = stageCompletion[stage]?.isComplete ? 'completed' : 'in_progress';
    });
    return result;
  }, [stageCompletion]);

  // Legacy: Update stage status (triggers refresh)
  const updateStageStatus = useCallback(async () => {
    // Just refresh the completion data
    await fetchStageCompletion();
  }, [fetchStageCompletion]);

  return (
    <ProgressContext.Provider value={{ 
      stages, 
      stageCompletion,
      isStageUnlocked, 
      areStageVideosComplete,
      areStageDeliverablesComplete,
      getStageInfo,
      updateStageStatus, 
      refreshProgress: fetchStageCompletion,
      loading 
    }}>
      {children}
    </ProgressContext.Provider>
  );
};
