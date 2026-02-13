import { useInternetIdentity } from './useInternetIdentity';
import { useOfficialAdminToken } from './useOfficialAdminToken';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type backendInterface } from '../backend';
import { createActorWithConfig } from '../config';
import { useEffect, useRef } from 'react';
import { extractReplicaRejectionDetails, isAdminSecretAlreadyUsedError, isReplicaRejectionError } from '../utils/adminError';

/**
 * Wrapper actor hook specifically for admin operations.
 * Creates an actor (anonymous or Internet Identity-backed) and invokes
 * the backend access-control initialization with the admin secret token,
 * then explicitly verifies admin status before returning the actor.
 * 
 * Exposes explicit states: initializing, ready, and failed.
 * Provides deterministic retry that recreates the actor and re-runs initialization.
 * Includes initialization timeout to prevent indefinite hangs.
 * Treats "Admin secret already used" as expected and non-blocking (with auto-retry).
 * Implements bounded retry with exponential backoff for replica rejection errors.
 * Ensures actor is fully ready and verified as admin before downstream queries enable.
 */
export function useAdminActor() {
  const { identity } = useInternetIdentity();
  const adminToken = useOfficialAdminToken();
  const queryClient = useQueryClient();
  const lastTokenRef = useRef<string | null>(null);

  // Track token changes and invalidate actor when token changes
  useEffect(() => {
    if (adminToken !== lastTokenRef.current) {
      lastTokenRef.current = adminToken;
      
      // If token changed (login/logout), invalidate the actor to force recreation
      if (adminToken) {
        queryClient.invalidateQueries({ queryKey: ['adminActor'] });
      } else {
        // Token cleared (logout) - remove all admin queries
        queryClient.removeQueries({ queryKey: ['adminActor'] });
        queryClient.removeQueries({ queryKey: ['adminInquiries'] });
      }
    }
  }, [adminToken, queryClient]);

  const actorQuery = useQuery<backendInterface>({
    queryKey: ['adminActor', identity?.getPrincipal().toString(), adminToken],
    queryFn: async () => {
      if (!adminToken) {
        throw new Error('Admin token not available. Please log in again.');
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

        // Initialize access control with admin token
        try {
          await actor._initializeAccessControlWithSecret(adminToken);
          console.log('Admin access control initialized successfully');
        } catch (error) {
          console.error('Failed to initialize access control:', error);
          
          // Check if this is the "Admin secret already used" error - treat as recoverable
          if (isAdminSecretAlreadyUsedError(error)) {
            console.log('Admin secret already used - this is expected after first initialization. Proceeding with verification.');
            // Don't throw - this is expected, continue to verification
          } else {
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
        }

        // CRITICAL: Explicitly verify admin status after initialization
        // This prevents the infinite loop by catching non-admin callers early
        try {
          const isAdmin = await actor.isCallerAdmin();
          if (!isAdmin) {
            throw new Error('Unauthorized: Current session does not have admin privileges. The admin role may have been assigned to a different principal. Please contact the system administrator.');
          }
          console.log('Admin status verified successfully');
        } catch (error) {
          console.error('Admin verification failed:', error);
          throw error;
        }

        // Return the verified admin actor
        return actor;
      })();

      // Race between initialization and timeout
      return Promise.race([initPromise, timeoutPromise]);
    },
    enabled: !!adminToken,
    retry: (failureCount, error) => {
      // Auto-retry with bounded attempts for recoverable errors
      if (isAdminSecretAlreadyUsedError(error)) {
        // Retry once for "admin secret already used"
        return failureCount < 1;
      }
      
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
