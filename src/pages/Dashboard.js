import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Target, 
  Lightbulb, 
  PenTool, 
  TestTube, 
  ArrowRight,
  PlayCircle,
  Lock
} from 'lucide-react';

import { useProgress } from '../context/ProgressContext';

const StageCard = ({ stage, index }) => {
  const { isStageUnlocked, stages } = useProgress();
  const unlocked = isStageUnlocked(stage.title);
  const status = stages[stage.title] || 'not_started';

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden transition-all ${
      unlocked 
        ? 'bg-white border-gray-200 hover:shadow-md' 
        : 'bg-gray-50 border-gray-200 opacity-75'
    }`}>
      <div className={`h-2 ${unlocked ? `bg-${stage.color}-500` : 'bg-gray-300'}`} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${
            unlocked ? `bg-${stage.color}-50 text-${stage.color}-600` : 'bg-gray-100 text-gray-400'
          }`}>
            <stage.icon className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium text-gray-400">Step {index + 1}</span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {stage.title}
          {!unlocked && <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Locked</span>}
        </h3>
        <p className="text-gray-600 mb-6 line-clamp-2">{stage.description}</p>
        
        <div className="space-y-3">
          {/* Status Indicator */}
          {unlocked && (
            <div className="flex items-center text-sm text-gray-500">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                status === 'completed' ? 'bg-green-500' : 
                status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-300'
              }`} />
              {status === 'completed' ? 'Completed' : 
               status === 'in_progress' ? 'In Progress' : 'Not Started'}
            </div>
          )}
          
          {unlocked ? (
            <Link 
              to={stage.path}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
            >
              <span>Go to Stage</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
             <button disabled className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed font-medium">
               <Lock className="w-4 h-4" />
               <span>Locked</span>
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
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
  
  return (
    <div className="space-y-8 p-8 overflow-y-auto h-full">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Course Dashboard</h1>
        <p className="mt-2 text-gray-600">Track your progress through the 5 stages of Design Thinking.</p>
      </div>

      {/* Progress Overview (Placeholder) */}
      <div className="bg-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-4">Welcome back!</h2>
          <p className="text-indigo-100 max-w-xl mb-6">
            You're currently at the beginning of your Design Thinking journey. 
            Start with the "Empathise" stage to begin understanding your users.
          </p>
          <Link 
            to="/stage/empathise"
            className="inline-flex items-center space-x-2 bg-white text-indigo-600 px-6 py-3 rounded-lg font-bold hover:bg-indigo-50 transition-colors"
          >
            <PlayCircle className="w-5 h-5" />
            <span>Continue Learning</span>
          </Link>
        </div>
        
        {/* Decorative background circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500 rounded-full opacity-50 blur-3xl" />
        <div className="absolute bottom-0 right-40 w-60 h-60 bg-indigo-700 rounded-full opacity-50 blur-3xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stages.map((stage, index) => (
          <StageCard key={stage.title} stage={stage} index={index} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
