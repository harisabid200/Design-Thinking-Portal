import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Layout from './components/Layout';
import Empathise from './pages/Empathise';
import InstructorPage from './pages/InstructorPage';

import { ProgressProvider } from './context/ProgressContext';

// Protected Route Wrapper
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
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
                    <Route path="/stage/empathise" element={<Empathise />} />
                    <Route path="/instructor" element={<InstructorPage />} />
                    {/* Placeholder for dynamic stage routes */}
                    <Route path="/stage/:stageId" element={<div className="p-8">Stage content coming soon...</div>} />
                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            } 
          />
        </Routes>
      </Router>
      </ProgressProvider>
    </AuthProvider>
  );
}

export default App;
