/**
 * Utility to derive human-readable error messages from unknown thrown values
 * and detect authorization-related failures.
 */

/**
 * Extracts a human-readable message from any thrown value
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof (error as any).message === 'string') {
      return (error as any).message;
    }
    
    // Try to stringify object errors
    try {
      return JSON.stringify(error);
    } catch {
      return 'An unknown error occurred';
    }
  }
  
  return 'An unknown error occurred';
}

/**
 * Detects if an error is authorization-related
 */
export function isAuthorizationError(error: unknown): boolean {
  const message = getErrorMessage(error);
  return message.includes('Unauthorized') || message.includes('Only admins');
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
