/**
 * Claim Status State Machine
 * Defines the complete claim lifecycle with valid transitions
 *
 * CLAIM WORKFLOW:
 * 1. Client/Provider submits claim -> PENDING_MEDICAL
 * 2. Medical Admin reviews -> APPROVED_MEDICAL or REJECTED_MEDICAL
 * 3. Approved claims go to Coordination -> AWAITING_COORDINATION_REVIEW
 * 4. Coordination Admin can:
 *    - Approve final -> APPROVED_FINAL -> PAYMENT_PENDING -> PAID
 *    - Reject final -> REJECTED_FINAL
 *    - Return to Medical -> RETURNED_FOR_REVIEW
 *    - Return to Provider -> RETURNED_TO_PROVIDER
 */

// All possible claim statuses (matching api.js and database constraint)
export const CLAIM_STATUS = {
  // Initial state when claim is submitted
  PENDING_MEDICAL: 'PENDING_MEDICAL',

  // After Medical Admin approves (waiting for Coordination)
  APPROVED_MEDICAL: 'APPROVED_MEDICAL',
  AWAITING_COORDINATION_REVIEW: 'AWAITING_COORDINATION_REVIEW',

  // After Medical Admin rejects
  REJECTED_MEDICAL: 'REJECTED_MEDICAL',

  // Final states after Coordination Admin decision
  APPROVED_FINAL: 'APPROVED_FINAL',
  REJECTED_FINAL: 'REJECTED_FINAL',

  // Returned from Coordination to Medical for re-review
  RETURNED_FOR_REVIEW: 'RETURNED_FOR_REVIEW',

  // Returned from Coordination to Provider for corrections
  RETURNED_TO_PROVIDER: 'RETURNED_TO_PROVIDER',

  // Payment states
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAID: 'PAID',

  // Legacy statuses (for backward compatibility)
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  APPROVED_BY_MEDICAL: 'APPROVED_BY_MEDICAL',
  PENDING_COORDINATION: 'PENDING_COORDINATION', // Alias for AWAITING_COORDINATION_REVIEW
};

// Valid status transitions (following the documented workflow)
export const VALID_TRANSITIONS = {
  // Medical Admin can approve or reject pending claims
  [CLAIM_STATUS.PENDING_MEDICAL]: [
    CLAIM_STATUS.APPROVED_MEDICAL,
    CLAIM_STATUS.REJECTED_MEDICAL,
  ],

  // After medical approval, claim goes to coordination review
  [CLAIM_STATUS.APPROVED_MEDICAL]: [
    CLAIM_STATUS.AWAITING_COORDINATION_REVIEW,
  ],

  // Coordination Admin can approve, reject, return to medical, or return to provider
  [CLAIM_STATUS.AWAITING_COORDINATION_REVIEW]: [
    CLAIM_STATUS.APPROVED_FINAL,
    CLAIM_STATUS.REJECTED_FINAL,
    CLAIM_STATUS.RETURNED_FOR_REVIEW,
    CLAIM_STATUS.RETURNED_TO_PROVIDER,
  ],

  // Medical rejection is terminal
  [CLAIM_STATUS.REJECTED_MEDICAL]: [],

  // Final approval leads to payment processing
  [CLAIM_STATUS.APPROVED_FINAL]: [
    CLAIM_STATUS.PAYMENT_PENDING,
  ],

  // Final rejection is terminal
  [CLAIM_STATUS.REJECTED_FINAL]: [],

  // Returned for review goes back to medical admin
  [CLAIM_STATUS.RETURNED_FOR_REVIEW]: [
    CLAIM_STATUS.APPROVED_MEDICAL,
    CLAIM_STATUS.REJECTED_MEDICAL,
  ],

  // Returned to provider - provider resubmits as new pending claim
  [CLAIM_STATUS.RETURNED_TO_PROVIDER]: [
    CLAIM_STATUS.PENDING_MEDICAL,
  ],

  // Payment pending can be marked as paid
  [CLAIM_STATUS.PAYMENT_PENDING]: [
    CLAIM_STATUS.PAID,
  ],

  // Paid is terminal (irreversible)
  [CLAIM_STATUS.PAID]: [],
};

// Status display configuration with visual styling
export const STATUS_CONFIG = {
  // PENDING_MEDICAL - Yellow/Orange for pending status
  'PENDING_MEDICAL': {
    label: 'Pending Medical Review',
    shortLabel: 'Pending',
    color: 'warning',
    bgColor: '#FFF3E0',
    textColor: '#E65100',
    borderColor: '#FF9800',
    icon: 'MedicalServices',
    description: 'Waiting for medical team to review the claim',
    isTerminal: false,
    requiresAction: true,
    actionRole: 'MEDICAL_ADMIN',
  },
  // APPROVED_MEDICAL - Blue for in-progress
  'APPROVED_MEDICAL': {
    label: 'Approved by Medical',
    shortLabel: 'Medical Approved',
    color: 'info',
    bgColor: '#E3F2FD',
    textColor: '#1565C0',
    borderColor: '#2196F3',
    icon: 'CheckCircle',
    description: 'Medical team approved, waiting for coordination review',
    isTerminal: false,
    requiresAction: true,
    actionRole: 'COORDINATION_ADMIN',
  },
  // AWAITING_COORDINATION_REVIEW - Purple/Indigo for coordination review
  'AWAITING_COORDINATION_REVIEW': {
    label: 'Awaiting Coordination Review',
    shortLabel: 'Coord Review',
    color: 'info',
    bgColor: '#E8EAF6',
    textColor: '#3949AB',
    borderColor: '#3F51B5',
    icon: 'Assignment',
    description: 'Waiting for coordination admin to make final decision',
    isTerminal: false,
    requiresAction: true,
    actionRole: 'COORDINATION_ADMIN',
  },
  // REJECTED_MEDICAL - Red for medical rejection
  'REJECTED_MEDICAL': {
    label: 'Rejected by Medical',
    shortLabel: 'Rejected',
    color: 'error',
    bgColor: '#FFEBEE',
    textColor: '#C62828',
    borderColor: '#F44336',
    icon: 'Cancel',
    description: 'Claim was rejected by medical team',
    isTerminal: true,
    requiresAction: false,
    actionRole: null,
  },
  // APPROVED_FINAL - Green for final approval
  'APPROVED_FINAL': {
    label: 'Approved',
    shortLabel: 'Approved',
    color: 'success',
    bgColor: '#E8F5E9',
    textColor: '#1B5E20',
    borderColor: '#4CAF50',
    icon: 'CheckCircle',
    description: 'Claim has been fully approved for payment',
    isTerminal: false,
    requiresAction: true,
    actionRole: 'COORDINATION_ADMIN',
  },
  // REJECTED_FINAL - Red for final rejection
  'REJECTED_FINAL': {
    label: 'Rejected',
    shortLabel: 'Rejected',
    color: 'error',
    bgColor: '#FFEBEE',
    textColor: '#B71C1C',
    borderColor: '#F44336',
    icon: 'Cancel',
    description: 'Claim has been rejected',
    isTerminal: true,
    requiresAction: false,
    actionRole: null,
  },
  // RETURNED_FOR_REVIEW - Orange for returned to medical
  'RETURNED_FOR_REVIEW': {
    label: 'Returned for Review',
    shortLabel: 'Returned',
    color: 'warning',
    bgColor: '#FFF8E1',
    textColor: '#F57F17',
    borderColor: '#FFC107',
    icon: 'Replay',
    description: 'Claim returned to medical admin for re-review',
    isTerminal: false,
    requiresAction: true,
    actionRole: 'MEDICAL_ADMIN',
  },
  // RETURNED_TO_PROVIDER - Orange for returned to provider
  'RETURNED_TO_PROVIDER': {
    label: 'Returned to Provider',
    shortLabel: 'Provider Fix',
    color: 'warning',
    bgColor: '#FFF8E1',
    textColor: '#F57F17',
    borderColor: '#FFC107',
    icon: 'Undo',
    description: 'Claim returned to provider for corrections',
    isTerminal: false,
    requiresAction: true,
    actionRole: 'PROVIDER',
  },
  // PAYMENT_PENDING - Light blue for pending payment
  'PAYMENT_PENDING': {
    label: 'Payment Pending',
    shortLabel: 'Pay Pending',
    color: 'info',
    bgColor: '#B3E5FC',
    textColor: '#01579B',
    borderColor: '#03A9F4',
    icon: 'AccountBalance',
    description: 'Awaiting payment processing',
    isTerminal: false,
    requiresAction: true,
    actionRole: 'COORDINATION_ADMIN',
  },
  // PAID - Green for completed payment
  'PAID': {
    label: 'Paid',
    shortLabel: 'Paid',
    color: 'success',
    bgColor: '#C8E6C9',
    textColor: '#1B5E20',
    borderColor: '#4CAF50',
    icon: 'Paid',
    description: 'Payment has been processed',
    isTerminal: true,
    requiresAction: false,
    actionRole: null,
  },

  // Legacy statuses (for backward compatibility)
  'PENDING': {
    label: 'Pending Medical Review',
    shortLabel: 'Pending',
    color: 'warning',
    bgColor: '#FFF3E0',
    textColor: '#E65100',
    borderColor: '#FF9800',
    icon: 'MedicalServices',
    description: 'Waiting for medical team to review the claim',
    isTerminal: false,
    requiresAction: true,
    actionRole: 'MEDICAL_ADMIN',
  },
  'APPROVED_BY_MEDICAL': {
    label: 'Approved by Medical',
    shortLabel: 'Medical Approved',
    color: 'info',
    bgColor: '#E3F2FD',
    textColor: '#1565C0',
    borderColor: '#2196F3',
    icon: 'CheckCircle',
    description: 'Medical team approved, waiting for coordination review',
    isTerminal: false,
    requiresAction: true,
    actionRole: 'COORDINATION_ADMIN',
  },
  'APPROVED': {
    label: 'Approved',
    shortLabel: 'Approved',
    color: 'success',
    bgColor: '#E8F5E9',
    textColor: '#1B5E20',
    borderColor: '#4CAF50',
    icon: 'CheckCircle',
    description: 'Claim has been fully approved',
    isTerminal: true,
    requiresAction: false,
    actionRole: null,
  },
  'REJECTED': {
    label: 'Rejected',
    shortLabel: 'Rejected',
    color: 'error',
    bgColor: '#FFEBEE',
    textColor: '#B71C1C',
    borderColor: '#F44336',
    icon: 'Cancel',
    description: 'Claim has been rejected',
    isTerminal: true,
    requiresAction: false,
    actionRole: null,
  },
  'PENDING_COORDINATION': {
    label: 'Pending Coordination Review',
    shortLabel: 'Coord Review',
    color: 'info',
    bgColor: '#E8EAF6',
    textColor: '#3949AB',
    borderColor: '#3F51B5',
    icon: 'Assignment',
    description: 'Waiting for coordination admin to make final decision',
    isTerminal: false,
    requiresAction: true,
    actionRole: 'COORDINATION_ADMIN',
  },
};

export const isValidTransition = (currentStatus, newStatus) => {
  const validNextStates = VALID_TRANSITIONS[currentStatus];
  if (!validNextStates) return false;
  return validNextStates.includes(newStatus);
};

export const getNextStatuses = (currentStatus) => {
  return VALID_TRANSITIONS[currentStatus] || [];
};

export const isTerminalStatus = (status) => {
  const config = STATUS_CONFIG[status];
  return config ? config.isTerminal : false;
};

export const requiresAction = (status) => {
  const config = STATUS_CONFIG[status];
  return config ? config.requiresAction : false;
};

export const getActionRole = (status) => {
  const config = STATUS_CONFIG[status];
  return config ? config.actionRole : null;
};

export const getStatusConfig = (status) => {
  return STATUS_CONFIG[status] || {
    label: status,
    shortLabel: status,
    color: 'default',
    bgColor: '#F5F5F5',
    textColor: '#616161',
    borderColor: '#9E9E9E',
    icon: 'Help',
    description: 'Unknown status',
    isTerminal: false,
    requiresAction: false,
    actionRole: null,
  };
};

export const getStatusLabel = (status, short = false) => {
  const config = getStatusConfig(status);
  return short ? config.shortLabel : config.label;
};

export const getStatusColor = (status) => {
  const config = getStatusConfig(status);
  return config.color;
};

export const getStatusBorderColor = (status) => {
  const config = getStatusConfig(status);
  return config.borderColor;
};

export const getStatusBgColor = (status) => {
  const config = getStatusConfig(status);
  return config.bgColor;
};

export const categorizeClaims = (claims) => {
  return {
    pendingMedical: claims.filter(c =>
      c.status === CLAIM_STATUS.PENDING_MEDICAL ||
      c.status === CLAIM_STATUS.RETURNED_FOR_REVIEW ||
      c.status === CLAIM_STATUS.PENDING // Legacy
    ),
    pendingCoordination: claims.filter(c =>
      c.status === CLAIM_STATUS.APPROVED_MEDICAL ||
      c.status === CLAIM_STATUS.AWAITING_COORDINATION_REVIEW ||
      c.status === CLAIM_STATUS.PENDING_COORDINATION || // Legacy
      c.status === CLAIM_STATUS.APPROVED_BY_MEDICAL // Legacy
    ),
    approved: claims.filter(c =>
      c.status === CLAIM_STATUS.APPROVED_FINAL ||
      c.status === CLAIM_STATUS.PAYMENT_PENDING ||
      c.status === CLAIM_STATUS.PAID ||
      c.status === CLAIM_STATUS.APPROVED // Legacy
    ),
    rejected: claims.filter(c =>
      c.status === CLAIM_STATUS.REJECTED_MEDICAL ||
      c.status === CLAIM_STATUS.REJECTED_FINAL ||
      c.status === CLAIM_STATUS.REJECTED // Legacy
    ),
    returnedToProvider: claims.filter(c =>
      c.status === CLAIM_STATUS.RETURNED_TO_PROVIDER
    ),
  };
};

export const getWorkflowProgress = (status) => {
  switch (status) {
    // Initial submission
    case CLAIM_STATUS.PENDING_MEDICAL:
    case CLAIM_STATUS.PENDING: // Legacy
      return 20;

    // Returned states
    case CLAIM_STATUS.RETURNED_FOR_REVIEW:
    case CLAIM_STATUS.RETURNED_TO_PROVIDER:
      return 30;

    // Medical approved, waiting for coordination
    case CLAIM_STATUS.APPROVED_MEDICAL:
    case CLAIM_STATUS.AWAITING_COORDINATION_REVIEW:
    case CLAIM_STATUS.PENDING_COORDINATION: // Legacy
    case CLAIM_STATUS.APPROVED_BY_MEDICAL: // Legacy
      return 50;

    // Medical rejection (terminal)
    case CLAIM_STATUS.REJECTED_MEDICAL:
      return 100;

    // Final approval, pending payment
    case CLAIM_STATUS.APPROVED_FINAL:
    case CLAIM_STATUS.PAYMENT_PENDING:
      return 80;

    // Final rejection (terminal)
    case CLAIM_STATUS.REJECTED_FINAL:
    case CLAIM_STATUS.REJECTED: // Legacy
      return 100;

    // Paid (terminal)
    case CLAIM_STATUS.PAID:
    case CLAIM_STATUS.APPROVED: // Legacy
      return 100;

    default:
      return 0;
  }
};

export default {
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
  getStatusBorderColor,
  getStatusBgColor,
  categorizeClaims,
  getWorkflowProgress,
};
