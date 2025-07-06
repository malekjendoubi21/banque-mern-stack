import React from 'react';
import { AdminThemeProvider } from '../contexts/AdminThemeContext';

const AdminWrapper = ({ children }) => {
  return (
    <AdminThemeProvider>
      {children}
    </AdminThemeProvider>
  );
};

export default AdminWrapper;
