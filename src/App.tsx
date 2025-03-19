
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import GeminiChat from './components/GeminiChat';
import Auth from './pages/Auth';
import { AuthProvider } from './contexts/auth';
import AdminCheck from './pages/AdminCheck';
import Assistant_Admin from './pages/Assistant_Admin';
import DocumentDetailDialog from './components/document/DocumentDetailDialog';
import PineconeConfig from "./pages/PineconeConfig";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/chat" element={<GeminiChat />} />
          <Route path="/adminllm" element={
            <AdminCheck>
              <Assistant_Admin />
            </AdminCheck>
          } />
          <Route path="/document/:id" element={<DocumentDetailDialog documentId={null} isOpen={true} onClose={() => {}} />} />
          <Route path="/pinecone-config" element={
            <AdminCheck>
              <PineconeConfig />
            </AdminCheck>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
