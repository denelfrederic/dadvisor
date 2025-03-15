import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Questionnaire from "./pages/Questionnaire";
import Portfolios from "./pages/Portfolios";
import Wallet from "./pages/Wallet";
import Account from "./pages/Account";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/questionnaire" element={<Questionnaire />} />
          <Route path="/portfolios" element={<Portfolios />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
