import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Chat from './components/chat/Chat';
import Auth from './components/auth/Auth';
import { AuthProvider } from './components/auth/AuthContext';
import AdminCheck from './components/auth/AdminCheck';
import Assistant_Admin from './pages/Assistant_Admin';
import DocumentDetail from './components/document/DocumentDetail';
import PineconeConfig from "./pages/PineconeConfig";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/adminllm" element={
            <AdminCheck>
              <Assistant_Admin />
            </AdminCheck>
          } />
          <Route path="/document/:id" element={<DocumentDetail />} />
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
