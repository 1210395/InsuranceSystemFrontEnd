/**
 * Logger utility for frontend - replaces console.log in production
 * In production, logs are suppressed or sent to monitoring service
 */

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log('[LOG]', ...args);
    }
  },

  info: (...args) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },

  warn: (...args) => {
    // Always show warnings
    console.warn('[WARN]', ...args);
  },

  error: (...args) => {
    // Always show errors
    console.error('[ERROR]', ...args);
    // In production, you could send to error monitoring service here
    // if (!isDevelopment) { sendToMonitoringService(args); }
  },

  debug: (...args) => {
    if (isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  },

  table: (...args) => {
    if (isDevelopment) {
      console.table(...args);
    }
  },

  // For API responses
  apiError: (endpoint, error) => {
    const message = error?.response?.data?.message || error?.message || 'Unknown error';
    console.error(`[API ERROR] ${endpoint}:`, message);
  }
};

export default logger;
