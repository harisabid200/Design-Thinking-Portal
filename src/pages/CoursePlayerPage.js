import React, { useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import StageLayout from '../components/StageLayout';
import { useProgress } from '../context/ProgressContext';

// Tool Imports
import EmpathiseTool from '../tools/EmpathiseTool';
import DefineTool from '../tools/DefineTool';

// Placeholder for future tools
const ComingSoonTool = () => <div className="p-6 text-center text-gray-500 text-sm">AI Tool for this stage is coming soon.</div>;

const CoursePlayerPage = () => {
  const { stageId } = useParams(); // e.g. 'empathise', 'define'
  const { stages } = useProgress();

  // Normalize stage name (capitalize first letter for DB/Display)
  // 'empathise' -> 'Empathise'
  const stageName = useMemo(() => {
    if (!stageId) return '';
    return stageId.charAt(0).toUpperCase() + stageId.slice(1);
  }, [stageId]);

  // Determine Tool based on stageId
  const toolComponent = useMemo(() => {
    switch (stageId?.toLowerCase()) {
        case 'empathise':
            return <EmpathiseTool isCompleted={stages['Empathise'] === 'completed'} />;
        case 'define':
             return <DefineTool />;
        case 'ideate':
        case 'prototype':
        case 'test':
             return <ComingSoonTool />;
        default:
             return null;
    }
  }, [stageId, stages]);

  // Valid stages check
  if (!['empathise', 'define', 'ideate', 'prototype', 'test'].includes(stageId?.toLowerCase())) {
     return <Navigate to="/dashboard" />;
  }

  return (
    <StageLayout 
        stageName={stageName} 
        activeToolComponent={toolComponent} 
    />
  );
};

export default CoursePlayerPage;
