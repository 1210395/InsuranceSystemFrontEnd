/**
 * Pagination Hooks
 * Optimized pagination for large datasets
 *
 * Benefits:
 * - Reduces initial payload by 95%+ (20 items vs 500+)
 * - Faster Time to First Byte (TTFB)
 * - Lower memory usage on client
 * - Better user experience with progressive loading
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../utils/apiService';

/**
 * Standard pagination hook for table/list views
 *
 * @param {Object} options
 * @param {string} options.queryKey - Unique key for React Query
 * @param {string} options.endpoint - API endpoint
 * @param {number} options.pageSize - Items per page (default: 20)
 * @param {Object} options.filters - Optional filters to apply
 */
export const usePaginatedQuery = ({
  queryKey,
  endpoint,
  pageSize = 20,
  filters = {},
  enabled = true,
}) => {
  const [page, setPage] = useState(0);

  const queryResult = useQuery({
    queryKey: [...queryKey, { page, pageSize, ...filters }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString(),
        ...filters,
      });
      const res = await api.get(`${endpoint}?${params}`);
      return res.data;
    },
    enabled,
    keepPreviousData: true,
    staleTime: 30000,
  });

  const pagination = useMemo(() => ({
    page,
    pageSize,
    totalPages: queryResult.data?.totalPages || 0,
    totalElements: queryResult.data?.totalElements || 0,
    hasNext: queryResult.data?.hasNext ?? page < (queryResult.data?.totalPages || 0) - 1,
    hasPrev: page > 0,
  }), [page, pageSize, queryResult.data]);

  const goToPage = useCallback((newPage) => {
    setPage(Math.max(0, newPage));
  }, []);

  const nextPage = useCallback(() => {
    if (pagination.hasNext) {
      setPage(p => p + 1);
    }
  }, [pagination.hasNext]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrev) {
      setPage(p => p - 1);
    }
  }, [pagination.hasPrev]);

  const resetPage = useCallback(() => {
    setPage(0);
  }, []);

  return {
    ...queryResult,
    items: queryResult.data?.content || queryResult.data || [],
    pagination,
    goToPage,
    nextPage,
    prevPage,
    resetPage,
  };
};

/**
 * Infinite scroll hook for continuous loading
 *
 * @param {Object} options
 * @param {string} options.queryKey - Unique key for React Query
 * @param {string} options.endpoint - API endpoint
 * @param {number} options.pageSize - Items per page (default: 20)
 */
export const useInfiniteList = ({
  queryKey,
  endpoint,
  pageSize = 20,
  filters = {},
  enabled = true,
}) => {
  const queryResult = useInfiniteQuery({
    queryKey: [...queryKey, 'infinite', filters],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        page: pageParam.toString(),
        size: pageSize.toString(),
        ...filters,
      });
      const res = await api.get(`${endpoint}?${params}`);
      return res.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length;
      const hasMore = lastPage.hasNext ?? (lastPage.content?.length === pageSize);
      return hasMore ? nextPage : undefined;
    },
    enabled,
    staleTime: 30000,
  });

  const items = useMemo(() => {
    return queryResult.data?.pages.flatMap(page => page.content || page) || [];
  }, [queryResult.data]);

  const loadMore = useCallback(() => {
    if (queryResult.hasNextPage && !queryResult.isFetchingNextPage) {
      queryResult.fetchNextPage();
    }
  }, [queryResult]);

  return {
    ...queryResult,
    items,
    loadMore,
    hasMore: queryResult.hasNextPage,
    isLoadingMore: queryResult.isFetchingNextPage,
  };
};

/**
 * Client-side pagination for already-loaded data
 * Use when data is small enough to load entirely but still needs pagination UI
 */
export const useClientPagination = (items = [], pageSize = 20) => {
  const [page, setPage] = useState(0);

  const paginatedItems = useMemo(() => {
    const start = page * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const pagination = useMemo(() => ({
    page,
    pageSize,
    totalPages: Math.ceil(items.length / pageSize),
    totalElements: items.length,
    hasNext: (page + 1) * pageSize < items.length,
    hasPrev: page > 0,
  }), [items.length, page, pageSize]);

  const goToPage = useCallback((newPage) => {
    const maxPage = Math.max(0, Math.ceil(items.length / pageSize) - 1);
    setPage(Math.min(Math.max(0, newPage), maxPage));
  }, [items.length, pageSize]);

  const nextPage = useCallback(() => {
    if (pagination.hasNext) setPage(p => p + 1);
  }, [pagination.hasNext]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrev) setPage(p => p - 1);
  }, [pagination.hasPrev]);

  const resetPage = useCallback(() => {
    setPage(0);
  }, []);

  return {
    items: paginatedItems,
    pagination,
    goToPage,
    nextPage,
    prevPage,
    resetPage,
  };
};

/**
 * Search with debounced pagination
 */
export const useSearchPagination = ({
  queryKey,
  endpoint,
  pageSize = 20,
  debounceMs = 300,
}) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [search, debounceMs]);

  const result = usePaginatedQuery({
    queryKey: [...queryKey, debouncedSearch],
    endpoint,
    pageSize,
    filters: debouncedSearch ? { search: debouncedSearch } : {},
    enabled: true,
  });

  // Reset to first page when search changes
  useEffect(() => {
    result.resetPage();
  }, [debouncedSearch]);

  return {
    ...result,
    search,
    setSearch,
    isSearching: search !== debouncedSearch,
  };
};

export default usePaginatedQuery;
