import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Heart, 
  Target, 
  Lightbulb, 
  PenTool, 
  TestTube, 
  LogOut,
  Menu,
  X,
  Lock
} from 'lucide-react';

import { useProgress } from '../context/ProgressContext';

const SidebarItem = ({ icon: Icon, label, path, active, locked }) => {
  if (locked) {
     return (
        <div className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 cursor-not-allowed">
            <Icon className="w-5 h-5 opacity-50" />
            <span className="font-medium">{label}</span>
            <Lock className="w-4 h-4 ml-auto opacity-50" />
        </div>
     );
  }

  return (
    <Link
        to={path}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        active 
            ? 'bg-indigo-50 text-indigo-600' 
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
    >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
    </Link>
  );
};

const Layout = ({ children }) => {
  const { signOut, user } = useAuth();
  const { isStageUnlocked } = useProgress();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Heart, label: 'Empathise', path: '/stage/empathise' },
    { icon: Target, label: 'Define', path: '/stage/define' },
    { icon: Lightbulb, label: 'Ideate', path: '/stage/ideate' },
    { icon: PenTool, label: 'Prototype', path: '/stage/prototype' },
    { icon: TestTube, label: 'Test', path: '/stage/test' },
  ];

  const isStageView = location.pathname.startsWith('/stage/');

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar 
          - Dashboard: Fixed w-64
          - Stage View: Collapsed w-20, hover -> w-64
      */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col shadow-sm group
          ${isStageView ? 'w-20 hover:w-64' : 'w-64'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100 flex-shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <span className={`ml-3 text-lg font-bold text-gray-900 whitespace-nowrap transition-opacity duration-200
            ${isStageView ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}
          `}>
            Design Portal
          </span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
             const isStage = item.path.startsWith('/stage/');
             const locked = isStage ? !isStageUnlocked(item.label) : false;
             const active = location.pathname === item.path;

             return (
               <Link
                 key={item.path}
                 to={locked ? '#' : item.path}
                 className={`flex items-center px-3 py-3 rounded-lg transition-colors whitespace-nowrap ${
                    active 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : locked 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                 }`}
               >
                 <item.icon className={`w-6 h-6 flex-shrink-0 ${locked ? 'opacity-50' : ''}`} />
                 <span className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-200 ${locked ? 'line-through' : ''}
                    ${isStageView ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}
                 `}>
                    {item.label}
                 </span>
                 {locked && (
                    <Lock className={`w-4 h-4 ml-auto transition-opacity duration-200
                        ${isStageView ? 'opacity-0 group-hover:opacity-50' : 'opacity-50'}
                    `} />
                 )}
               </Link>
             );
          })}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center px-1 mb-4 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className={`ml-3 transition-opacity duration-200
                ${isStageView ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}
            `}>
              <p className="text-sm font-medium text-gray-900 truncate w-32">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { signOut(); navigate('/login'); }}
            className="w-full flex items-center px-2 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-6 h-6 flex-shrink-0" />
            <span className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-200
                ${isStageView ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}
            `}>
                Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className={`flex-1 flex flex-col h-full transition-all duration-300
         ${isStageView ? 'ml-20 w-[calc(100%-5rem)]' : 'ml-64 w-[calc(100%-16rem)]'}
      `}>
        <main className="flex-1 overflow-hidden h-full">
            {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
