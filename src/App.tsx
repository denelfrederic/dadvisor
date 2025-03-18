import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster"

// Import pages
import Index from './pages/Index';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import ProfileAnalysis from './pages/ProfileAnalysis';
import Account from './pages/Account';
import Questionnaire from './pages/Questionnaire';
import Investment from './pages/Investment';
import Portfolios from './pages/Portfolios';
import Wallet from './pages/Wallet';
import NotFound from './pages/NotFound';
import AdminCheck from './pages/AdminCheck';
import Assistant_Admin from './pages/Assistant_Admin';

// Import contexts
import { AuthProvider } from './contexts/auth';
import { QuestionnaireProvider } from './contexts/questionnaire';

// Import components
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <QuestionnaireProvider>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/profile-analysis" element={<ProfileAnalysis />} />
              {/* Redirection de /profile vers /profile-analysis */}
              <Route path="/profile" element={<Navigate to="/profile-analysis" replace />} />
              <Route path="/account" element={<Account />} />
              <Route path="/questionnaire" element={<Questionnaire />} />
              <Route path="/investment" element={<Investment />} />
              <Route path="/portfolios" element={<Portfolios />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/admin-check" element={<AdminCheck />} />
              <Route path="/assistant" element={<Assistant_Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </QuestionnaireProvider>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
