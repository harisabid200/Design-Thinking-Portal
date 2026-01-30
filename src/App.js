import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { ProjectProvider } from './context/ProjectContext';
import { CourseContentProvider } from './context/CourseContentContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Layout from './components/Layout';
import CoursePlayerPage from './pages/CoursePlayerPage';
import InstructorPage from './pages/InstructorPage';
import InstructorRoute from './components/InstructorRoute';

// Protected Route Wrapper
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <ProjectProvider>
          <CourseContentProvider>
            <Router>  
              <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route 
                path="/*" 
                element={
                  <PrivateRoute>
                    <Layout>
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        
                        {/* Unified Course Player Route - Handles all stages */}
                        <Route path="/stage/:stageId" element={<CoursePlayerPage />} />
                        
                        <Route path="/instructor" element={<InstructorRoute><InstructorPage /></InstructorRoute>} />
                        
                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                      </Routes>
                    </Layout>
                  </PrivateRoute>
                } 
              />
            </Routes>
          </Router>
          </CourseContentProvider>
        </ProjectProvider>
      </ProgressProvider>
    </AuthProvider>
  );
}

export default App;

