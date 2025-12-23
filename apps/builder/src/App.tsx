import { Routes, Route } from 'react-router-dom';
import BuilderLayout from './components/Layout/BuilderLayout';
import LandingPage from './components/Landing/LandingPage';
import LoginPage from './components/Auth/LoginPage';
import SignupPage from './components/Auth/SignupPage';
import ForgotPasswordPage from './components/Auth/ForgotPasswordPage';
import ResetPasswordPage from './components/Auth/ResetPasswordPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import SmartRedirect from './components/Auth/SmartRedirect';
import Dashboard from './components/Dashboard/Dashboard';
import LayoutGallery from './components/Dashboard/LayoutGallery';

// Static Pages
import PricingPage from './components/Pages/Support/PricingPage';
import FAQsPage from './components/Pages/Support/FAQsPage';
import HelpCenterPage from './components/Pages/Support/HelpCenterPage';
import TutorialsPage from './components/Pages/Support/TutorialsPage';
import APIDocsPage from './components/Pages/Support/APIDocsPage';

import AboutPage from './components/Pages/Company/AboutPage';
import ContactPage from './components/Pages/Company/ContactPage';
import BlogPage from './components/Pages/Company/BlogPage';
import CareersPage from './components/Pages/Company/CareersPage';
import PressPage from './components/Pages/Company/PressPage';

import LayoutsGalleryPage from './components/Pages/Layouts/LayoutsGalleryPage';
import LayoutCategoryPage from './components/Pages/Layouts/LayoutCategoryPage';

import PrivacyPage from './components/Pages/Legal/PrivacyPage';
import TermsPage from './components/Pages/Legal/TermsPage';
import CookiesPage from './components/Pages/Legal/CookiesPage';

function App(): JSX.Element {
  return (
    <div className="app">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Static Pages - Layouts */}
        <Route path="/layouts-gallery" element={<LayoutsGalleryPage />} />
        <Route path="/layouts/:category" element={<LayoutCategoryPage />} />
        
        {/* Static Pages - Support */}
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/faqs" element={<FAQsPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/tutorials" element={<TutorialsPage />} />
        <Route path="/api-docs" element={<APIDocsPage />} />
        
        {/* Static Pages - Company */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/press" element={<PressPage />} />
        
        {/* Static Pages - Legal */}
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        
        {/* Smart redirect after login - goes to dashboard or layouts based on user state */}
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
        
        {/* Layout Gallery - browse and select layouts */}
        <Route 
          path="/layouts" 
          element={
            <ProtectedRoute>
              <LayoutGallery />
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

