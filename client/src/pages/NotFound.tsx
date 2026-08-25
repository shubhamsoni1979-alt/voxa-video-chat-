import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Home, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-3xl bg-[#B8001C]/10 border border-[#B8001C]/20 text-[#B8001C] flex items-center justify-center mx-auto shadow-sm">
            <span className="text-3xl font-black font-heading">404</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold font-heading text-slate-900">Page Not Found</h1>
            <p className="text-slate-600 text-sm font-sans">
              The page you are looking for doesn't exist or has been moved.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center space-x-2 spidey2-btn-black text-white px-6 py-3 rounded-full text-sm font-bold shadow-md hover:scale-105 transition-transform"
          >
            <Home className="w-4 h-4" />
            <span>Return to Voxa Home</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};
