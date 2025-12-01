import { Routes, Route } from 'react-router-dom';
import BuilderLayout from './components/Layout/BuilderLayout';
import LandingPage from './components/Landing/LandingPage';
import LoginPage from './components/Auth/LoginPage';
import SignupPage from './components/Auth/SignupPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route 
          path="/builder" 
          element={
            <ProtectedRoute>
              <BuilderLayout />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;

