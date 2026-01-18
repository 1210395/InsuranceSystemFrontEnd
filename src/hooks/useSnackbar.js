import { useState, useCallback } from 'react';

/**
 * Custom hook for snackbar state management
 * Reduces boilerplate in components using snackbar notifications
 */
export const useSnackbar = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const showSuccess = useCallback((message) => {
    setSnackbar({ open: true, message, severity: 'success' });
  }, []);

  const showError = useCallback((message) => {
    setSnackbar({ open: true, message, severity: 'error' });
  }, []);

  const showWarning = useCallback((message) => {
    setSnackbar({ open: true, message, severity: 'warning' });
  }, []);

  const showInfo = useCallback((message) => {
    setSnackbar({ open: true, message, severity: 'info' });
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  return {
    snackbar,
    setSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeSnackbar
  };
};

export default useSnackbar;
