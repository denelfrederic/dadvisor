
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

/**
 * Chargement paresseux des pages pour de meilleures performances
 * Permet de réduire la taille du bundle initial et d'accélérer le chargement initial
 */
const Auth = lazy(() => import("./pages/Auth"));
const Questionnaire = lazy(() => import("./pages/Questionnaire"));
const Portfolios = lazy(() => import("./pages/Portfolios"));
const Wallet = lazy(() => import("./pages/Wallet"));
const Investment = lazy(() => import("./pages/Investment"));

// Client pour React Query - gestion des requêtes et du cache
const queryClient = new QueryClient();

/**
 * Composant principal de l'application
 * Configure les providers et le routage de l'application
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/questionnaire" element={<Questionnaire />} />
            <Route path="/portfolios" element={<Portfolios />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/investment" element={<Investment />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
