
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Questionnaire from "./pages/Questionnaire";
import Portfolios from "./pages/Portfolios";
import Wallet from "./pages/Wallet";
import Account from "./pages/Account";
import ProfileAnalysis from "./pages/ProfileAnalysis";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

function App() {
  // Add a simple check to ensure Supabase is accessible
  const [supabaseReady, setSupabaseReady] = useState(false);
  
  useEffect(() => {
    // Simple check to ensure Supabase connection works
    const checkSupabase = async () => {
      try {
        await supabase.auth.getSession();
        setSupabaseReady(true);
      } catch (error) {
        console.error("Supabase connection error:", error);
        // Still set to true to allow the app to render, 
        // but the error is logged for debugging
        setSupabaseReady(true);
      }
    };
    
    checkSupabase();
  }, []);

  // Don't render until we've attempted to connect to Supabase
  if (!supabaseReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-dadvisor-blue border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <Router>
      <Navbar />
      <div>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/questionnaire" element={<Questionnaire />} />
          <Route path="/portfolios" element={<Portfolios />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/account" element={<Account />} />
          <Route path="/profile" element={<ProfileAnalysis />} />
        </Routes>
      </div>
      <Toaster />
    </Router>
  );
}

export default App;
