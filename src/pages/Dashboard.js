import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Target, 
  Lightbulb, 
  PenTool, 
  TestTube, 
  ArrowRight,
  PlayCircle,
  Lock,
  CheckCircle2
} from 'lucide-react';

import { useProgress, STAGE_ORDER } from '../context/ProgressContext';
import UnlockToast from '../components/UnlockToast';

const StageCard = ({ stage, index, onLockedClick }) => {
  const { isStageUnlocked, getStageInfo, stages } = useProgress();
  const unlocked = isStageUnlocked(stage.title);
  const stageInfo = getStageInfo(stage.title);
  const status = stages[stage.title] || 'not_started';

  // Calculate progress percentage
  const progressPercent = stageInfo?.videoCount > 0 
    ? Math.round((stageInfo.videosWatched / stageInfo.videoCount) * 100) 
    : 0;

  const handleLockedClick = () => {
    if (!unlocked) {
      onLockedClick(stage.title, index);
    }
  };

  return (
    <div 
      className={`rounded-xl shadow-sm border overflow-hidden transition-all ${
        unlocked 
          ? 'bg-white border-gray-200 hover:shadow-md' 
          : 'bg-gray-50 border-gray-200 cursor-pointer hover:border-amber-300'
      }`}
      onClick={handleLockedClick}
    >
      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 relative overflow-hidden">
        <div 
          className={`h-full transition-all ${
            stageInfo?.isComplete ? 'bg-green-500' : 
            unlocked ? 'bg-indigo-500' : 'bg-gray-300'
          }`}
          style={{ width: `${unlocked ? progressPercent : 0}%` }}
        />
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${
            stageInfo?.isComplete ? 'bg-green-50 text-green-600' :
            unlocked ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'
          }`}>
            <stage.icon className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-2">
            {stageInfo?.isComplete && (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            )}
            <span className="text-sm font-medium text-gray-400">Step {index + 1}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          {stage.title}
          {!unlocked && (
            <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
              <Lock className="w-3 h-3" />
              Locked
            </span>
          )}
        </h3>
        <p className="text-gray-600 mb-6 line-clamp-2">{stage.description}</p>
        
        <div className="space-y-3">
          {/* Status Indicator */}
          {unlocked && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-500">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  stageInfo?.isComplete ? 'bg-green-500' : 
                  status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-300'
                }`} />
                {stageInfo?.isComplete ? 'Completed' : 
                 status === 'in_progress' ? 'In Progress' : 'Not Started'}
              </div>
              {!stageInfo?.isComplete && stageInfo?.videoCount > 0 && (
                <span className="text-xs text-gray-400">
                  {stageInfo.videosWatched}/{stageInfo.videoCount} videos
                </span>
              )}
            </div>
          )}
          
          {unlocked ? (
            <Link 
              to={stage.path}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              <span>{stageInfo?.isComplete ? 'Review Stage' : 'Go to Stage'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button 
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors font-medium"
            >
              <Lock className="w-4 h-4" />
              <span>See Requirements</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { getStageInfo, isStageUnlocked } = useProgress();
  
  // Calculate current progress
  const getCurrentStageIndex = () => {
    for (let i = STAGE_ORDER.length - 1; i >= 0; i--) {
      const stageInfo = getStageInfo(STAGE_ORDER[i]);
      if (stageInfo?.isComplete) {
        return i + 1; // Return next stage index
      }
    }
    return 0; // Start from beginning
  };

  const currentStageIndex = getCurrentStageIndex();
  const currentStageName = STAGE_ORDER[Math.min(currentStageIndex, STAGE_ORDER.length - 1)];
  const completedStages = STAGE_ORDER.filter(stage => getStageInfo(stage)?.isComplete).length;
  const isAllComplete = completedStages === 5;

  // Dynamic welcome content
  const getWelcomeContent = () => {
    if (isAllComplete) {
      return {
        title: "🎉 Congratulations!",
        message: "You've completed all 5 stages of Design Thinking! Review any stage or start a new project.",
        buttonText: "Review Course",
        buttonPath: "/stage/empathise",
        bgClass: "bg-gradient-to-r from-green-600 to-emerald-600"
      };
    }
    
    if (completedStages === 0) {
      return {
        title: "Welcome to Design Thinking!",
        message: "Start your journey by understanding user needs in the Empathise stage.",
        buttonText: "Start Learning",
        buttonPath: "/stage/empathise",
        bgClass: "bg-indigo-600"
      };
    }

    const stageMessages = {
      Define: "Great progress! Now let's define the problem clearly.",
      Ideate: "Time to get creative! Generate ideas to solve your problem.",
      Prototype: "Let's build! Create prototypes to test your ideas.",
      Test: "Almost there! Test your prototypes with real users."
    };

    return {
      title: `Continue: ${currentStageName}`,
      message: stageMessages[currentStageName] || "Keep going! You're making great progress.",
      buttonText: `Continue ${currentStageName}`,
      buttonPath: `/stage/${currentStageName.toLowerCase()}`,
      bgClass: "bg-indigo-600"
    };
  };

  const welcomeContent = getWelcomeContent();
  
  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [lockedStage, setLockedStage] = useState(null);
  const [requiredStage, setRequiredStage] = useState(null);
  const [requiredStageInfo, setRequiredStageInfo] = useState(null);

  const stages = [
    {
      title: 'Empathise',
      description: 'Understand the users needs and feelings through research and observation.',
      icon: Heart,
      color: 'rose',
      path: '/stage/empathise'
    },
    {
      title: 'Define',
      description: 'Analyze observations to define the core problem you are solving.',
      icon: Target,
      color: 'blue',
      path: '/stage/define'
    },
    {
      title: 'Ideate',
      description: 'Generate a wide range of creative ideas to solve the problem.',
      icon: Lightbulb,
      color: 'yellow',
      path: '/stage/ideate'
    },
    {
      title: 'Prototype',
      description: 'Build scaled-down versions of your ideas to investigate solutions.',
      icon: PenTool,
      color: 'purple',
      path: '/stage/prototype'
    },
    {
      title: 'Test',
      description: 'Test your prototypes with users to get feedback and refine.',
      icon: TestTube,
      color: 'green',
      path: '/stage/test'
    }
  ];

  const handleLockedClick = (stageName, index) => {
    // Get the previous stage (the one that needs to be completed)
    const prevStageName = STAGE_ORDER[index - 1];
    const prevStageInfo = getStageInfo(prevStageName);
    
    setLockedStage(stageName);
    setRequiredStage(prevStageName);
    setRequiredStageInfo(prevStageInfo);
    setShowToast(true);
  };

  const handleNavigateToStage = (stageName) => {
    navigate(`/stage/${stageName.toLowerCase()}`);
  };
  
  return (
    <>
      <div className="space-y-8 p-8 overflow-y-auto h-full">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Dashboard</h1>
          <p className="mt-2 text-gray-600">Track your progress through the 5 stages of Design Thinking.</p>
        </div>

        {/* Progress Overview - Dynamic based on progress */}
        <div className={`${welcomeContent.bgClass} rounded-2xl p-8 text-white relative overflow-hidden`}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{welcomeContent.title}</h2>
              {completedStages > 0 && (
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">{completedStages}/5 Complete</span>
                </div>
              )}
            </div>
            <p className="text-white/90 max-w-xl mb-6">
              {welcomeContent.message}
            </p>
            <Link 
              to={welcomeContent.buttonPath}
              className="inline-flex items-center space-x-2 bg-white text-indigo-600 px-6 py-3 rounded-lg font-bold hover:bg-indigo-50 transition-colors"
            >
              <PlayCircle className="w-5 h-5" />
              <span>{welcomeContent.buttonText}</span>
            </Link>
          </div>
          
          {/* Decorative background circles */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full opacity-50 blur-3xl" />
          <div className="absolute bottom-0 right-40 w-60 h-60 bg-white/10 rounded-full opacity-50 blur-3xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stages.map((stage, index) => (
            <StageCard 
              key={stage.title} 
              stage={stage} 
              index={index} 
              onLockedClick={handleLockedClick}
            />
          ))}
        </div>
      </div>

      {/* Unlock Requirements Toast */}
      <UnlockToast
        isOpen={showToast}
        onClose={() => setShowToast(false)}
        lockedStage={lockedStage}
        requiredStage={requiredStage}
        stageInfo={requiredStageInfo}
        onNavigate={handleNavigateToStage}
      />
    </>
  );
};

export default Dashboard;
