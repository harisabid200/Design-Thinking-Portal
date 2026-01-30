import React, {useState} from 'react';
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



const Layout = ({ children }) => {
  const { signOut, user } = useAuth();
  const { isStageUnlocked } = useProgress();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Heart, label: 'Empathise', path: '/stage/empathise' },
    { icon: Target, label: 'Define', path: '/stage/define' },
    { icon: Lightbulb, label: 'Ideate', path: '/stage/ideate' },
    { icon: PenTool, label: 'Prototype', path: '/stage/prototype' },
    { icon: TestTube, label: 'Test', path: '/stage/test' },
  ];

  const isStageView = location.pathname.startsWith('/stage/');

  const NavContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b border-gray-100 flex-shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <span className={`ml-3 text-lg font-bold text-gray-900 whitespace-nowrap transition-opacity duration-200 lg:group-hover:opacity-100
            ${isStageView ? 'lg:opacity-0' : 'lg:opacity-100'}
          `}>
            Design Portal
          </span>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
             const isStage = item.path.startsWith('/stage/');
             const locked = isStage ? !isStageUnlocked(item.label) : false;
             const active = location.pathname === item.path;

             return (
               <Link
                 key={item.path}
                 to={locked ? '#' : item.path}
                 onClick={() => setMobileMenuOpen(false)}
                 className={`flex items-center px-3 py-3 rounded-lg transition-colors whitespace-nowrap ${
                    active 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : locked 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                 }`}
               >
                 <item.icon className={`w-6 h-6 flex-shrink-0 ${locked ? 'opacity-50' : ''}`} />
                 <span className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-200 lg:group-hover:opacity-100 ${locked ? 'line-through' : ''}
                    ${isStageView ? 'lg:opacity-0' : 'lg:opacity-100'}
                 `}>
                    {item.label}
                 </span>
                 {locked && (
                    <Lock className={`w-4 h-4 ml-auto transition-opacity duration-200 lg:group-hover:opacity-50
                        ${isStageView ? 'lg:opacity-0' : 'lg:opacity-50'}
                    `} />
                 )}
               </Link>
             );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center px-1 mb-4 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className={`ml-3 transition-opacity duration-200 lg:group-hover:opacity-100
                ${isStageView ? 'lg:opacity-0' : 'lg:opacity-100'}
            `}>
              <p className="text-sm font-medium text-gray-900 truncate w-32">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { signOut(); navigate('/login'); }}
            className="w-full flex items-center px-2 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-6 h-6 flex-shrink-0" />
            <span className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-200 lg:group-hover:opacity-100
                ${isStageView ? 'lg:opacity-0' : 'lg:opacity-100'}
            `}>
                Sign Out
            </span>
          </button>
        </div>
    </>
  );

  // Udemy-Style: If on a stage page, we completely hide the global sidebar/header
  // The StageLayout will handle its own "CourseHeader".
  if (isStageView) {
      return (
        <div className="h-screen bg-black overflow-hidden">
            {children}
        </div>
      );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
          <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <span className="text-lg font-bold text-gray-900">Design Portal</span>
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-gray-600">
              <Menu className="w-6 h-6" />
          </button>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative bg-white w-64 h-full shadow-xl flex flex-col">
                <div className="flex justify-end p-4">
                    <button onClick={() => setMobileMenuOpen(false)}>
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>
                <NavContent />
            </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside 
        className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex-col shadow-sm"
      >
        <NavContent />
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full lg:ml-64 w-full lg:w-[calc(100%-16rem)] pt-16 lg:pt-0">
        <main className="flex-1 overflow-auto h-full">
            {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
