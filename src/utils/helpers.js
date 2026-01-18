/**
 * General Helper Utilities
 * Common utility functions used across the application
 */

/**
 * Format date to localized string
 * @param {string|Date} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '—';

  const {
    locale = 'en-US',
    includeTime = false,
    format = 'medium', // 'short', 'medium', 'long', 'full'
  } = options;

  try {
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return '—';
    }

    const dateOptions = {
      year: 'numeric',
      month: format === 'short' ? 'numeric' : 'short',
      day: 'numeric',
    };

    if (includeTime) {
      dateOptions.hour = '2-digit';
      dateOptions.minute = '2-digit';
    }

    return dateObj.toLocaleDateString(locale, dateOptions);
  } catch {
    return '—';
  }
};

/**
 * Format date as relative time (e.g., "2 hours ago")
 * @param {string|Date} timestamp - Timestamp to format
 * @returns {string} - Relative time string
 */
export const timeSince = (timestamp) => {
  if (!timestamp) return '—';

  try {
    const now = new Date();
    const past = new Date(timestamp);

    if (isNaN(past.getTime())) {
      return '—';
    }

    const diffMs = now - past;

    // Handle future dates
    if (diffMs < 0) {
      return 'Just now';
    }

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    if (weeks === 1) return '1 week ago';
    if (weeks < 4) return `${weeks} weeks ago`;
    if (months === 1) return '1 month ago';
    if (months < 12) return `${months} months ago`;
    if (years === 1) return '1 year ago';
    return `${years} years ago`;
  } catch {
    return '—';
  }
};

/**
 * Format date for input field (YYYY-MM-DD)
 * @param {string|Date} date - Date to format
 * @returns {string} - Date string in YYYY-MM-DD format
 */
export const formatDateForInput = (date) => {
  if (!date) return '';

  try {
    const dateObj = new Date(date);

    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return dateObj.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} - Today's date
 */
export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit how often a function can be called
 * @param {Function} func - Function to throttle
 * @param {number} limit - Minimum time between calls in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;

  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} - Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (Array.isArray(obj)) {
    return obj.map(deepClone);
  }

  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }

  return cloned;
};

/**
 * Parse JSON safely
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} - Parsed value or default
 */
export const safeJsonParse = (jsonString, defaultValue = null) => {
  if (!jsonString) return defaultValue;

  if (typeof jsonString === 'object') {
    return jsonString;
  }

  try {
    return JSON.parse(jsonString);
  } catch {
    return defaultValue;
  }
};

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
export const capitalizeFirst = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert camelCase to Title Case
 * @param {string} str - camelCase string
 * @returns {string} - Title Case string
 */
export const camelToTitle = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Generate a unique ID
 * @param {string} prefix - Optional prefix
 * @returns {string} - Unique ID
 */
export const generateId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value - Value to check
 * @returns {boolean} - True if empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Download a blob as a file
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Filename for download
 */
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
};

/**
 * Get file extension from filename
 * @param {string} filename - Filename
 * @returns {string} - File extension (lowercase)
 */
export const getFileExtension = (filename) => {
  if (!filename || typeof filename !== 'string') return '';
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.slice(lastDot + 1).toLowerCase();
};

/**
 * Check if file is an image
 * @param {string} filename - Filename or path
 * @returns {boolean} - True if image
 */
export const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  const ext = getFileExtension(filename);
  return imageExtensions.includes(ext);
};

/**
 * Check if file is a PDF
 * @param {string} filename - Filename or path
 * @returns {boolean} - True if PDF
 */
export const isPdfFile = (filename) => {
  return getFileExtension(filename) === 'pdf';
};

/**
 * Format file size to human readable string
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size string
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';

  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

/**
 * Scroll to element smoothly
 * @param {string|HTMLElement} element - Element or selector
 * @param {Object} options - Scroll options
 */
export const scrollToElement = (element, options = {}) => {
  const { offset = 0, behavior = 'smooth' } = options;

  const el = typeof element === 'string' ? document.querySelector(element) : element;

  if (el) {
    const top = el.getBoundingClientRect().top + window.pageYOffset + offset;
    window.scrollTo({ top, behavior });
  }
};

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string|Function} key - Key or getter function
 * @returns {Object} - Grouped object
 */
export const groupBy = (array, key) => {
  if (!Array.isArray(array)) return {};

  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    (result[groupKey] = result[groupKey] || []).push(item);
    return result;
  }, {});
};

/**
 * Sort array by key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} - Sorted array
 */
export const sortBy = (array, key, order = 'asc') => {
  if (!Array.isArray(array)) return [];

  return [...array].sort((a, b) => {
    const valueA = a[key];
    const valueB = b[key];

    if (valueA === valueB) return 0;

    // Handle null/undefined
    if (valueA == null) return order === 'asc' ? 1 : -1;
    if (valueB == null) return order === 'asc' ? -1 : 1;

    // Handle dates
    if (valueA instanceof Date && valueB instanceof Date) {
      return order === 'asc' ? valueA - valueB : valueB - valueA;
    }

    // Handle strings
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return order === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    // Handle numbers
    return order === 'asc' ? valueA - valueB : valueB - valueA;
  });
};

export default {
  formatDate,
  timeSince,
  formatDateForInput,
  getTodayDate,
  debounce,
  throttle,
  deepClone,
  safeJsonParse,
  capitalizeFirst,
  camelToTitle,
  truncateText,
  generateId,
  isEmpty,
  downloadBlob,
  copyToClipboard,
  getFileExtension,
  isImageFile,
  isPdfFile,
  formatFileSize,
  scrollToElement,
  groupBy,
  sortBy,
};
