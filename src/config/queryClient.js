/**
 * React Query Configuration
 * Centralized caching and data fetching configuration for optimal performance
 */

import { QueryClient } from '@tanstack/react-query';

// Create a client with optimized defaults for high-traffic application
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 30 minutes
      gcTime: 30 * 60 * 1000,
      // Retry failed requests 2 times with exponential backoff
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus for most queries (reduces unnecessary calls)
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect unless data is stale
      refetchOnReconnect: 'always',
      // Deduplicate requests within 2 seconds
      structuralSharing: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Auth
  auth: {
    me: ['auth', 'me'],
  },

  // Notifications - shared across all components
  notifications: {
    all: ['notifications'],
    unreadCount: ['notifications', 'unreadCount'],
    list: (page = 1, limit = 20) => ['notifications', 'list', { page, limit }],
  },

  // Claims
  claims: {
    all: ['claims'],
    myClaims: ['claims', 'my'],
    byId: (id) => ['claims', id],
    list: (filters) => ['claims', 'list', filters],
    medicalReview: ['claims', 'medicalReview'],
    coordinationReview: ['claims', 'coordinationReview'],
  },

  // Prescriptions
  prescriptions: {
    all: ['prescriptions'],
    pending: ['prescriptions', 'pending'],
    my: ['prescriptions', 'my'],
    stats: ['prescriptions', 'stats'],
  },

  // Lab requests
  labs: {
    all: ['labs'],
    pending: ['labs', 'pending'],
    my: ['labs', 'my'],
    stats: ['labs', 'stats'],
  },

  // Radiology requests
  radiology: {
    all: ['radiology'],
    pending: ['radiology', 'pending'],
    my: ['radiology', 'my'],
    stats: ['radiology', 'stats'],
  },

  // Healthcare providers
  providers: {
    all: ['providers'],
    approved: ['providers', 'approved'],
    pending: ['providers', 'pending'],
    my: ['providers', 'my'],
  },

  // Dashboard stats
  dashboard: {
    manager: ['dashboard', 'manager'],
    medicalAdmin: ['dashboard', 'medicalAdmin'],
    doctor: ['dashboard', 'doctor'],
  },

  // Users/Clients
  clients: {
    all: ['clients'],
    pending: ['clients', 'pending'],
    byId: (id) => ['clients', id],
  },

  // Policies
  policies: {
    all: ['policies'],
    byId: (id) => ['policies', id],
  },

  // Family members
  familyMembers: {
    my: ['familyMembers', 'my'],
    byClient: (clientId) => ['familyMembers', 'client', clientId],
  },

  // Emergency
  emergency: {
    all: ['emergency'],
    pending: ['emergency', 'pending'],
    my: ['emergency', 'my'],
  },
};

// Invalidation helpers
export const invalidateQueries = {
  // Invalidate all notification queries
  notifications: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),

  // Invalidate all claims queries
  claims: () => queryClient.invalidateQueries({ queryKey: ['claims'] }),

  // Invalidate all prescription queries
  prescriptions: () => queryClient.invalidateQueries({ queryKey: ['prescriptions'] }),

  // Invalidate user data
  auth: () => queryClient.invalidateQueries({ queryKey: ['auth'] }),

  // Invalidate dashboard data
  dashboard: () => queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
};

export default queryClient;
