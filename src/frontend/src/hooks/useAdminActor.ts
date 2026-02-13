import { useInternetIdentity } from './useInternetIdentity';
import { useOfficialAdminToken } from './useOfficialAdminToken';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type backendInterface } from '../backend';
import { createActorWithConfig } from '../config';
import { useEffect } from 'react';

/**
 * Wrapper actor hook specifically for admin operations.
 * Creates an actor (anonymous or Internet Identity-backed) and invokes
 * the backend access-control initialization with the admin secret token
 * before returning the actor.
 */
export function useAdminActor() {
  const { identity } = useInternetIdentity();
  const adminToken = useOfficialAdminToken();
  const queryClient = useQueryClient();

  const actorQuery = useQuery<backendInterface>({
    queryKey: ['adminActor', identity?.getPrincipal().toString(), adminToken],
    queryFn: async () => {
      const isAuthenticated = !!identity;

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
          throw error;
        }
      }

      return actor;
    },
    staleTime: Infinity,
    enabled: true,
  });

  // Invalidate dependent queries when actor changes
  useEffect(() => {
    if (actorQuery.data && !actorQuery.isFetching) {
      // Invalidate admin inquiries when actor is ready
      queryClient.invalidateQueries({ queryKey: ['adminInquiries'] });
    }
  }, [actorQuery.data, actorQuery.isFetching, queryClient]);

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
    isError: actorQuery.isError,
    error: actorQuery.error,
  };
}
