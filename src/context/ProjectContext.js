import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const ProjectContext = createContext();

export const useProject = () => useContext(ProjectContext);

// Project templates
export const PROJECT_TEMPLATES = [
  {
    id: 'campus-nav',
    title: 'Campus Navigation',
    description: 'Help new students navigate the university campus more easily',
    targetUsers: 'New students, visitors',
    icon: '🏫',
    category: 'education'
  },
  {
    id: 'appointment-booking',
    title: 'Appointment Booking',
    description: 'Redesign how students book appointments with university offices',
    targetUsers: 'Students, administrative staff',
    icon: '📅',
    category: 'productivity'
  },
  {
    id: 'study-groups',
    title: 'Study Group Collaboration',
    description: 'Improve how students form and collaborate in study groups',
    targetUsers: 'Students',
    icon: '📚',
    category: 'education'
  },
  {
    id: 'cafeteria',
    title: 'Cafeteria Experience',
    description: 'Enhance the campus cafeteria ordering and dining experience',
    targetUsers: 'Students, faculty',
    icon: '🍽️',
    category: 'lifestyle'
  },
  {
    id: 'campus-transport',
    title: 'Campus Transportation',
    description: 'Improve transportation options within and around campus',
    targetUsers: 'Students, staff',
    icon: '🚌',
    category: 'mobility'
  }
];

// Deliverable types per stage
export const STAGE_DELIVERABLES = {
  Empathise: [
    { type: 'interview_notes', label: 'Interview Notes', description: 'Document your user interviews' },
    { type: 'empathy_map', label: 'Empathy Map', description: 'Map what users say, think, do, and feel' },
    { type: 'pain_points', label: 'Key Pain Points', description: 'Identify the main user frustrations' }
  ],
  Define: [
    { type: 'user_persona', label: 'User Persona', description: 'Create a representative user profile' },
    { type: 'problem_statement', label: 'Problem Statement', description: 'Write your POV and HMW statements' }
  ],
  Ideate: [
    { type: 'brainstorm', label: 'Brainstorm Ideas', description: 'Generate as many ideas as possible' },
    { type: 'top_ideas', label: 'Top 3 Ideas', description: 'Select and justify your best ideas' }
  ],
  Prototype: [
    { type: 'prototype_description', label: 'Prototype Description', description: 'Describe your prototype concept' },
    { type: 'wireframes', label: 'Wireframes/Sketches', description: 'Upload visual representations' }
  ],
  Test: [
    { type: 'test_feedback', label: 'Test Feedback', description: 'Document feedback from testing' },
    { type: 'iterations', label: 'Iteration Notes', description: 'Note changes based on feedback' }
  ]
};

export const ProjectProvider = ({ children }) => {
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [deliverables, setDeliverables] = useState({});
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);

  // Fetch user's project on mount
  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from('user_projects')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (projectError) throw projectError;

      if (projectData) {
        setProject(projectData);
        
        // Fetch deliverables
        const { data: deliverablesData } = await supabase
          .from('project_deliverables')
          .select('*')
          .eq('project_id', projectData.id);

        if (deliverablesData) {
          const delMap = {};
          deliverablesData.forEach(d => {
            if (!delMap[d.stage_name]) delMap[d.stage_name] = {};
            delMap[d.stage_name][d.deliverable_type] = d;
          });
          setDeliverables(delMap);
        }
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchProject();
    } else {
      setLoading(false);
    }
  }, [user?.id, fetchProject]);

  // Create project from template
  const createProject = async (template) => {
    try {
      const { data, error } = await supabase
        .from('user_projects')
        .insert({
          user_id: user.id,
          title: template.title,
          description: template.description,
          target_users: template.targetUsers,
          current_stage: 'Empathise'
        })
        .select()
        .single();

      if (error) throw error;
      
      setProject(data);
      setShowProjectModal(false);
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  // Save a deliverable (uses insert or update pattern)
  const saveDeliverable = async (stageName, deliverableType, content) => {
    if (!project) {
      console.error('No project selected');
      throw new Error('No project selected');
    }

    try {
      // First, check if deliverable already exists
      const { data: existing, error: fetchError } = await supabase
        .from('project_deliverables')
        .select('id')
        .eq('project_id', project.id)
        .eq('stage_name', stageName)
        .eq('deliverable_type', deliverableType)
        .maybeSingle();

      if (fetchError) {
        console.error('Error checking existing deliverable:', fetchError);
        throw fetchError;
      }

      let data, error;

      if (existing) {
        // Update existing
        const result = await supabase
          .from('project_deliverables')
          .update({
            content: content
          })
          .eq('id', existing.id)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        // Insert new
        const result = await supabase
          .from('project_deliverables')
          .insert({
            project_id: project.id,
            stage_name: stageName,
            deliverable_type: deliverableType,
            content: content
          })
          .select()
          .single();
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Error saving deliverable:', error.message, error.details, error.hint);
        throw error;
      }

      // Update local state
      setDeliverables(prev => ({
        ...prev,
        [stageName]: {
          ...(prev[stageName] || {}),
          [deliverableType]: data
        }
      }));

      return data;
    } catch (error) {
      console.error('Save deliverable failed:', error);
      throw error;
    }
  };

  // Get a specific deliverable
  const getDeliverable = useCallback((stageName, deliverableType) => {
    return deliverables[stageName]?.[deliverableType] || null;
  }, [deliverables]);

  // Check if a deliverable is complete
  const isDeliverableComplete = useCallback((stageName, deliverableType) => {
    const del = getDeliverable(stageName, deliverableType);
    return del && del.content && Object.keys(del.content).length > 0;
  }, [getDeliverable]);

  // Get stage completion percentage
  const getStageProgress = useCallback((stageName) => {
    const stageDels = STAGE_DELIVERABLES[stageName] || [];
    if (stageDels.length === 0) return 0;
    
    const completed = stageDels.filter(d => isDeliverableComplete(stageName, d.type)).length;
    return Math.round((completed / stageDels.length) * 100);
  }, [isDeliverableComplete]);

  // Build context for AI (project + stage + progress)
  const buildAIContext = useCallback((currentStage) => {
    if (!project) return null;

    const allProgress = {};
    Object.keys(STAGE_DELIVERABLES).forEach(stage => {
      allProgress[stage] = getStageProgress(stage);
    });

    return {
      project: {
        title: project.title,
        description: project.description,
        targetUsers: project.target_users
      },
      currentStage,
      stageProgress: allProgress,
      deliverables: deliverables
    };
  }, [project, deliverables, getStageProgress]);

  const value = {
    project,
    deliverables,
    loading,
    showProjectModal,
    setShowProjectModal,
    createProject,
    saveDeliverable,
    getDeliverable,
    isDeliverableComplete,
    getStageProgress,
    buildAIContext,
    fetchProject
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};
