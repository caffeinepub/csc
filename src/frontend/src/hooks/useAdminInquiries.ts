import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminActor } from './useAdminActor';
import { useOfficialAdminToken } from './useOfficialAdminToken';
import { Inquiry } from '../backend';
import { toast } from 'sonner';
import { isAuthorizationError, normalizeError } from '../utils/adminError';

export function useGetAllInquiries() {
  const { actor, isFetching: actorFetching } = useAdminActor();
  const adminToken = useOfficialAdminToken();

  return useQuery<Inquiry[]>({
    queryKey: ['adminInquiries', adminToken],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getAllInquiries();
      } catch (error: unknown) {
        console.error('Failed to fetch inquiries:', error);
        // Normalize and rethrow for consistent error handling
        throw normalizeError(error);
      }
    },
    enabled: !!actor && !actorFetching && !!adminToken,
    retry: (failureCount, error) => {
      // Don't retry on authorization errors
      if (isAuthorizationError(error)) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });
}

export function useDeleteInquiry() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();
  const adminToken = useOfficialAdminToken();

  return useMutation({
    mutationFn: async (inquiryId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.deleteInquiry(inquiryId);
      } catch (error: unknown) {
        console.error('Failed to delete inquiry:', error);
        const isAuthError = isAuthorizationError(error);
        if (isAuthError) {
          toast.error('You do not have permission to perform this action');
        } else {
          toast.error('पूछताछ हटाने में विफल');
        }
        throw normalizeError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInquiries', adminToken] });
      toast.success('पूछताछ सफलतापूर्वक हटाई गई');
    },
  });
}

export function useSetInquiryReadStatus() {
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();
  const adminToken = useOfficialAdminToken();

  return useMutation({
    mutationFn: async ({ inquiryId, read }: { inquiryId: bigint; read: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.setInquiryReadStatus(inquiryId, read);
      } catch (error: unknown) {
        console.error('Failed to set inquiry read status:', error);
        const isAuthError = isAuthorizationError(error);
        if (isAuthError) {
          toast.error('You do not have permission to perform this action');
        } else {
          toast.error('स्थिति बदलने में विफल');
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
  const { actor } = useAdminActor();
  const queryClient = useQueryClient();
  const adminToken = useOfficialAdminToken();

  return useMutation({
    mutationFn: async ({ inquiryIds, read }: { inquiryIds: bigint[]; read: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      
      try {
        const promises = inquiryIds.map(id => actor.setInquiryReadStatus(id, read));
        await Promise.all(promises);
      } catch (error: unknown) {
        console.error('Failed to bulk set inquiry read status:', error);
        const isAuthError = isAuthorizationError(error);
        if (isAuthError) {
          toast.error('You do not have permission to perform this action');
        } else {
          toast.error('बल्क ऑपरेशन विफल रहा। कृपया पुनः प्रयास करें।');
        }
        throw normalizeError(error);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminInquiries', adminToken] });
      toast.success(
        variables.read 
          ? `${variables.inquiryIds.length} पूछताछ को पढ़ा हुआ चिह्नित किया गया`
          : `${variables.inquiryIds.length} पूछताछ को अपठित चिह्नित किया गया`
      );
    },
  });
}
