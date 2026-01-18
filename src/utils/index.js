/**
 * Utils Index
 * Central export for all utility functions
 */

// API Service
export { default as api, apiClient, getToken, setToken, removeToken, getUser, setUser, removeUser, getRoles, setRoles, clearAuthData, isAuthenticated } from './apiService';

// Sanitization
export { escapeHtml, sanitizeString, sanitizeObject, sanitizeFormData, stripHtml, sanitizeUrl, sanitizeFilename, toLatinDigits, sanitizePhone, sanitizeEmail } from './sanitize';

// Validation
export { validateRequired, validateEmail, validatePhone, validatePassword, validatePasswordMatch, validateAmount, validateDate, validateNationalId, validateEmployeeId, validateFile, validateFiles, validateForm, createValidator } from './validation';

// Helpers
export { formatDate, timeSince, formatDateForInput, getTodayDate, debounce, throttle, deepClone, safeJsonParse, capitalizeFirst, camelToTitle, truncateText, generateId, isEmpty, downloadBlob, copyToClipboard, getFileExtension, isImageFile, isPdfFile, formatFileSize, scrollToElement, groupBy, sortBy } from './helpers';
