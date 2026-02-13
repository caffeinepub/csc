/**
 * Utility to derive human-readable error messages from unknown thrown values,
 * detect authorization-related failures, extract replica rejection details,
 * and identify backend initialization issues.
 */

export interface ReplicaRejectionDetails {
  reason: string;
  rejectCode?: number;
  requestId?: string;
  isCanisterStopped: boolean;
  healthCheckFailed?: boolean;
}

/**
 * Extracts a human-readable message from any thrown value
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.trim();
    return msg || 'An error occurred';
  }
  
  if (typeof error === 'string') {
    const msg = error.trim();
    return msg || 'An error occurred';
  }
  
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof (error as any).message === 'string') {
      const msg = ((error as any).message as string).trim();
      return msg || 'An error occurred';
    }
    
    // Try to stringify object errors
    try {
      const stringified = JSON.stringify(error);
      return stringified !== '{}' ? stringified : 'An unknown error occurred';
    } catch {
      return 'An unknown error occurred';
    }
  }
  
  return 'An unknown error occurred';
}

/**
 * Detects if an error is authorization-related (invalid credentials, wrong user ID, etc.)
 * These errors should trigger Logout as the recovery action.
 */
export function isAuthorizationError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes('unauthorized') ||
    message.includes('only admins') ||
    message.includes('invalid admin user id') ||
    message.includes('not authorized') ||
    message.includes('permission denied') ||
    message.includes('access denied') ||
    message.includes('does not have admin privileges') ||
    message.includes('admin role may have been assigned') ||
    message.includes('invalid super admin')
  );
}

/**
 * Detects if an error is a replica rejection (e.g., canister stopped, unavailable)
 */
export function isReplicaRejectionError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes('replica returned a rejection error') ||
    message.includes('replica') && message.includes('reject') ||
    (message.includes('canister') && (
      message.includes('stopped') ||
      message.includes('unavailable') ||
      message.includes('not running') ||
      message.includes('is stopping')
    )) ||
    message.includes('reject code') ||
    message.includes('ic0508') ||
    message.includes('destination invalid')
  );
}

/**
 * Detects if an error is recoverable via retry (transient errors, initialization issues, etc.)
 * These errors should show a Retry button as the primary action.
 */
export function isRecoverableError(error: unknown): boolean {
  return (
    isReplicaRejectionError(error) ||
    getErrorMessage(error).toLowerCase().includes('timed out')
  );
}

/**
 * Extracts detailed replica rejection information from an error
 * Handles both string messages and structured error objects
 */
export function extractReplicaRejectionDetails(error: unknown): ReplicaRejectionDetails | null {
  const message = getErrorMessage(error);
  
  if (!isReplicaRejectionError(error)) {
    return null;
  }

  // Check if error has attached replicaDetails (from enriched errors)
  if (error && typeof error === 'object' && 'replicaDetails' in error) {
    const attached = (error as any).replicaDetails;
    if (attached && typeof attached === 'object') {
      return attached as ReplicaRejectionDetails;
    }
  }

  // Check if this was a health check failure
  const healthCheckFailed = error && typeof error === 'object' && 'healthCheckFailed' in error;

  // Extract reject code (e.g., "Reject code: 5" or "IC0508" or "reject_code=5")
  let rejectCode: number | undefined;
  const rejectCodeMatch = message.match(/reject[_ ]code[:\s=]+(\d+)/i);
  if (rejectCodeMatch) {
    rejectCode = parseInt(rejectCodeMatch[1], 10);
  } else {
    const ic0508Match = message.match(/IC0508/i);
    if (ic0508Match) {
      rejectCode = 5; // IC0508 corresponds to reject code 5 (CanisterError)
    }
  }

  // Extract request ID (e.g., "Request ID: abc123" or "request_id=abc123")
  let requestId: string | undefined;
  const requestIdMatch = message.match(/request[_ ]id[:\s=]+([a-f0-9-]+)/i);
  if (requestIdMatch) {
    requestId = requestIdMatch[1];
  }

  // Detect if canister is stopped
  const isCanisterStopped = message.toLowerCase().includes('canister') && (
    message.toLowerCase().includes('stopped') ||
    message.toLowerCase().includes('is stopping') ||
    message.toLowerCase().includes('not running')
  );

  return {
    reason: message,
    rejectCode,
    requestId,
    isCanisterStopped,
    healthCheckFailed: !!healthCheckFailed,
  };
}

/**
 * Formats a user-friendly error message for admin initialization failures.
 * Includes replica rejection details inline in the primary message for better visibility.
 */
export function formatAdminInitErrorMessage(error: unknown): string {
  const baseMessage = getErrorMessage(error);
  const replicaDetails = extractReplicaRejectionDetails(error);

  if (!replicaDetails) {
    return baseMessage;
  }

  // Build enriched message with replica details inline
  let enrichedMessage = baseMessage;

  // Add health check failure indicator if present
  if (replicaDetails.healthCheckFailed) {
    enrichedMessage += '\n\nHealth check failed - backend service is not responding.';
  }

  // Add reject code if present
  if (replicaDetails.rejectCode !== undefined) {
    enrichedMessage += `\n\nReject Code: ${replicaDetails.rejectCode}`;
  }

  // Add request ID if present
  if (replicaDetails.requestId) {
    enrichedMessage += `\nRequest ID: ${replicaDetails.requestId}`;
  }

  // Add canister stopped indicator
  if (replicaDetails.isCanisterStopped) {
    enrichedMessage += '\n\nThe backend canister appears to be stopped. Please start the canister and try again.';
  }

  return enrichedMessage;
}
