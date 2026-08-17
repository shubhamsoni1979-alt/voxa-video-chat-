import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { MarqueeBanner } from '../components/MarqueeBanner';
import { Hero } from '../components/Hero';
import { HowItWorks } from '../components/HowItWorks';
import { TrustSafety } from '../components/TrustSafety';
import { SafetyNoticeModal } from '../components/SafetyNoticeModal';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, openLoginModal } = useAuth();
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  const handleStartRequest = () => {
    if (!isLoggedIn) {
      openLoginModal('/chat');
    } else {
      setIsSafetyModalOpen(true);
    }
  };

  const handleConfirmSafety = () => {
    setIsSafetyModalOpen(false);
    navigate('/chat');
  };

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar onStartClick={handleStartRequest} />
      <MarqueeBanner />
      
      <main className="flex-grow">
        <Hero onStartClick={handleStartRequest} onHowItWorksClick={scrollToHowItWorks} />
        <HowItWorks />
        <TrustSafety />
      </main>

      <Footer />

      <SafetyNoticeModal
        isOpen={isSafetyModalOpen}
        onConfirm={handleConfirmSafety}
        onCancel={() => setIsSafetyModalOpen(false)}
      />
    </div>
  );
};
