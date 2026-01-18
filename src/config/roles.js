/**
 * Role-Based Access Control (RBAC) Configuration
 * Centralizes all role definitions, permissions, and route access
 */

// Canonical role names (use these everywhere)
export const ROLES = {
  INSURANCE_MANAGER: 'INSURANCE_MANAGER',
  MEDICAL_ADMIN: 'MEDICAL_ADMIN',
  COORDINATION_ADMIN: 'COORDINATION_ADMIN',
  INSURANCE_CLIENT: 'INSURANCE_CLIENT',
  DOCTOR: 'DOCTOR',
  PHARMACIST: 'PHARMACIST',
  LAB_TECH: 'LAB_TECH',
  RADIOLOGIST: 'RADIOLOGIST',
};

// Provider roles (healthcare providers who can submit claims)
export const PROVIDER_ROLES = {
  DOCTOR: 'DOCTOR',
  PHARMACIST: 'PHARMACIST',
  LAB_TECH: 'LAB_TECH',
  RADIOLOGIST: 'RADIOLOGIST',
  INSURANCE_CLIENT: 'INSURANCE_CLIENT',
};

// Role aliases that might come from backend (normalize these)
export const ROLE_ALIASES = {
  // Standard format
  INSURANCE_MANAGER: ROLES.INSURANCE_MANAGER,
  MEDICAL_ADMIN: ROLES.MEDICAL_ADMIN,
  COORDINATION_ADMIN: ROLES.COORDINATION_ADMIN,
  INSURANCE_CLIENT: ROLES.INSURANCE_CLIENT,
  DOCTOR: ROLES.DOCTOR,
  PHARMACIST: ROLES.PHARMACIST,
  LAB_TECH: ROLES.LAB_TECH,
  RADIOLOGIST: ROLES.RADIOLOGIST,

  // With ROLE_ prefix
  ROLE_INSURANCE_MANAGER: ROLES.INSURANCE_MANAGER,
  ROLE_MEDICAL_ADMIN: ROLES.MEDICAL_ADMIN,
  ROLE_COORDINATION_ADMIN: ROLES.COORDINATION_ADMIN,
  ROLE_INSURANCE_CLIENT: ROLES.INSURANCE_CLIENT,
  ROLE_DOCTOR: ROLES.DOCTOR,
  ROLE_PHARMACIST: ROLES.PHARMACIST,
  ROLE_LAB_TECH: ROLES.LAB_TECH,
  ROLE_RADIOLOGIST: ROLES.RADIOLOGIST,
};

// Role display names
export const ROLE_DISPLAY_NAMES = {
  [ROLES.INSURANCE_MANAGER]: 'Insurance Manager',
  [ROLES.MEDICAL_ADMIN]: 'Medical Administrator',
  [ROLES.COORDINATION_ADMIN]: 'Coordination Administrator',
  [ROLES.INSURANCE_CLIENT]: 'Insurance Client',
  [ROLES.DOCTOR]: 'Doctor',
  [ROLES.PHARMACIST]: 'Pharmacist',
  [ROLES.LAB_TECH]: 'Lab Technician',
  [ROLES.RADIOLOGIST]: 'Radiologist',
};

// Dashboard routes for each role
export const ROLE_DASHBOARDS = {
  [ROLES.INSURANCE_MANAGER]: '/ManagerDashboard',
  [ROLES.MEDICAL_ADMIN]: '/MedicalAdminDashboard',
  [ROLES.COORDINATION_ADMIN]: '/CoordinationDashboard',
  [ROLES.INSURANCE_CLIENT]: '/ClientDashboard',
  [ROLES.DOCTOR]: '/DoctorDashboard',
  [ROLES.PHARMACIST]: '/PharmacistDashboard',
  [ROLES.LAB_TECH]: '/LabDashboard',
  [ROLES.RADIOLOGIST]: '/RadiologyDashboard',
};

// Permissions for each role
export const PERMISSIONS = {
  // Claim operations
  SUBMIT_CLAIM: 'SUBMIT_CLAIM',
  VIEW_OWN_CLAIMS: 'VIEW_OWN_CLAIMS',
  VIEW_ALL_CLAIMS: 'VIEW_ALL_CLAIMS',
  REVIEW_CLAIMS_MEDICAL: 'REVIEW_CLAIMS_MEDICAL',
  REVIEW_CLAIMS_COORDINATION: 'REVIEW_CLAIMS_COORDINATION',
  APPROVE_CLAIM_MEDICAL: 'APPROVE_CLAIM_MEDICAL',
  REJECT_CLAIM_MEDICAL: 'REJECT_CLAIM_MEDICAL',
  APPROVE_CLAIM_FINAL: 'APPROVE_CLAIM_FINAL',
  REJECT_CLAIM_FINAL: 'REJECT_CLAIM_FINAL',
  RETURN_CLAIM: 'RETURN_CLAIM',

  // Client operations
  VIEW_CLIENTS: 'VIEW_CLIENTS',
  APPROVE_CLIENTS: 'APPROVE_CLIENTS',
  MANAGE_CLIENTS: 'MANAGE_CLIENTS',

  // Provider operations
  CREATE_PRESCRIPTION: 'CREATE_PRESCRIPTION',
  CREATE_LAB_REQUEST: 'CREATE_LAB_REQUEST',
  CREATE_RADIOLOGY_REQUEST: 'CREATE_RADIOLOGY_REQUEST',
  VIEW_MEDICAL_RECORDS: 'VIEW_MEDICAL_RECORDS',
  CREATE_MEDICAL_RECORD: 'CREATE_MEDICAL_RECORD',

  // Admin operations
  MANAGE_POLICIES: 'MANAGE_POLICIES',
  MANAGE_ACCOUNTS: 'MANAGE_ACCOUNTS',
  VIEW_REPORTS: 'VIEW_REPORTS',
  MANAGE_PROVIDERS: 'MANAGE_PROVIDERS',

  // Emergency operations
  MANAGE_EMERGENCIES: 'MANAGE_EMERGENCIES',
  VIEW_EMERGENCIES: 'VIEW_EMERGENCIES',
};

// Permissions assigned to each role
export const ROLE_PERMISSIONS = {
  [ROLES.INSURANCE_MANAGER]: [
    // God mode - INSURANCE_MANAGER has access to ALL permissions
    // Claim operations
    PERMISSIONS.SUBMIT_CLAIM,
    PERMISSIONS.VIEW_OWN_CLAIMS,
    PERMISSIONS.VIEW_ALL_CLAIMS,
    PERMISSIONS.REVIEW_CLAIMS_MEDICAL,
    PERMISSIONS.REVIEW_CLAIMS_COORDINATION,
    PERMISSIONS.APPROVE_CLAIM_MEDICAL,
    PERMISSIONS.REJECT_CLAIM_MEDICAL,
    PERMISSIONS.APPROVE_CLAIM_FINAL,
    PERMISSIONS.REJECT_CLAIM_FINAL,
    PERMISSIONS.RETURN_CLAIM,
    // Client operations
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.APPROVE_CLIENTS,
    PERMISSIONS.MANAGE_CLIENTS,
    // Provider operations
    PERMISSIONS.CREATE_PRESCRIPTION,
    PERMISSIONS.CREATE_LAB_REQUEST,
    PERMISSIONS.CREATE_RADIOLOGY_REQUEST,
    PERMISSIONS.VIEW_MEDICAL_RECORDS,
    PERMISSIONS.CREATE_MEDICAL_RECORD,
    // Admin operations
    PERMISSIONS.MANAGE_POLICIES,
    PERMISSIONS.MANAGE_ACCOUNTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_PROVIDERS,
    // Emergency operations
    PERMISSIONS.MANAGE_EMERGENCIES,
    PERMISSIONS.VIEW_EMERGENCIES,
  ],
  [ROLES.MEDICAL_ADMIN]: [
    PERMISSIONS.REVIEW_CLAIMS_MEDICAL,
    PERMISSIONS.APPROVE_CLAIM_MEDICAL,
    PERMISSIONS.REJECT_CLAIM_MEDICAL,
    PERMISSIONS.VIEW_ALL_CLAIMS,
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.VIEW_MEDICAL_RECORDS,
    PERMISSIONS.MANAGE_EMERGENCIES,
    PERMISSIONS.VIEW_EMERGENCIES,
  ],
  [ROLES.COORDINATION_ADMIN]: [
    PERMISSIONS.REVIEW_CLAIMS_COORDINATION,
    PERMISSIONS.APPROVE_CLAIM_FINAL,
    PERMISSIONS.REJECT_CLAIM_FINAL,
    PERMISSIONS.RETURN_CLAIM,
    PERMISSIONS.VIEW_ALL_CLAIMS,
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.SUBMIT_CLAIM,
  ],
  [ROLES.INSURANCE_CLIENT]: [
    PERMISSIONS.SUBMIT_CLAIM,
    PERMISSIONS.VIEW_OWN_CLAIMS,
    PERMISSIONS.VIEW_MEDICAL_RECORDS,
  ],
  [ROLES.DOCTOR]: [
    PERMISSIONS.SUBMIT_CLAIM,
    PERMISSIONS.VIEW_OWN_CLAIMS,
    PERMISSIONS.CREATE_PRESCRIPTION,
    PERMISSIONS.CREATE_LAB_REQUEST,
    PERMISSIONS.CREATE_RADIOLOGY_REQUEST,
    PERMISSIONS.CREATE_MEDICAL_RECORD,
    PERMISSIONS.VIEW_MEDICAL_RECORDS,
  ],
  [ROLES.PHARMACIST]: [
    PERMISSIONS.SUBMIT_CLAIM,
    PERMISSIONS.VIEW_OWN_CLAIMS,
    PERMISSIONS.VIEW_MEDICAL_RECORDS,
  ],
  [ROLES.LAB_TECH]: [
    PERMISSIONS.SUBMIT_CLAIM,
    PERMISSIONS.VIEW_OWN_CLAIMS,
    PERMISSIONS.VIEW_MEDICAL_RECORDS,
  ],
  [ROLES.RADIOLOGIST]: [
    PERMISSIONS.SUBMIT_CLAIM,
    PERMISSIONS.VIEW_OWN_CLAIMS,
    PERMISSIONS.VIEW_MEDICAL_RECORDS,
  ],
};

// Route access configuration
export const ROUTE_ACCESS = {
  // Public routes (no auth required)
  '/LandingPage': { public: true },
  '/About': { public: true },
  '/Help': { public: true },
  '/reset-password': { public: true },
  '/verify-email': { public: true },

  // Manager routes
  '/ManagerDashboard': { roles: [ROLES.INSURANCE_MANAGER] },
  '/PolicyList': { roles: [ROLES.INSURANCE_MANAGER] },
  '/ClaimsReport': { roles: [ROLES.INSURANCE_MANAGER] },
  '/FinancialReport': { roles: [ROLES.INSURANCE_MANAGER] },
  '/ProvidersReport': { roles: [ROLES.INSURANCE_MANAGER] },
  '/PendingRequests': { roles: [ROLES.INSURANCE_MANAGER] },
  '/ManageNotifications': { roles: [ROLES.INSURANCE_MANAGER] },
  '/PendingSearchProfiles': { roles: [ROLES.INSURANCE_MANAGER] },
  '/Profile': { roles: [ROLES.INSURANCE_MANAGER] },
  '/AdminRegisterAccounts': { roles: [ROLES.INSURANCE_MANAGER] },
  '/ProviderPriceList': { roles: [ROLES.INSURANCE_MANAGER] },

  // Medical Admin routes - INSURANCE_MANAGER has god mode access
  '/MedicalAdminDashboard': { roles: [ROLES.MEDICAL_ADMIN, ROLES.INSURANCE_MANAGER] },
  '/MedicalClaimsReview': { roles: [ROLES.MEDICAL_ADMIN, ROLES.INSURANCE_MANAGER] },
  '/MedicalDecisionsList': { roles: [ROLES.MEDICAL_ADMIN, ROLES.INSURANCE_MANAGER] },
  '/ChronicPatientsManagement': { roles: [ROLES.MEDICAL_ADMIN, ROLES.INSURANCE_MANAGER] },
  '/MedicalAdminEmergencyRequests': { roles: [ROLES.MEDICAL_ADMIN, ROLES.INSURANCE_MANAGER] },

  // Coordination Admin routes - INSURANCE_MANAGER has god mode access
  '/CoordinationDashboard': { roles: [ROLES.COORDINATION_ADMIN, ROLES.INSURANCE_MANAGER] },
  '/CoordinationClaimsList': { roles: [ROLES.COORDINATION_ADMIN, ROLES.INSURANCE_MANAGER] },
  '/CoordinationClaimsManage': { roles: [ROLES.COORDINATION_ADMIN, ROLES.INSURANCE_MANAGER] },
  '/ClaimsManage': { roles: [ROLES.COORDINATION_ADMIN, ROLES.INSURANCE_MANAGER] },

  // Client routes - INSURANCE_MANAGER has god mode access
  '/ClientDashboard': { roles: [ROLES.INSURANCE_CLIENT, ROLES.INSURANCE_MANAGER] },
  '/AddClaim': { roles: [ROLES.INSURANCE_CLIENT, ROLES.COORDINATION_ADMIN, ROLES.INSURANCE_MANAGER] },

  // Healthcare Provider routes - INSURANCE_MANAGER has god mode access
  '/DoctorDashboard': { roles: [ROLES.DOCTOR, ROLES.INSURANCE_MANAGER] },
  '/PharmacistDashboard': { roles: [ROLES.PHARMACIST, ROLES.INSURANCE_MANAGER] },
  '/LabDashboard': { roles: [ROLES.LAB_TECH, ROLES.INSURANCE_MANAGER] },
  '/RadiologyDashboard': { roles: [ROLES.RADIOLOGIST, ROLES.INSURANCE_MANAGER] },
};

/**
 * Normalize a role string to canonical format
 * @param {string} role - Role string (may have ROLE_ prefix)
 * @returns {string} - Canonical role name
 */
export const normalizeRole = (role) => {
  if (!role) return null;
  return ROLE_ALIASES[role] || role;
};

/**
 * Normalize an array of roles
 * @param {string[]} roles - Array of role strings
 * @returns {string[]} - Array of canonical role names
 */
export const normalizeRoles = (roles) => {
  if (!Array.isArray(roles)) return [];
  return roles.map(normalizeRole).filter(Boolean);
};

/**
 * Check if user has a specific role
 * @param {string[]} userRoles - User's roles
 * @param {string} requiredRole - Required role
 * @returns {boolean}
 */
export const hasRole = (userRoles, requiredRole) => {
  const normalizedUserRoles = normalizeRoles(userRoles);
  const normalizedRequired = normalizeRole(requiredRole);
  return normalizedUserRoles.includes(normalizedRequired);
};

/**
 * Check if user has any of the specified roles
 * @param {string[]} userRoles - User's roles
 * @param {string[]} requiredRoles - Required roles (any match)
 * @returns {boolean}
 */
export const hasAnyRole = (userRoles, requiredRoles) => {
  const normalizedUserRoles = normalizeRoles(userRoles);
  const normalizedRequired = normalizeRoles(requiredRoles);
  return normalizedRequired.some(role => normalizedUserRoles.includes(role));
};

/**
 * Check if user has a specific permission
 * @param {string[]} userRoles - User's roles
 * @param {string} permission - Required permission
 * @returns {boolean}
 */
export const hasPermission = (userRoles, permission) => {
  const normalizedUserRoles = normalizeRoles(userRoles);

  return normalizedUserRoles.some(role => {
    const rolePerms = ROLE_PERMISSIONS[role];
    return rolePerms && rolePerms.includes(permission);
  });
};

/**
 * Check if user can access a route
 * @param {string[]} userRoles - User's roles
 * @param {string} route - Route path
 * @returns {boolean}
 */
export const canAccessRoute = (userRoles, route) => {
  const routeConfig = ROUTE_ACCESS[route];

  // If route not configured, deny access
  if (!routeConfig) return false;

  // Public routes
  if (routeConfig.public) return true;

  // Check role requirements
  if (routeConfig.roles) {
    return hasAnyRole(userRoles, routeConfig.roles);
  }

  // If no specific requirements, allow authenticated access
  return true;
};

/**
 * Get the dashboard route for a user based on their primary role
 * @param {string[]} userRoles - User's roles
 * @returns {string} - Dashboard route
 */
export const getDashboardRoute = (userRoles) => {
  const normalizedRoles = normalizeRoles(userRoles);

  // Priority order for dashboard selection
  const priorityOrder = [
    ROLES.INSURANCE_MANAGER,
    ROLES.MEDICAL_ADMIN,
    ROLES.COORDINATION_ADMIN,
    ROLES.DOCTOR,
    ROLES.PHARMACIST,
    ROLES.LAB_TECH,
    ROLES.RADIOLOGIST,
    ROLES.INSURANCE_CLIENT,
  ];

  for (const role of priorityOrder) {
    if (normalizedRoles.includes(role)) {
      return ROLE_DASHBOARDS[role];
    }
  }

  // Default fallback
  return '/LandingPage';
};

/**
 * Get all permissions for a user
 * @param {string[]} userRoles - User's roles
 * @returns {string[]} - Array of permission names
 */
export const getUserPermissions = (userRoles) => {
  const normalizedRoles = normalizeRoles(userRoles);
  const permissions = new Set();

  normalizedRoles.forEach(role => {
    const rolePerms = ROLE_PERMISSIONS[role] || [];
    rolePerms.forEach(perm => permissions.add(perm));
  });

  return Array.from(permissions);
};

/**
 * Get display name for a role
 * @param {string} role - Role name
 * @returns {string} - Display name
 */
export const getRoleDisplayName = (role) => {
  const normalized = normalizeRole(role);
  return ROLE_DISPLAY_NAMES[normalized] || role;
};

/**
 * Check if user is a healthcare provider
 * @param {string[]} userRoles - User's roles
 * @returns {boolean}
 */
export const isHealthcareProvider = (userRoles) => {
  const providerRoles = [ROLES.DOCTOR, ROLES.PHARMACIST, ROLES.LAB_TECH, ROLES.RADIOLOGIST];
  return hasAnyRole(userRoles, providerRoles);
};

/**
 * Check if user is an admin
 * @param {string[]} userRoles - User's roles
 * @returns {boolean}
 */
export const isAdmin = (userRoles) => {
  const adminRoles = [ROLES.INSURANCE_MANAGER, ROLES.MEDICAL_ADMIN, ROLES.COORDINATION_ADMIN];
  return hasAnyRole(userRoles, adminRoles);
};

export default {
  ROLES,
  PROVIDER_ROLES,
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
};
