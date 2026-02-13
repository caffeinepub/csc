import { useInternetIdentity } from './useInternetIdentity';
import { useOfficialUserId } from './useOfficialUserId';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type backendInterface, type SessionEntity } from '../backend';
import { createActorWithConfig } from '../config';
import { useEffect, useRef } from 'react';
import { extractReplicaRejectionDetails, isReplicaRejectionError } from '../utils/adminError';

/**
 * Admin actor hook for Super Admin bypass (K107172621).
 * Creates an actor and calls initializeAdmin with ONLY the user ID (no token required).
 * Trusts the backend session response immediately without additional verification.
 * Includes health check preflight and bounded retry with exponential backoff.
 * Exposes explicit states: initializing, ready, and failed.
 */
export function useAdminActor() {
  const { identity } = useInternetIdentity();
  const userId = useOfficialUserId();
  const queryClient = useQueryClient();
  const lastUserIdRef = useRef<string | null>(null);

  // Track userId changes and invalidate actor when it changes
  useEffect(() => {
    const userIdChanged = userId !== lastUserIdRef.current;
    
    if (userIdChanged) {
      lastUserIdRef.current = userId;
      
      // If userId changed (login/logout), invalidate the actor to force recreation
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['adminActor'] });
      } else {
        // UserId cleared (logout) - remove all admin queries
        queryClient.removeQueries({ queryKey: ['adminActor'] });
        queryClient.removeQueries({ queryKey: ['adminInquiries'] });
      }
    }
  }, [userId, queryClient]);

  const actorQuery = useQuery<backendInterface>({
    queryKey: ['adminActor', identity?.getPrincipal().toString(), userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('Official user ID is missing. Please log in again to restore your session.');
      }

      const isAuthenticated = !!identity;

      // Create initialization timeout promise (30 seconds)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Admin session initialization timed out after 30 seconds. The backend service may be unavailable or still starting up. Please wait a moment and click Retry.'));
        }, 30000);
      });

      // Create actor initialization promise
      const initPromise = (async () => {
        let actor: backendInterface;

        if (!isAuthenticated) {
          // Create anonymous actor if not authenticated
          actor = await createActorWithConfig();
        } else {
          // Create authenticated actor with Internet Identity
          const actorOptions = {
            agentOptions: {
              identity
            }
          };
          actor = await createActorWithConfig(actorOptions);
        }

        // PREFLIGHT: Check backend health to detect canister-stopped early
        try {
          console.log('Checking backend health before initialization...');
          const healthStatus = await actor.getHealthStatus();
          console.log('Backend health check passed:', healthStatus);
        } catch (healthError) {
          console.error('Backend health check failed:', healthError);
          
          // Enrich replica rejection errors with structured details
          const replicaDetails = extractReplicaRejectionDetails(healthError);
          if (replicaDetails) {
            const enrichedError = healthError instanceof Error ? healthError : new Error(String(healthError));
            (enrichedError as any).replicaDetails = replicaDetails;
            (enrichedError as any).healthCheckFailed = true;
            throw enrichedError;
          }
          
          // Re-throw other health check errors
          throw healthError;
        }

        // Initialize Super Admin access with ONLY user_id (no token required for K107172621)
        let session: SessionEntity | null = null;
        try {
          console.log('Initializing Super Admin bypass for user_id:', userId);
          session = await actor.initializeAdmin(userId);
          console.log('Super Admin initialization result:', session);
        } catch (error) {
          console.error('Failed to initialize Super Admin access:', error);
          
          // Enrich replica rejection errors with structured details
          const replicaDetails = extractReplicaRejectionDetails(error);
          if (replicaDetails) {
            const enrichedError = error instanceof Error ? error : new Error(String(error));
            (enrichedError as any).replicaDetails = replicaDetails;
            throw enrichedError;
          }

          // Re-throw other errors as-is
          throw error;
        }

        // Validate the session response structure
        if (!session || typeof session !== 'object') {
          throw new Error('Invalid session response from backend. Expected SessionEntity object with user details.');
        }

        // Validate that session has required fields
        if (!session.user || typeof session.user !== 'object') {
          throw new Error('Invalid session response: missing user object.');
        }

        // Check if user has admin role
        if (session.user.role !== 'admin') {
          throw new Error('Super Admin initialization failed. User ID does not have admin privileges.');
        }

        console.log('Super Admin session initialized successfully:', {
          sessionId: session.id,
          userId: session.user.id,
          userName: session.user.name,
          userRole: session.user.role,
        });

        // HOTFIX: Trust the backend session response immediately.
        // The backend has already validated and returned a SessionEntity with role === 'admin'.
        // No additional verification calls are needed - return the actor immediately.
        console.log('Admin actor ready - trusting backend session response');
        return actor;
      })();

      // Race between initialization and timeout
      return Promise.race([initPromise, timeoutPromise]);
    },
    enabled: !!userId,
    retry: (failureCount, error) => {
      // Auto-retry with bounded attempts for recoverable errors
      if (isReplicaRejectionError(error)) {
        // Retry up to 3 times for replica rejections (canister stopped, unavailable, etc.)
        return failureCount < 3;
      }
      
      // Don't auto-retry other errors - user must explicitly retry
      return false;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 2s, 4s, 8s
      return Math.min(1000 * Math.pow(2, attemptIndex + 1), 8000);
    },
    staleTime: Infinity, // Actor should remain fresh until explicitly invalidated
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes after unmount
  });

  // Deterministic retry function that clears cache and forces fresh initialization
  const retry = () => {
    // Clear both actor and inquiry caches to ensure clean slate
    queryClient.removeQueries({ queryKey: ['adminActor'] });
    queryClient.removeQueries({ queryKey: ['adminInquiries'] });
    
    // Force immediate refetch
    actorQuery.refetch();
  };

  return {
    actor: actorQuery.data,
    isInitializing: actorQuery.isLoading || actorQuery.isFetching,
    isReady: actorQuery.isSuccess && !!actorQuery.data,
    isError: actorQuery.isError,
    error: actorQuery.error,
    retry,
    isFetching: actorQuery.isFetching,
  };
}
