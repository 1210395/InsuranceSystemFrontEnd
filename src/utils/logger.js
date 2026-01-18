/**
 * Production-safe logger utility
 * Only logs in development mode, silent in production
 */

const isDev = import.meta.env.DEV;

const logger = {
  log: (...args) => {
    if (isDev) {
       
      console.log(...args);
    }
  },

  warn: (...args) => {
    if (isDev) {
       
      console.warn(...args);
    }
  },

  error: (...args) => {
    if (isDev) {
       
      console.error(...args);
    }
    // In production, you could send errors to a monitoring service
    // Example: errorReportingService.captureException(args);
  },

  info: (...args) => {
    if (isDev) {
       
      console.info(...args);
    }
  },

  debug: (...args) => {
    if (isDev) {
       
      console.debug(...args);
    }
  },

  table: (...args) => {
    if (isDev) {
       
      console.table(...args);
    }
  },
};

export default logger;
