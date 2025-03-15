
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
import { Toaster } from "@/components/ui/toaster";

function App() {
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
        </Routes>
      </div>
      <Toaster />
    </Router>
  );
}

export default App;
