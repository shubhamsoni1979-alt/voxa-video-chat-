import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: (redirectPath?: string) => void;
  closeLoginModal: () => void;
  login: (userData: UserProfile) => void;
  logout: () => void;
  pendingRedirect: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('voxa_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
  }, []);

  const login = (userData: UserProfile) => {
    setUser(userData);
    localStorage.setItem('voxa_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('voxa_user');
  };

  const openLoginModal = (redirectPath?: string) => {
    if (redirectPath) {
      setPendingRedirect(redirectPath);
    }
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setPendingRedirect(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        login,
        logout,
        pendingRedirect,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
