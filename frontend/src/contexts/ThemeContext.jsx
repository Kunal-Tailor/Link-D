import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // Check system preference
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  useEffect(() => {
    // Save theme preference
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // Update document class for global styles
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: {
      primary: isDarkMode ? '#3B82F6' : '#0A66C2',
      secondary: isDarkMode ? '#1E40AF' : '#004182',
      background: isDarkMode ? '#0F172A' : '#FFFFFF',
      surface: isDarkMode ? '#1E293B' : '#F8FAFC',
      surfaceElevated: isDarkMode ? '#334155' : '#FFFFFF',
      text: isDarkMode ? '#F1F5F9' : '#1E293B',
      textSecondary: isDarkMode ? '#94A3B8' : '#64748B',
      border: isDarkMode ? '#334155' : '#E2E8F0',
      success: isDarkMode ? '#10B981' : '#059669',
      error: isDarkMode ? '#EF4444' : '#DC2626',
      warning: isDarkMode ? '#F59E0B' : '#D97706',
    },
    glass: {
      background: isDarkMode 
        ? 'rgba(30, 41, 59, 0.8)' 
        : 'rgba(255, 255, 255, 0.8)',
      backdrop: 'blur(12px)',
      border: isDarkMode 
        ? '1px solid rgba(148, 163, 184, 0.2)' 
        : '1px solid rgba(255, 255, 255, 0.2)',
      shadow: isDarkMode
        ? '0 8px 32px rgba(0, 0, 0, 0.3)'
        : '0 8px 32px rgba(0, 0, 0, 0.1)',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

