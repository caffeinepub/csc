import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminActor } from './useAdminActor';
import { useOfficialAdminToken } from './useOfficialAdminToken';
import { Inquiry } from '../backend';
import { toast } from 'sonner';
import { isAuthorizationError, normalizeError } from '../utils/adminError';
import { useRef } from 'react';

export function useGetAllInquiries() {
  const { actor, isFetching: actorFetching, isReady, isInitializing, isError: actorError, error: actorErrorValue, retry: retryAdminActor } = useAdminActor();
  const adminToken = useOfficialAdminToken();
  const queryClient = useQueryClient();
  const hasAttemptedSelfHeal = useRef(false);

  const query = useQuery<Inquiry[]>({
    queryKey: ['adminInquiries', adminToken],
    queryFn: async () => {
      if (!actor) {
        // This should never happen when enabled guard is correct, but provide clear error
        throw new Error('Cannot fetch inquiries: Admin session not initialized. Please retry initialization.');
      }
      try {
        const result = await actor.getAllInquiries();
        // Reset self-heal flag on successful fetch
        hasAttemptedSelfHeal.current = false;
        return result;
      } catch (error: unknown) {
        console.error('Failed to fetch inquiries:', error);
        
        // Self-healing mechanism: If we get an authorization error but admin actor claims to be ready,
        // it might be a stale actor. Try to reinitialize once automatically.
        if (isAuthorizationError(error) && isReady && !hasAttemptedSelfHeal.current) {
          console.warn('Authorization error detected despite ready admin actor. Attempting self-heal by reinitializing admin session...');
          hasAttemptedSelfHeal.current = true;
          
          // Trigger admin actor reinitialization
          retryAdminActor();
          
          // Throw a user-friendly error that explains what's happening
          throw new Error('Admin session needs to be reinitialized. Please wait a moment and the page will refresh automatically.');
        }
        
        // Normalize and rethrow for consistent error handling
        throw normalizeError(error);
      }
    },
    // CRITICAL: Only enable when admin actor is ready AND we have a token
    // This prevents premature fetching before initialization completes
    enabled: isReady && !!adminToken && !!actor && !actorFetching,
    // Refetch on mount and reconnect to ensure we always show latest data
    refetchOnMount: 'always',
    refetchOnReconnect: true,
    staleTime: 0, // Always consider data stale to ensure fresh fetches
    retry: (failureCount, error) => {
      // Don't retry on authorization errors (self-heal handles this)
      if (isAuthorizationError(error)) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });

  // Safe refetch that only runs when prerequisites are met
  const safeRefetch = () => {
    // Reset self-heal flag when user manually refreshes
    hasAttemptedSelfHeal.current = false;
    
    // Only refetch if admin session is ready (token exists and actor is initialized)
    if (isReady && adminToken && actor && !actorFetching) {
      return query.refetch();
    }
    // If prerequisites aren't met, show a helpful message
    if (isInitializing || actorFetching) {
      toast.info('Please wait for admin session to initialize');
    } else if (!adminToken) {
      toast.error('Admin session not available. Please log in again.');
    } else if (!actor) {
      toast.error('Admin actor not available. Please retry initialization.');
    } else {
      toast.error('Admin session not ready. Please retry initialization.');
    }
    // Return a resolved promise if prerequisites aren't met
    return Promise.resolve({ data: undefined, error: null, isError: false, isSuccess: false });
  };

  // Expose admin actor initialization state and error
  return {
    ...query,
    safeRefetch,
    isAdminSessionInitializing: isInitializing,
    isAdminSessionError: actorError,
    adminSessionError: actorErrorValue,
  };
}

export function useDeleteInquiry() {
  const { actor, isReady } = useAdminActor();
  const queryClient = useQueryClient();
  const adminToken = useOfficialAdminToken();

  return useMutation({
    mutationFn: async (inquiryId: bigint) => {
      if (!actor || !isReady) {
        throw new Error('Cannot delete inquiry: Admin session not ready. Please refresh the page.');
      }
      try {
        await actor.deleteInquiry(inquiryId);
      } catch (error: unknown) {
        console.error('Failed to delete inquiry:', error);
        const isAuthError = isAuthorizationError(error);
        if (isAuthError) {
          toast.error('You do not have permission to perform this action');
        } else {
          toast.error('Failed to delete inquiry');
        }
        throw normalizeError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInquiries', adminToken] });
      toast.success('Inquiry deleted successfully');
    },
  });
}

export function useSetInquiryReadStatus() {
  const { actor, isReady } = useAdminActor();
  const queryClient = useQueryClient();
  const adminToken = useOfficialAdminToken();

  return useMutation({
    mutationFn: async ({ inquiryId, read }: { inquiryId: bigint; read: boolean }) => {
      if (!actor || !isReady) {
        throw new Error('Cannot update inquiry: Admin session not ready. Please refresh the page.');
      }
      try {
        await actor.setInquiryReadStatus(inquiryId, read);
      } catch (error: unknown) {
        console.error('Failed to set inquiry read status:', error);
        const isAuthError = isAuthorizationError(error);
        if (isAuthError) {
          toast.error('You do not have permission to perform this action');
        } else {
          toast.error('Failed to update status');
        }
        throw normalizeError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInquiries', adminToken] });
    },
  });
}

export function useBulkSetInquiryReadStatus() {
  const { actor, isReady } = useAdminActor();
  const queryClient = useQueryClient();
  const adminToken = useOfficialAdminToken();

  return useMutation({
    mutationFn: async ({ inquiryIds, read }: { inquiryIds: bigint[]; read: boolean }) => {
      if (!actor || !isReady) {
        throw new Error('Cannot perform bulk action: Admin session not ready. Please refresh the page.');
      }
      
      try {
        const promises = inquiryIds.map(id => actor.setInquiryReadStatus(id, read));
        await Promise.all(promises);
      } catch (error: unknown) {
        console.error('Failed to bulk set inquiry read status:', error);
        const isAuthError = isAuthorizationError(error);
        if (isAuthError) {
          toast.error('You do not have permission to perform this action');
        } else {
          toast.error('Bulk operation failed. Please try again.');
        }
        throw normalizeError(error);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminInquiries', adminToken] });
      toast.success(
        variables.read 
          ? `${variables.inquiryIds.length} inquiries marked as read`
          : `${variables.inquiryIds.length} inquiries marked as unread`
      );
    },
  });
}
