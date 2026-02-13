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
 * Detects if an error is the "Admin secret already used to initialize the system" error.
 * This is a recoverable error that should trigger Retry, not Logout.
 */
export function isAdminSecretAlreadyUsedError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes('admin secret already used');
}

/**
 * Detects if an error is authorization-related (invalid credentials, wrong secret, etc.)
 * These errors should trigger Logout as the recovery action.
 * 
 * IMPORTANT: Does NOT include "admin secret already used" which is a recoverable initialization error.
 */
export function isAuthorizationError(error: unknown): boolean {
  // First check if it's the "already used" error - if so, it's NOT an auth error
  if (isAdminSecretAlreadyUsedError(error)) {
    return false;
  }

  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes('unauthorized') ||
    message.includes('only admins') ||
    message.includes('invalid secret') ||
    message.includes('invalid token') ||
    message.includes('not authorized') ||
    message.includes('permission denied') ||
    message.includes('access denied') ||
    message.includes('system has not been initialized') ||
    message.includes('only official admin') ||
    message.includes('does not have admin privileges') ||
    message.includes('admin role may have been assigned')
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
    isAdminSecretAlreadyUsedError(error) ||
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

  // Extract request ID (e.g., "Request ID: 6e0df47e-..." or "request_id=...")
  let requestId: string | undefined;
  const requestIdMatch = message.match(/request[_ ]id[:\s=]+([a-f0-9-]+)/i);
  if (requestIdMatch) {
    requestId = requestIdMatch[1];
  }

  // Extract canister ID and stopped reason
  const canisterStoppedMatch = message.match(/canister\s+([a-z0-9-]+)\s+(is\s+)?(stopped|stopping)/i);
  const isCanisterStopped = !!canisterStoppedMatch;

  // Build a clear reason message
  let reason: string;
  if (canisterStoppedMatch) {
    const canisterId = canisterStoppedMatch[1];
    const state = canisterStoppedMatch[3]; // "stopped" or "stopping"
    reason = `Backend service is ${state} (Canister ${canisterId})`;
  } else if (message.toLowerCase().includes('canister') && message.toLowerCase().includes('unavailable')) {
    reason = 'Backend service is currently unavailable';
  } else if (message.toLowerCase().includes('destination invalid')) {
    reason = 'Backend service destination is invalid or unreachable';
  } else if (message.toLowerCase().includes('replica returned a rejection error')) {
    reason = 'Backend service rejected the request';
  } else if (message.toLowerCase().includes('replica') && message.toLowerCase().includes('reject')) {
    reason = 'Backend replica rejected the request';
  } else {
    reason = 'Backend service error';
  }

  return {
    reason,
    rejectCode,
    requestId,
    isCanisterStopped,
  };
}

/**
 * Formats replica rejection details into a user-friendly, actionable message
 * that includes reject code and request ID when available.
 */
export function formatReplicaRejectionMessage(details: ReplicaRejectionDetails): string {
  let message = details.reason;
  
  if (details.isCanisterStopped) {
    message += '. The backend canister needs to be started.';
  } else {
    message += '. The service may be temporarily unavailable.';
  }

  // Add actionable guidance
  message += ' Please wait a moment and click Retry to reconnect.';

  // Append technical details inline for transparency
  const technicalParts: string[] = [];
  if (details.rejectCode !== undefined) {
    technicalParts.push(`Reject Code: ${details.rejectCode}`);
  }
  if (details.requestId) {
    technicalParts.push(`Request ID: ${details.requestId}`);
  }

  if (technicalParts.length > 0) {
    message += ` (${technicalParts.join(', ')})`;
  }

  return message;
}

/**
 * Normalizes any thrown value into an Error object
 */
export function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  
  return new Error(getErrorMessage(error));
}
