/**
 * Optimized Data Fetching Hooks
 * Uses React Query for caching, deduplication, and background refetching
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../utils/apiService';
import { API_ENDPOINTS } from '../config/api';
import { queryKeys, invalidateQueries } from '../config/queryClient';

// ============================================
// AUTH HOOKS
// ============================================

/**
 * Hook to fetch current user data
 * Shared across all dashboards - cached for 5 minutes
 */
export const useCurrentUser = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      const res = await api.get(API_ENDPOINTS.AUTH.ME);
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// ============================================
// NOTIFICATION HOOKS - CRITICAL FOR PERFORMANCE
// ============================================

/**
 * Hook to fetch unread notification count
 * SHARED across all headers/dashboards - prevents duplicate polling
 * Uses 30-second refetch instead of 5-second polling
 */
export const useUnreadNotificationCount = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: async () => {
      const res = await api.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
      return typeof res.data === 'number' ? res.data : parseInt(res.data) || 0;
    },
    // Refetch every 30 seconds instead of 5 seconds (6x reduction in requests)
    refetchInterval: 30000,
    // Allow background refetch
    refetchIntervalInBackground: false,
    // Keep data fresh for 20 seconds
    staleTime: 20000,
    ...options,
  });
};

/**
 * Hook to fetch paginated notifications
 * Supports infinite scroll with pagination
 */
export const useNotifications = (page = 1, limit = 20, options = {}) => {
  return useQuery({
    queryKey: queryKeys.notifications.list(page, limit),
    queryFn: async () => {
      const res = await api.get(`${API_ENDPOINTS.NOTIFICATIONS.BASE}?page=${page}&limit=${limit}`);
      return res.data;
    },
    keepPreviousData: true,
    ...options,
  });
};

/**
 * Mutation to mark notification as read
 */
export const useMarkNotificationRead = () => {
  return useMutation({
    mutationFn: async (notificationId) => {
      const res = await api.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId));
      return res.data;
    },
    onSuccess: () => {
      // Invalidate notification queries to refetch
      invalidateQueries.notifications();
    },
  });
};

/**
 * Mutation to mark all notifications as read
 */
export const useMarkAllNotificationsRead = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await api.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
      return res.data;
    },
    onSuccess: () => {
      invalidateQueries.notifications();
    },
  });
};

// ============================================
// CLAIMS HOOKS
// ============================================

/**
 * Hook to fetch user's claims with pagination
 */
export const useMyClaims = (page = 1, limit = 20, options = {}) => {
  return useQuery({
    queryKey: [...queryKeys.claims.myClaims, { page, limit }],
    queryFn: async () => {
      // Try paginated endpoint first, fallback to regular
      try {
        const res = await api.get(`${API_ENDPOINTS.HEALTHCARE_CLAIMS.MY_CLAIMS}?page=${page}&limit=${limit}`);
        return res.data;
      } catch {
        // Fallback if pagination not supported by backend
        const res = await api.get(API_ENDPOINTS.HEALTHCARE_CLAIMS.MY_CLAIMS);
        const data = res.data || [];
        // Client-side pagination
        const startIndex = (page - 1) * limit;
        return {
          content: data.slice(startIndex, startIndex + limit),
          totalElements: data.length,
          totalPages: Math.ceil(data.length / limit),
          number: page - 1,
        };
      }
    },
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

/**
 * Hook to fetch claims for medical review
 */
export const useMedicalReviewClaims = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.claims.medicalReview,
    queryFn: async () => {
      const res = await api.get(API_ENDPOINTS.HEALTHCARE_CLAIMS.MEDICAL_REVIEW);
      return res.data || [];
    },
    staleTime: 60000, // 1 minute
    ...options,
  });
};

/**
 * Hook to fetch claims for coordination review
 */
export const useCoordinationReviewClaims = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.claims.coordinationReview,
    queryFn: async () => {
      const res = await api.get(API_ENDPOINTS.HEALTHCARE_CLAIMS.COORDINATION_REVIEW);
      return res.data || [];
    },
    staleTime: 60000, // 1 minute
    ...options,
  });
};

/**
 * Mutation to approve medical claim
 */
export const useApproveMedicalClaim = () => {
  return useMutation({
    mutationFn: async ({ claimId, notes }) => {
      const res = await api.patch(API_ENDPOINTS.HEALTHCARE_CLAIMS.APPROVE_MEDICAL(claimId), { notes });
      return res.data;
    },
    onSuccess: () => {
      invalidateQueries.claims();
    },
  });
};

/**
 * Mutation to reject medical claim
 */
export const useRejectMedicalClaim = () => {
  return useMutation({
    mutationFn: async ({ claimId, reason }) => {
      const res = await api.patch(API_ENDPOINTS.HEALTHCARE_CLAIMS.REJECT_MEDICAL(claimId), { reason });
      return res.data;
    },
    onSuccess: () => {
      invalidateQueries.claims();
    },
  });
};

// ============================================
// PRESCRIPTION HOOKS (Pharmacist)
// ============================================

/**
 * Hook to fetch pharmacist's prescription data
 * Combines pending and all prescriptions in a single efficient call
 */
export const usePharmacistPrescriptions = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.prescriptions.all,
    queryFn: async () => {
      // Parallel fetch for efficiency
      const [pendingRes, allRes] = await Promise.all([
        api.get('/api/prescriptions/pending'),
        api.get('/api/prescriptions/all'),
      ]);

      const pending = pendingRes.data || [];
      const all = allRes.data || [];

      // Deduplicate
      const allUnique = all.filter(
        (p) => !pending.some((pend) => pend.id === p.id)
      );

      return {
        pending,
        all: [...pending, ...allUnique],
        pendingCount: pending.length,
        totalCount: pending.length + allUnique.length,
      };
    },
    staleTime: 30000, // 30 seconds
    ...options,
  });
};

/**
 * Hook to fetch pharmacist stats
 */
export const usePharmacistStats = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.prescriptions.stats,
    queryFn: async () => {
      const res = await api.get('/api/prescriptions/pharmacist/stats');
      return res.data;
    },
    staleTime: 60000, // 1 minute
    ...options,
  });
};

/**
 * Mutation to verify prescription
 */
export const useVerifyPrescription = () => {
  return useMutation({
    mutationFn: async ({ id, itemsWithPrices }) => {
      const res = await api.patch(`/api/prescriptions/${id}/verify`, itemsWithPrices);
      return res.data;
    },
    onSuccess: () => {
      invalidateQueries.prescriptions();
    },
  });
};

/**
 * Mutation to reject prescription
 */
export const useRejectPrescription = () => {
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.patch(`/api/prescriptions/${id}/reject`, {});
      return res.data;
    },
    onSuccess: () => {
      invalidateQueries.prescriptions();
    },
  });
};

// ============================================
// LAB HOOKS
// ============================================

/**
 * Hook to fetch lab technician's requests
 */
export const useLabRequests = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.labs.all,
    queryFn: async () => {
      const [pendingRes, myRes] = await Promise.all([
        api.get('/api/labs/pending'),
        api.get('/api/labs/my-requests'),
      ]);

      const pending = Array.isArray(pendingRes.data) ? pendingRes.data : [];
      const my = Array.isArray(myRes.data) ? myRes.data : myRes.data?.content || [];

      // Deduplicate
      const uniqueRequests = Array.from(
        new Map([...pending, ...my].map((item) => [item.id, item])).values()
      );

      return {
        pending,
        all: uniqueRequests,
        pendingCount: pending.length,
        completedCount: my.filter((r) => r.status?.toLowerCase() === 'completed').length,
        totalCount: uniqueRequests.length,
      };
    },
    staleTime: 30000,
    ...options,
  });
};

// ============================================
// RADIOLOGY HOOKS
// ============================================

/**
 * Hook to fetch radiologist's requests
 */
export const useRadiologyRequests = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.radiology.all,
    queryFn: async () => {
      const [pendingRes, myRes] = await Promise.all([
        api.get('/api/radiology/pending'),
        api.get('/api/radiology/my-requests'),
      ]);

      const pending = Array.isArray(pendingRes.data) ? pendingRes.data : [];
      const my = Array.isArray(myRes.data) ? myRes.data : myRes.data?.content || [];

      // Deduplicate
      const uniqueRequests = Array.from(
        new Map([...pending, ...my].map((item) => [item.id, item])).values()
      );

      return {
        pending,
        all: uniqueRequests,
        pendingCount: pending.length,
        completedCount: my.filter((r) => r.status?.toLowerCase() === 'completed').length,
        totalCount: uniqueRequests.length,
      };
    },
    staleTime: 30000,
    ...options,
  });
};

// ============================================
// HEALTHCARE PROVIDER HOOKS
// ============================================

/**
 * Hook to fetch approved healthcare providers
 * Cached for longer since this data changes infrequently
 */
export const useApprovedProviders = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.providers.approved,
    queryFn: async () => {
      const res = await api.get(API_ENDPOINTS.SEARCH_PROFILES.APPROVED);
      // Filter for providers with location data
      return (res.data || []).filter((p) => p.locationLat && p.locationLng);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - providers don't change often
    ...options,
  });
};

// ============================================
// DASHBOARD HOOKS
// ============================================

/**
 * Hook to fetch manager dashboard stats
 */
export const useManagerDashboard = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.dashboard.manager,
    queryFn: async () => {
      const res = await api.get(API_ENDPOINTS.DASHBOARD.MANAGER_STATS);
      return res.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

/**
 * Hook to fetch medical admin dashboard stats
 */
export const useMedicalAdminDashboard = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.dashboard.medicalAdmin,
    queryFn: async () => {
      const res = await api.get('/api/medical-admin/dashboard');
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch doctor dashboard stats
 */
export const useDoctorDashboard = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.dashboard.doctor,
    queryFn: async () => {
      // Parallel fetch all doctor stats
      const [statsRes, radiologyRes, labRes, emergencyRes] = await Promise.all([
        api.get('/api/medical-records/stats'),
        api.get('/api/radiology/doctor/my'),
        api.get('/api/labs/doctor/my'),
        api.get('/api/emergencies/doctor/my-requests'),
      ]);

      return {
        stats: statsRes.data,
        radiologyCount: Array.isArray(radiologyRes.data) ? radiologyRes.data.length : 0,
        labCount: Array.isArray(labRes.data) ? labRes.data.length : 0,
        emergencyRequests: emergencyRes.data || [],
      };
    },
    staleTime: 60000, // 1 minute
    ...options,
  });
};

// ============================================
// CLIENT HOOKS
// ============================================

/**
 * Hook to fetch client dashboard data
 * Combines all client-related data in one efficient call
 */
export const useClientDashboard = (options = {}) => {
  return useQuery({
    queryKey: ['client', 'dashboard'],
    queryFn: async () => {
      // Parallel fetch all data
      const [prescriptionsRes, labsRes, radiologyRes, claimsRes] = await Promise.all([
        api.get(API_ENDPOINTS.PRESCRIPTIONS.GET),
        api.get(API_ENDPOINTS.LABS.GET_BY_MEMBER),
        api.get(API_ENDPOINTS.RADIOLOGY.GET_BY_MEMBER),
        api.get(API_ENDPOINTS.HEALTHCARE_CLAIMS.MY_CLAIMS),
      ]);

      return {
        prescriptions: prescriptionsRes.data || [],
        labRequests: labsRes.data || [],
        radiologyRequests: radiologyRes.data || [],
        claims: claimsRes.data || [],
      };
    },
    staleTime: 60000, // 1 minute
    ...options,
  });
};

// ============================================
// FAMILY MEMBERS HOOKS
// ============================================

/**
 * Hook to fetch user's family members
 */
export const useMyFamilyMembers = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.familyMembers.my,
    queryFn: async () => {
      const res = await api.get(API_ENDPOINTS.FAMILY_MEMBERS.MY);
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// ============================================
// SUBMIT CLAIM MUTATION
// ============================================

/**
 * Mutation to submit a new claim
 */
export const useSubmitClaim = () => {
  return useMutation({
    mutationFn: async (formData) => {
      const res = await api.post(API_ENDPOINTS.HEALTHCARE_CLAIMS.SUBMIT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    onSuccess: () => {
      invalidateQueries.claims();
    },
  });
};

export default {
  useCurrentUser,
  useUnreadNotificationCount,
  useNotifications,
  useMyClaims,
  usePharmacistPrescriptions,
  useLabRequests,
  useRadiologyRequests,
  useApprovedProviders,
  useManagerDashboard,
  useMedicalAdminDashboard,
  useDoctorDashboard,
  useClientDashboard,
};
