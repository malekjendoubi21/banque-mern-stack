import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminThemeContext = createContext();

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
};

export const AdminThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Récupérer le thème depuis localStorage ou utiliser le thème par défaut
    const savedTheme = localStorage.getItem('admin-theme');
    return savedTheme === 'dark';
  });

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Récupérer l'état de la sidebar depuis localStorage
    const savedSidebarState = localStorage.getItem('admin-sidebar-open');
    return savedSidebarState !== null ? JSON.parse(savedSidebarState) : true;
  });

  const [fontAwesomeLoaded, setFontAwesomeLoaded] = useState(false);

  // Appliquer le thème au document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('admin-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('admin-theme', 'light');
    }
  }, [isDarkMode]);

  // Sauvegarder l'état de la sidebar
  useEffect(() => {
    localStorage.setItem('admin-sidebar-open', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  // Vérifier si Font Awesome est chargé
  useEffect(() => {
    const checkFontAwesome = () => {
      const testElement = document.createElement('i');
      testElement.className = 'fas fa-home';
      testElement.style.visibility = 'hidden';
      testElement.style.position = 'absolute';
      document.body.appendChild(testElement);
      
      const beforeContent = window.getComputedStyle(testElement, ':before').content;
      const isLoaded = beforeContent !== 'none' && beforeContent !== '""' && beforeContent !== '';
      setFontAwesomeLoaded(isLoaded);
      
      if (isLoaded) {
        document.body.classList.add('font-awesome-loaded');
      } else {
        document.body.classList.remove('font-awesome-loaded');
      }
      
      document.body.removeChild(testElement);
    };

    const timer = setTimeout(checkFontAwesome, 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const value = {
    isDarkMode,
    sidebarOpen,
    fontAwesomeLoaded,
    toggleTheme,
    toggleSidebar,
    setIsDarkMode,
    setSidebarOpen,
    setFontAwesomeLoaded
  };

  return (
    <AdminThemeContext.Provider value={value}>
      {children}
    </AdminThemeContext.Provider>
  );
};

export default AdminThemeContext;
