
import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "./contexts/auth";
import ScrollToTop from "./components/ScrollToTop";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminCheck } from "./components/AdminCheck";
import { ProfileCheck } from "./components/ProfileCheck";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Account from "./pages/Account";
import Wallet from "./pages/Wallet";
import Questionnaire from "./pages/Questionnaire";
import ProfileAnalysis from "./pages/ProfileAnalysis";
import Portfolios from "./pages/Portfolios";
import Investment from "./pages/Investment";
import Assistant_Admin from "./pages/Assistant_Admin";
import NotFound from "./pages/NotFound";
import IndexedDocuments from "./pages/IndexedDocuments";

function App() {
  return (
    <div className="App">
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            }
          />
          <Route path="/questionnaire" element={<Questionnaire />} />
          <Route
            path="/profile"
            element={
              <ProfileCheck>
                <ProfileAnalysis />
              </ProfileCheck>
            }
          />
          <Route path="/portfolios" element={<Portfolios />} />
          <Route path="/investment" element={<Investment />} />
          <Route
            path="/adminllm"
            element={
              <AdminCheck>
                <Assistant_Admin />
              </AdminCheck>
            }
          />
          <Route
            path="/assistant_admin"
            element={
              <AdminCheck>
                <Assistant_Admin />
              </AdminCheck>
            }
          />
          <Route
            path="/documents/indexed"
            element={
              <AdminCheck>
                <IndexedDocuments />
              </AdminCheck>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
      <Toaster />
    </div>
  );
}

export default App;
