/**
 * Form Validation Utilities
 * Comprehensive validation for all form inputs
 */

import { toLatinDigits } from './sanitize';

/**
 * Validation result type
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the value is valid
 * @property {string} error - Error message if invalid
 */

/**
 * Validate required field
 * @param {*} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {ValidationResult}
 */
export const validateRequired = (value, fieldName = 'This field') => {
  const isValid = value !== null && value !== undefined && String(value).trim() !== '';
  return {
    isValid,
    error: isValid ? '' : `${fieldName} is required`,
  };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {ValidationResult}
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email.trim());

  return {
    isValid,
    error: isValid ? '' : 'Please enter a valid email address',
  };
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {ValidationResult}
 */
export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Convert Arabic digits to Latin
  const latinPhone = toLatinDigits(phone);

  // Remove common formatting characters
  const cleanPhone = latinPhone.replace(/[\s\-()]/g, '');

  // Check if it's a valid phone format (7-15 digits, optionally starting with +)
  const phoneRegex = /^\+?\d{7,15}$/;
  const isValid = phoneRegex.test(cleanPhone);

  return {
    isValid,
    error: isValid ? '' : 'Please enter a valid phone number',
  };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @returns {ValidationResult}
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecial = false,
  } = options;

  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  const errors = [];

  if (password.length < minLength) {
    errors.push(`at least ${minLength} characters`);
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('one uppercase letter');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('one lowercase letter');
  }

  if (requireNumber && !/\d/.test(password)) {
    errors.push('one number');
  }

  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('one special character');
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    error: isValid ? '' : `Password must contain ${errors.join(', ')}`,
  };
};

/**
 * Validate password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {ValidationResult}
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  const isValid = password === confirmPassword;
  return {
    isValid,
    error: isValid ? '' : 'Passwords do not match',
  };
};

/**
 * Validate amount (positive number)
 * @param {number|string} amount - Amount to validate
 * @param {Object} options - Validation options
 * @returns {ValidationResult}
 */
export const validateAmount = (amount, options = {}) => {
  const {
    required = true,
    min = 0,
    max = 1000000,
    allowZero = false,
  } = options;

  if (required && (amount === null || amount === undefined || amount === '')) {
    return { isValid: false, error: 'Amount is required' };
  }

  if (!required && (amount === null || amount === undefined || amount === '')) {
    return { isValid: true, error: '' };
  }

  // Convert Arabic digits if present
  const latinAmount = typeof amount === 'string' ? toLatinDigits(amount) : amount;
  const numAmount = parseFloat(latinAmount);

  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }

  if (!allowZero && numAmount === 0) {
    return { isValid: false, error: 'Amount must be greater than zero' };
  }

  if (numAmount < min) {
    return { isValid: false, error: `Amount must be at least ${min}` };
  }

  if (numAmount > max) {
    return { isValid: false, error: `Amount cannot exceed ${max}` };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate date
 * @param {string|Date} date - Date to validate
 * @param {Object} options - Validation options
 * @returns {ValidationResult}
 */
export const validateDate = (date, options = {}) => {
  const {
    required = true,
    allowFuture = false,
    allowPast = true,
    maxPastDays = 365,
    maxFutureDays = 0,
  } = options;

  if (required && !date) {
    return { isValid: false, error: 'Date is required' };
  }

  if (!required && !date) {
    return { isValid: true, error: '' };
  }

  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Please enter a valid date' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateOnly = new Date(dateObj);
  dateOnly.setHours(0, 0, 0, 0);

  // Check future date
  if (!allowFuture && dateOnly > today) {
    return { isValid: false, error: 'Date cannot be in the future' };
  }

  // Check past date
  if (!allowPast && dateOnly < today) {
    return { isValid: false, error: 'Date cannot be in the past' };
  }

  // Check max past days
  if (maxPastDays > 0 && allowPast) {
    const maxPastDate = new Date(today);
    maxPastDate.setDate(maxPastDate.getDate() - maxPastDays);

    if (dateOnly < maxPastDate) {
      return { isValid: false, error: `Date cannot be more than ${maxPastDays} days in the past` };
    }
  }

  // Check max future days
  if (maxFutureDays > 0 && allowFuture) {
    const maxFutureDate = new Date(today);
    maxFutureDate.setDate(maxFutureDate.getDate() + maxFutureDays);

    if (dateOnly > maxFutureDate) {
      return { isValid: false, error: `Date cannot be more than ${maxFutureDays} days in the future` };
    }
  }

  return { isValid: true, error: '' };
};

/**
 * Validate national ID
 * @param {string} nationalId - National ID to validate
 * @returns {ValidationResult}
 */
export const validateNationalId = (nationalId) => {
  if (!nationalId || !nationalId.trim()) {
    return { isValid: false, error: 'National ID is required' };
  }

  // Convert Arabic digits to Latin
  const latinId = toLatinDigits(nationalId.trim());

  // Palestinian National ID is 9 digits
  const isValid = /^\d{9}$/.test(latinId);

  return {
    isValid,
    error: isValid ? '' : 'National ID must be 9 digits',
  };
};

/**
 * Validate employee ID
 * @param {string} employeeId - Employee ID to validate
 * @returns {ValidationResult}
 */
export const validateEmployeeId = (employeeId) => {
  if (!employeeId || !employeeId.trim()) {
    return { isValid: false, error: 'Employee ID is required' };
  }

  // Convert Arabic digits to Latin
  const latinId = toLatinDigits(employeeId.trim());

  // Allow alphanumeric employee IDs (3-20 characters)
  const isValid = /^[A-Za-z0-9]{3,20}$/.test(latinId);

  return {
    isValid,
    error: isValid ? '' : 'Please enter a valid Employee ID (3-20 alphanumeric characters)',
  };
};

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {ValidationResult}
 */
export const validateFile = (file, options = {}) => {
  const {
    required = true,
    maxSizeMB = 5,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  } = options;

  if (required && !file) {
    return { isValid: false, error: 'File is required' };
  }

  if (!required && !file) {
    return { isValid: true, error: '' };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes
      .map((type) => type.split('/')[1])
      .join(', ');
    return { isValid: false, error: `Allowed file types: ${allowedExtensions}` };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate multiple files
 * @param {File[]} files - Array of files to validate
 * @param {Object} options - Validation options
 * @returns {ValidationResult}
 */
export const validateFiles = (files, options = {}) => {
  const {
    required = true,
    maxFiles = 5,
    maxSizeMB = 5,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  } = options;

  if (required && (!files || files.length === 0)) {
    return { isValid: false, error: 'At least one file is required' };
  }

  if (!required && (!files || files.length === 0)) {
    return { isValid: true, error: '' };
  }

  if (files.length > maxFiles) {
    return { isValid: false, error: `Maximum ${maxFiles} files allowed` };
  }

  // Validate each file
  for (let i = 0; i < files.length; i++) {
    const result = validateFile(files[i], { required: true, maxSizeMB, allowedTypes });
    if (!result.isValid) {
      return { isValid: false, error: `File ${i + 1}: ${result.error}` };
    }
  }

  return { isValid: true, error: '' };
};

/**
 * Validate a form object with multiple fields
 * @param {Object} formData - Form data to validate
 * @param {Object} rules - Validation rules for each field
 * @returns {Object} - Object with isValid boolean and errors object
 */
export const validateForm = (formData, rules) => {
  const errors = {};
  let isValid = true;

  for (const [field, validators] of Object.entries(rules)) {
    const value = formData[field];

    for (const validator of validators) {
      const result = validator(value, formData);

      if (!result.isValid) {
        errors[field] = result.error;
        isValid = false;
        break; // Stop at first error for this field
      }
    }
  }

  return { isValid, errors };
};

/**
 * Create a custom validator function
 * @param {Function} validateFn - Validation function that returns boolean
 * @param {string} errorMessage - Error message if validation fails
 * @returns {Function} - Validator function
 */
export const createValidator = (validateFn, errorMessage) => {
  return (value, formData) => {
    const isValid = validateFn(value, formData);
    return { isValid, error: isValid ? '' : errorMessage };
  };
};

export default {
  validateRequired,
  validateEmail,
  validatePhone,
  validatePassword,
  validatePasswordMatch,
  validateAmount,
  validateDate,
  validateNationalId,
  validateEmployeeId,
  validateFile,
  validateFiles,
  validateForm,
  createValidator,
};
