import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup'

  // Check existing session on application mount
  useEffect(() => {
    let mounted = true;
    authService
      .getMe()
      .then((userData) => {
        if (mounted && userData) {
          setUser(userData);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async ({ email, password }) => {
    const loggedUser = await authService.login({ email, password });
    setUser(loggedUser);
    closeAuthModal();
    return loggedUser;
  };

  const signup = async ({ name, email, password }) => {
    const result = await authService.signup({ name, email, password });
    return result;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const isAdmin = Boolean(user && user.role === 'admin');

  const value = {
    user,
    isAdmin,
    loading,
    isAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    openAuthModal,
    closeAuthModal,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
