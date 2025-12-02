import { Routes, Route } from 'react-router-dom';
import BuilderLayout from './components/Layout/BuilderLayout';
import LandingPage from './components/Landing/LandingPage';
import LoginPage from './components/Auth/LoginPage';
import SignupPage from './components/Auth/SignupPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import SmartRedirect from './components/Auth/SmartRedirect';
import Dashboard from './components/Dashboard/Dashboard';
import TemplateGallery from './components/Dashboard/TemplateGallery';

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

import TemplatesGalleryPage from './components/Pages/Templates/TemplatesGalleryPage';
import TemplateCategoryPage from './components/Pages/Templates/TemplateCategoryPage';

import PrivacyPage from './components/Pages/Legal/PrivacyPage';
import TermsPage from './components/Pages/Legal/TermsPage';
import CookiesPage from './components/Pages/Legal/CookiesPage';

function App() {
  return (
    <div className="app">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Static Pages - Templates */}
        <Route path="/templates-gallery" element={<TemplatesGalleryPage />} />
        <Route path="/templates/:category" element={<TemplateCategoryPage />} />
        
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
