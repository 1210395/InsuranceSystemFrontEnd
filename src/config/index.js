/**
 * Config Index
 * Central export for all configuration modules
 */

// API Configuration
export {
  API_BASE_URL,
  API_ENDPOINTS,
  CLAIM_STATUS as API_CLAIM_STATUS,
  CLAIM_STATUS_CONFIG as API_CLAIM_STATUS_CONFIG,
  PROVIDER_ROLES,
  USER_ROLES,
  CURRENCY,
  formatCurrency
} from './api';

// Claim State Machine
export {
  CLAIM_STATUS,
  VALID_TRANSITIONS,
  STATUS_CONFIG,
  isValidTransition,
  getNextStatuses,
  isTerminalStatus,
  requiresAction,
  getActionRole,
  getStatusConfig,
  getStatusLabel,
  getStatusColor,
  categorizeClaims,
  getWorkflowProgress,
} from './claimStateMachine';

// Role-Based Access Control
export {
  ROLES,
  ROLE_ALIASES,
  ROLE_DISPLAY_NAMES,
  ROLE_DASHBOARDS,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROUTE_ACCESS,
  normalizeRole,
  normalizeRoles,
  hasRole,
  hasAnyRole,
  hasPermission,
  canAccessRoute,
  getDashboardRoute,
  getUserPermissions,
  getRoleDisplayName,
  isHealthcareProvider,
  isAdmin,
} from './roles';
