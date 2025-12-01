import { Routes, Route } from 'react-router-dom';
import BuilderLayout from './components/Layout/BuilderLayout';
import LandingPage from './components/Landing/LandingPage';
import LoginPage from './components/Auth/LoginPage';
import SignupPage from './components/Auth/SignupPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import SmartRedirect from './components/Auth/SmartRedirect';
import Dashboard from './components/Dashboard/Dashboard';
import TemplateGallery from './components/Dashboard/TemplateGallery';

function App() {
  return (
    <div className="app">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Smart redirect after login - goes to dashboard or templates based on user state */}
        <Route 
          path="/app" 
          element={
            <ProtectedRoute>
              <SmartRedirect />
            </ProtectedRoute>
          } 
        />
        
        {/* Dashboard - shows user's invitations */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Template Gallery - browse and select templates */}
        <Route 
          path="/templates" 
          element={
            <ProtectedRoute>
              <TemplateGallery />
            </ProtectedRoute>
          } 
        />
        
        {/* Builder with specific invitation */}
        <Route 
          path="/builder/:invitationId" 
          element={
            <ProtectedRoute>
              <BuilderLayout />
            </ProtectedRoute>
          } 
        />
        
        {/* Legacy builder route - redirect to dashboard */}
        <Route 
          path="/builder" 
          element={
            <ProtectedRoute>
              <SmartRedirect />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
