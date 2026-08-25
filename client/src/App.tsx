import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Home } from './pages/Home';
import { VideoChat } from './pages/VideoChat';
import { Safety } from './pages/Safety';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { NotFound } from './pages/NotFound';

const ProtectedVideoChatRoute: React.FC = () => {
  const { isLoggedIn, openLoginModal } = useAuth();

  if (!isLoggedIn) {
    // Open login modal and redirect to home
    setTimeout(() => {
      openLoginModal('/chat');
    }, 100);
    return <Navigate to="/" replace />;
  }

  return <VideoChat />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<ProtectedVideoChatRoute />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
