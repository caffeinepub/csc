import { useInternetIdentity } from './useInternetIdentity';
import { useOfficialAdminToken } from './useOfficialAdminToken';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type backendInterface } from '../backend';
import { createActorWithConfig } from '../config';
import { useEffect } from 'react';
import { extractReplicaRejectionDetails } from '../utils/adminError';

/**
 * Wrapper actor hook specifically for admin operations.
 * Creates an actor (anonymous or Internet Identity-backed) and invokes
 * the backend access-control initialization with the admin secret token
 * before returning the actor.
 * 
 * Exposes explicit states: initializing, ready, and failed.
 * Provides deterministic retry that recreates the actor and re-runs initialization.
 * Includes initialization timeout to prevent indefinite hangs.
 */
export function useAdminActor() {
  const { identity } = useInternetIdentity();
  const adminToken = useOfficialAdminToken();
  const queryClient = useQueryClient();

  const actorQuery = useQuery<backendInterface>({
    queryKey: ['adminActor', identity?.getPrincipal().toString(), adminToken],
    queryFn: async () => {
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

        // Initialize access control with admin token if available
        if (adminToken) {
          try {
            await actor.initializeAccessControlWithSecret(adminToken);
          } catch (error) {
            console.error('Failed to initialize access control:', error);
            
            // Attach replica rejection details if available
            const replicaDetails = extractReplicaRejectionDetails(error);
            if (replicaDetails) {
              const enrichedError = new Error(replicaDetails.reason);
              (enrichedError as any).replicaDetails = replicaDetails;
              (enrichedError as any).originalError = error;
              throw enrichedError;
            }
            
            throw error;
          }
        }

        return actor;
      })();

      // Race between initialization and timeout
      return Promise.race([initPromise, timeoutPromise]);
    },
    staleTime: Infinity,
    enabled: !!adminToken, // Only run when we have an admin token
    retry: (failureCount, error) => {
      // Don't retry on authorization errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('Invalid secret')) {
        return false;
      }
      // Don't auto-retry on replica rejections or timeouts (user should manually retry)
      const replicaDetails = extractReplicaRejectionDetails(error);
      if (replicaDetails || errorMessage.includes('timed out')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });

  // Invalidate dependent queries when actor changes successfully
  useEffect(() => {
    if (actorQuery.data && !actorQuery.isFetching && !actorQuery.isError) {
      // Invalidate admin inquiries when actor is ready
      queryClient.invalidateQueries({ queryKey: ['adminInquiries'] });
    }
  }, [actorQuery.data, actorQuery.isFetching, actorQuery.isError, queryClient]);

  // Compute explicit states:
  // - isInitializing: we have a token and actor is fetching (not failed)
  // - isReady: we have a token, actor exists, not fetching, and no error
  // - isError: query failed
  const isInitializing = !!adminToken && actorQuery.isFetching && !actorQuery.isError;
  const isReady = !!adminToken && !!actorQuery.data && !actorQuery.isFetching && !actorQuery.isError;

  // Provide a deterministic retry function that clears cache and forces fresh initialization
  const retry = () => {
    // Remove the cached adminActor query to force a fresh actor creation
    queryClient.removeQueries({ queryKey: ['adminActor'] });
    // Remove cached inquiries to ensure fresh fetch after successful retry
    queryClient.removeQueries({ queryKey: ['adminInquiries'] });
    // Trigger a fresh fetch
    actorQuery.refetch();
  };

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
    isError: actorQuery.isError,
    error: actorQuery.error,
    isInitializing,
    isReady,
    retry,
  };
}
