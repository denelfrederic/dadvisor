
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";

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
import Contact from './pages/Contact';
import About from './pages/About';
import Vision from './pages/Vision';
import Roadmap from './pages/Roadmap';
import Dao from './pages/Dao';
import Faq from './pages/Faq';
import MyAdvisor from './pages/MyAdvisor';
import MyPortfolioCreator from './pages/MyPortfolioCreator';

// Import contexts
import { AuthProvider } from './contexts/auth';
import { QuestionnaireProvider } from './contexts/questionnaire';

// Import components
import ScrollToTop from './components/ScrollToTop';

/**
 * Composant principal de l'application
 * Définit toutes les routes et les contextes globaux
 */
function App() {
  console.log("App component rendering");
  
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
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/vision" element={<Vision />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/dao" element={<Dao />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/myadvisor" element={<MyAdvisor />} />
              <Route path="/myportfoliocreator" element={<MyPortfolioCreator />} />
              <Route path="/admin-check" element={<AdminCheck />} />
              <Route path="/adminllm" element={<Assistant_Admin />} />
              {/* Redirection de /assistant vers /adminllm */}
              <Route path="/assistant" element={<Navigate to="/adminllm" replace />} />
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
