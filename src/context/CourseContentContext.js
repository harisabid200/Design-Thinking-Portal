import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

/**
 * CourseContentContext - Global cache for all course content
 * 
 * Fetches all stage_content and video_progress ONCE on app load.
 * This eliminates the loading screen when switching between stages.
 */

const CourseContentContext = createContext({});

export const useCourseContent = () => useContext(CourseContentContext);

export const CourseContentProvider = ({ children }) => {
  const { user } = useAuth();
  const [allContent, setAllContent] = useState([]);
  const [videoProgress, setVideoProgress] = useState({});
  const [videoPositions, setVideoPositions] = useState({});
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Fetch ALL content once on mount
  const fetchAllContent = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('stage_content')
        .select('*')
        .order('sequence_order', { ascending: true });

      if (error) throw error;
      setAllContent(data || []);
    } catch (error) {
      console.error('Error fetching course content:', error);
    }
  }, []);

  // Fetch user's progress
  const fetchUserProgress = useCallback(async () => {
    if (!user?.id) {
      setVideoProgress({});
      setVideoPositions({});
      return;
    }

    try {
      const { data, error } = await supabase
        .from('video_progress')
        .select('content_id, is_completed, last_position_seconds')
        .eq('user_id', user.id);

      if (error) throw error;

      const progressMap = {};
      const positionMap = {};
      (data || []).forEach(p => {
        progressMap[p.content_id] = p.is_completed;
        positionMap[p.content_id] = p.last_position_seconds || 0;
      });
      
      setVideoProgress(progressMap);
      setVideoPositions(positionMap);
    } catch (error) {
      console.error('Error fetching video progress:', error);
    }
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchAllContent(), fetchUserProgress()]);
      setLoading(false);
      setInitialLoadComplete(true);
    };
    init();
  }, [fetchAllContent, fetchUserProgress]);

  // Update a single video's progress (called from VideoPlayer)
  const updateVideoProgress = useCallback((contentId, isCompleted) => {
    setVideoProgress(prev => ({
      ...prev,
      [contentId]: isCompleted
    }));
  }, []);

  // Update video position (for resume feature)
  const updateVideoPosition = useCallback((contentId, position) => {
    setVideoPositions(prev => ({
      ...prev,
      [contentId]: position
    }));
  }, []);

  // Get content filtered by stage
  const getStageContent = useCallback((stageName) => {
    return allContent.filter(c => c.stage_name === stageName);
  }, [allContent]);

  // Get videos for a stage
  const getStageVideos = useCallback((stageName) => {
    return allContent.filter(c => c.stage_name === stageName && c.type === 'video');
  }, [allContent]);

  // Get resources for a stage
  const getStageResources = useCallback((stageName) => {
    return allContent.filter(c => c.stage_name === stageName && c.type === 'resource');
  }, [allContent]);

  // Refresh progress (after completing a video)
  const refreshProgress = useCallback(async () => {
    await fetchUserProgress();
  }, [fetchUserProgress]);

  return (
    <CourseContentContext.Provider value={{
      allContent,
      videoProgress,
      videoPositions,
      loading,
      initialLoadComplete,
      getStageContent,
      getStageVideos,
      getStageResources,
      updateVideoProgress,
      updateVideoPosition,
      refreshProgress
    }}>
      {children}
    </CourseContentContext.Provider>
  );
};
