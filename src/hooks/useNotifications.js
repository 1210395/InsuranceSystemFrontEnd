/**
 * Optimized Notifications Hook
 *
 * Provides real-time notification functionality with:
 * - WebSocket support for instant updates
 * - Fallback to intelligent polling (30s vs 5s)
 * - React Query caching to prevent duplicate requests
 * - Automatic connection management
 */

import { useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { api, getToken } from '../utils/apiService';
import { API_ENDPOINTS } from '../config/api';
import { queryKeys } from '../config/queryClient';
import notificationService from '../services/notificationService';

/**
 * Hook for notification count badge
 * Used in headers/sidebars to show unread count
 */
export const useUnreadNotificationCount = () => {
  const queryClient = useQueryClient();

  // Subscribe to real-time updates
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    // Initialize notification service
    notificationService.init();

    // Subscribe to updates
    const unsubscribe = notificationService.subscribe((data) => {
      if (data.type === 'NOTIFICATION_COUNT' || data.type === 'NEW_NOTIFICATION') {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: async () => {
      const res = await api.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
      return typeof res.data === 'number' ? res.data : parseInt(res.data) || 0;
    },
    enabled: !!getToken(),
    staleTime: 20000, // 20 seconds
    refetchInterval: 30000, // 30 seconds fallback polling
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook for full notification list with pagination
 */
export const useNotificationList = (page = 0, limit = 20) => {
  return useQuery({
    queryKey: queryKeys.notifications.list(page, limit),
    queryFn: async () => {
      const res = await api.get(`${API_ENDPOINTS.NOTIFICATIONS.ALL}?page=${page}&size=${limit}`);
      return res.data;
    },
    enabled: !!getToken(),
    staleTime: 30000,
    keepPreviousData: true,
  });
};

/**
 * Hook for marking notifications as read
 */
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId) => {
      await api.post(`${API_ENDPOINTS.NOTIFICATIONS.ALL}/${notificationId}/read`);
      notificationService.markAsRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });
    },
  });
};

/**
 * Hook for marking all notifications as read
 */
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
      notificationService.markAllAsRead();
    },
    onMutate: async () => {
      // Optimistically update the count to 0
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.unreadCount });
      const previousCount = queryClient.getQueryData(queryKeys.notifications.unreadCount);
      queryClient.setQueryData(queryKeys.notifications.unreadCount, 0);
      return { previousCount };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(queryKeys.notifications.unreadCount, context.previousCount);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });
    },
  });
};

/**
 * Combined hook for notification functionality
 * Provides count, list, and actions in one hook
 */
export const useNotifications = (options = {}) => {
  const { page = 0, limit = 20 } = options;

  const countQuery = useUnreadNotificationCount();
  const listQuery = useNotificationList(page, limit);
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  return {
    // Count
    unreadCount: countQuery.data || 0,
    isLoadingCount: countQuery.isLoading,

    // List
    notifications: listQuery.data?.content || listQuery.data || [],
    isLoadingList: listQuery.isLoading,
    totalPages: listQuery.data?.totalPages || 0,

    // Actions
    markAsRead: markReadMutation.mutate,
    markAllAsRead: markAllReadMutation.mutate,
    isMarkingRead: markReadMutation.isPending,
    isMarkingAllRead: markAllReadMutation.isPending,

    // Refetch
    refetchCount: countQuery.refetch,
    refetchList: listQuery.refetch,
  };
};

/**
 * Hook for real-time notification toasts
 * Shows toast notifications when new notifications arrive
 */
export const useNotificationToasts = (onNewNotification) => {
  useEffect(() => {
    const token = getToken();
    if (!token || !onNewNotification) return;

    const unsubscribe = notificationService.subscribe((data) => {
      if (data.type === 'NEW_NOTIFICATION' && data.notification) {
        onNewNotification(data.notification);
      }
    });

    return () => unsubscribe();
  }, [onNewNotification]);
};

export default useNotifications;
