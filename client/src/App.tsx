import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Home } from './pages/Home';
import { VideoChat } from './pages/VideoChat';
import { Safety } from './pages/Safety';
import { Privacy } from './pages/Privacy';

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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
