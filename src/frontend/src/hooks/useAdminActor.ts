import { useInternetIdentity } from './useInternetIdentity';
import { useOfficialAdminToken } from './useOfficialAdminToken';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type backendInterface } from '../backend';
import { createActorWithConfig } from '../config';
import { useEffect, useRef } from 'react';
import { extractReplicaRejectionDetails, isBackendInitializationBug, isAdminSecretAlreadyUsedError } from '../utils/adminError';

/**
 * Wrapper actor hook specifically for admin operations.
 * Creates an actor (anonymous or Internet Identity-backed) and invokes
 * the backend access-control initialization with the admin secret token
 * before returning the actor.
 * 
 * Exposes explicit states: initializing, ready, and failed.
 * Provides deterministic retry that recreates the actor and re-runs initialization.
 * Includes initialization timeout to prevent indefinite hangs.
 * Detects and handles the known backend initialization bug gracefully.
 * Treats "Admin secret already used" as a recoverable error that allows retry.
 * Ensures actor is fully ready before downstream queries enable.
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
          reject(new Error('Admin session initialization timed out after 30 seconds. The backend service may be unavailable.'));
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
        } catch (error) {
          console.error('Failed to initialize access control:', error);
          
          // Check if this is the "Admin secret already used" error - treat as recoverable
          if (isAdminSecretAlreadyUsedError(error)) {
            const recoverableError = new Error('Admin secret already used to initialize the system. This is expected after the first initialization. Click Retry to proceed.');
            (recoverableError as any).isRecoverable = true;
            (recoverableError as any).originalError = error;
            throw recoverableError;
          }

          // Check if this is the backend initialization bug
          if (isBackendInitializationBug(error)) {
            const bugError = new Error('Backend initialization bug detected: The backend accepted your admin credentials but failed to grant admin privileges. This requires a backend code fix.');
            (bugError as any).isBackendBug = true;
            (bugError as any).originalError = error;
            throw bugError;
          }

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

        // Verify admin status after initialization to catch backend bugs early
        try {
          const isAdmin = await actor.isCallerAdmin();
          if (!isAdmin) {
            const verificationError = new Error('Admin verification failed: Backend did not grant admin privileges after initialization. This indicates a backend code issue.');
            (verificationError as any).isBackendBug = true;
            throw verificationError;
          }
        } catch (verificationError) {
          // If verification itself fails, it might be a transient error or backend issue
          console.error('Admin verification check failed:', verificationError);
          // Only throw if it's not the "already used" error (which we handle above)
          if (!isAdminSecretAlreadyUsedError(verificationError)) {
            throw verificationError;
          }
        }

        return actor;
      })();

      // Race between initialization and timeout
      return Promise.race([initPromise, timeoutPromise]);
    },
    enabled: !!adminToken,
    retry: false, // Disable automatic retry; we provide explicit retry via retry()
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
