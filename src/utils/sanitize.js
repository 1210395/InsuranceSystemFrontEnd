/**
 * Input Sanitization Utilities
 * Prevents XSS attacks and sanitizes user input
 */

// HTML entities to escape
const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} str - Input string to sanitize
 * @returns {string} - Sanitized string
 */
export const escapeHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char]);
};

/**
 * Sanitize a string by removing potentially dangerous characters
 * @param {string} str - Input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;

  // Remove null bytes
  let sanitized = str.replace(/\0/g, '');

  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove on* event handlers
  sanitized = sanitized.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\bon\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:/gi, '');

  // Remove vbscript: protocol
  sanitized = sanitized.replace(/vbscript:/gi, '');

  return sanitized.trim();
};

/**
 * Sanitize an object recursively
 * @param {Object} obj - Object to sanitize
 * @returns {Object} - Sanitized object
 */
export const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key of Object.keys(obj)) {
      sanitized[sanitizeString(key)] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }

  return obj;
};

/**
 * Sanitize form data before submission
 * @param {Object} formData - Form data object
 * @returns {Object} - Sanitized form data
 */
export const sanitizeFormData = (formData) => {
  return sanitizeObject(formData);
};

/**
 * Remove all HTML tags from a string
 * @param {string} str - Input string
 * @returns {string} - String without HTML tags
 */
export const stripHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '').trim();
};

/**
 * Sanitize a URL
 * @param {string} url - URL to sanitize
 * @returns {string|null} - Sanitized URL or null if invalid
 */
export const sanitizeUrl = (url) => {
  if (typeof url !== 'string') return null;

  const trimmed = url.trim();

  // Check for dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowercaseUrl = trimmed.toLowerCase();

  for (const protocol of dangerousProtocols) {
    if (lowercaseUrl.startsWith(protocol)) {
      return null;
    }
  }

  // Only allow http, https, and relative URLs
  if (trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('/') ||
      trimmed.startsWith('./') ||
      trimmed.startsWith('../')) {
    return trimmed;
  }

  // If no protocol, assume relative URL
  if (!trimmed.includes('://')) {
    return trimmed;
  }

  return null;
};

/**
 * Sanitize filename
 * @param {string} filename - Filename to sanitize
 * @returns {string} - Sanitized filename
 */
export const sanitizeFilename = (filename) => {
  if (typeof filename !== 'string') return 'file';

  // Remove path separators and dangerous characters
  return filename
    .replace(/[/\\:*?"<>|]/g, '_')
    .replace(/\.{2,}/g, '.')
    .trim() || 'file';
};

/**
 * Convert Arabic-Indic digits to Latin digits
 * @param {string} str - Input string
 * @returns {string} - String with Latin digits
 */
export const toLatinDigits = (str) => {
  if (typeof str !== 'string') return str;

  const arabicIndicDigits = '٠١٢٣٤٥٦٧٨٩';
  const extendedArabicDigits = '۰۱۲۳۴۵۶۷۸۹';
  const latinDigits = '0123456789';

  let result = str;

  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(arabicIndicDigits[i], 'g'), latinDigits[i]);
    result = result.replace(new RegExp(extendedArabicDigits[i], 'g'), latinDigits[i]);
  }

  return result;
};

/**
 * Sanitize phone number
 * @param {string} phone - Phone number to sanitize
 * @returns {string} - Sanitized phone number
 */
export const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') return '';

  // Convert Arabic digits to Latin
  const latinPhone = toLatinDigits(phone);

  // Keep only digits, plus sign, and common separators
  return latinPhone.replace(/[^\d+\-\s()]/g, '').trim();
};

/**
 * Sanitize email address
 * @param {string} email - Email to sanitize
 * @returns {string} - Sanitized email
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return '';

  return email.toLowerCase().trim();
};

export default {
  escapeHtml,
  sanitizeString,
  sanitizeObject,
  sanitizeFormData,
  stripHtml,
  sanitizeUrl,
  sanitizeFilename,
  toLatinDigits,
  sanitizePhone,
  sanitizeEmail,
};
