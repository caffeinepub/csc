import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminActor } from './useAdminActor';
import { toast } from 'sonner';
import { type Inquiry } from '../backend';
import { isAuthorizationError } from '../utils/adminError';

/**
 * React Query hooks for admin operations.
 * All hooks depend on the admin actor being ready and verified.
 * Includes limited self-healing mechanism for authorization errors.
 * Adds demo inquiry fallback when the backend returns an empty list.
 */

/**
 * Fetches all inquiries from the backend.
 * Automatically refetches on mount and reconnect.
 * Includes limited self-healing: if authorization error occurs despite ready state,
 * automatically reinitializes admin session and retries ONCE per query lifecycle.
 * Shows a demo inquiry with clear English labeling when the list is empty.
 */
export function useGetAllInquiries() {
  const { actor, isReady, isFetching: actorFetching, retry: retryAdminActor } = useAdminActor();
  const queryClient = useQueryClient();

  const query = useQuery<Inquiry[]>({
    queryKey: ['adminInquiries'],
    queryFn: async () => {
      if (!actor) {
        throw new Error('Admin actor not available. Please retry initialization.');
      }

      try {
        const result = await actor.getAllInquiries();
        
        // Backend already returns a demo inquiry when empty, but we add frontend fallback
        // in case backend behavior changes or for additional clarity
        if (result.length === 0) {
          const demoInquiry: Inquiry = {
            id: BigInt(0),
            timestamp: BigInt(Date.now() * 1000000), // Convert to nanoseconds
            inquiryType: 'contact' as any,
            name: 'Demo Inquiry',
            phoneNumber: '1234567890',
            email: 'demo@example.com',
            message: 'This is a demo inquiry to demonstrate the system\'s functionality when no actual data exists.',
            serviceCategory: 'Demo Category',
            internal: false,
            read: false,
          };
          return [demoInquiry];
        }
        
        return result;
      } catch (error) {
        // If we get an authorization error despite being in ready state,
        // it means the admin session is stale - trigger ONE self-healing attempt
        if (isAuthorizationError(error)) {
          console.log('Authorization error on inquiry fetch - attempting self-healing (once per lifecycle)');
          
          // Check if we've already attempted self-healing in this query lifecycle
          const queryState = queryClient.getQueryState(['adminInquiries']);
          const failureCount = queryState?.fetchFailureCount ?? 0;
          
          if (failureCount === 0) {
            // First failure - attempt self-healing
            console.log('First authorization failure - reinitializing admin session');
            
            // Reinitialize admin session
            retryAdminActor();
            
            // Wait for reinitialization
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Retry the query once with fresh actor
            const freshActor = queryClient.getQueryData<typeof actor>(['adminActor']);
            if (freshActor) {
              try {
                const retryResult = await freshActor.getAllInquiries();
                console.log('Self-healing successful - inquiries loaded after reinitialization');
                
                // Apply demo inquiry fallback to retry result as well
                if (retryResult.length === 0) {
                  const demoInquiry: Inquiry = {
                    id: BigInt(0),
                    timestamp: BigInt(Date.now() * 1000000),
                    inquiryType: 'contact' as any,
                    name: 'Demo Inquiry',
                    phoneNumber: '1234567890',
                    email: 'demo@example.com',
                    message: 'This is a demo inquiry to demonstrate the system\'s functionality when no actual data exists.',
                    serviceCategory: 'Demo Category',
                    internal: false,
                    read: false,
                  };
                  return [demoInquiry];
                }
                
                return retryResult;
              } catch (retryError) {
                console.error('Self-healing failed - authorization still invalid after retry');
                throw retryError;
              }
            }
          } else {
            // Already attempted self-healing - don't retry again
            console.error('Self-healing already attempted - not retrying to prevent loop');
          }
        }
        
        throw error;
      }
    },
    enabled: isReady && !!actor && !actorFetching,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
    staleTime: 0, // Always consider data stale to ensure fresh fetches
    retry: false, // Don't auto-retry - self-healing handles auth errors once, user handles others
  });

  // Safe refetch with user feedback
  const safeRefetch = async () => {
    if (!isReady || !actor) {
      toast.error('Admin session not ready. Please wait or retry initialization.');
      return;
    }

    try {
      await query.refetch();
      toast.success('Inquiries refreshed');
    } catch (error) {
      console.error('Failed to refresh inquiries:', error);
      toast.error('Failed to refresh inquiries');
    }
  };

  return {
    ...query,
    safeRefetch,
  };
}

/**
 * Marks an inquiry as read or unread
 */
export function useSetInquiryReadStatus() {
  const { actor, isReady } = useAdminActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inquiryId, read }: { inquiryId: bigint; read: boolean }) => {
      if (!isReady || !actor) {
        throw new Error('Admin session not ready. Please retry initialization.');
      }
      await actor.setInquiryReadStatus(inquiryId, read);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminInquiries'] });
      toast.success(variables.read ? 'Marked as read' : 'Marked as unread');
    },
    onError: (error) => {
      console.error('Failed to update inquiry status:', error);
      toast.error('Failed to update inquiry status');
    },
  });
}

/**
 * Deletes an inquiry
 */
export function useDeleteInquiry() {
  const { actor, isReady } = useAdminActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inquiryId: bigint) => {
      if (!isReady || !actor) {
        throw new Error('Admin session not ready. Please retry initialization.');
      }
      await actor.deleteInquiry(inquiryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInquiries'] });
      toast.success('Inquiry deleted');
    },
    onError: (error) => {
      console.error('Failed to delete inquiry:', error);
      toast.error('Failed to delete inquiry');
    },
  });
}

/**
 * Bulk operation: Set read status for multiple inquiries
 */
export function useBulkSetInquiryReadStatus() {
  const { actor, isReady } = useAdminActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inquiryIds, read }: { inquiryIds: bigint[]; read: boolean }) => {
      if (!isReady || !actor) {
        throw new Error('Admin session not ready. Please retry initialization.');
      }
      await Promise.all(
        inquiryIds.map(id => actor.setInquiryReadStatus(id, read))
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminInquiries'] });
      const count = variables.inquiryIds.length;
      const action = variables.read ? 'read' : 'unread';
      toast.success(`Marked ${count} ${count === 1 ? 'inquiry' : 'inquiries'} as ${action}`);
    },
    onError: (error) => {
      console.error('Failed to update inquiry status:', error);
      toast.error('Failed to update inquiry status');
    },
  });
}
