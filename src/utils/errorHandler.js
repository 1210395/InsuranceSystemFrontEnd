/**
 * Centralized error handling utilities
 */

// Extract user-friendly error message from various error formats
export const getErrorMessage = (error, defaultMessage = 'An error occurred') => {
  if (!error) return defaultMessage;

  // Handle axios/api errors
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }

  return defaultMessage;
};

// Standard error handler for API calls
export const handleApiError = (error, showSnackbar, customMessage) => {
  const message = customMessage || getErrorMessage(error);

  if (showSnackbar) {
    showSnackbar({
      open: true,
      message,
      severity: 'error'
    });
  }

  return message;
};

// Wrapper for async operations with error handling
export const withErrorHandling = async (asyncFn, showSnackbar, errorMessage) => {
  try {
    return await asyncFn();
  } catch (error) {
    handleApiError(error, showSnackbar, errorMessage);
    return null;
  }
};

export default {
  getErrorMessage,
  handleApiError,
  withErrorHandling
};
