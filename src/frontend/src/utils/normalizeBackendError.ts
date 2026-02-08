/**
 * Normalizes backend errors into user-friendly English messages.
 * Handles backend traps, authorization errors, and other exceptions.
 */
export function normalizeBackendError(error: unknown): string {
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  // Handle string errors (common from backend traps)
  if (typeof error === 'string') {
    // Check for common authorization patterns
    if (error.includes('Unauthorized') || error.includes('Sign-in required')) {
      return 'You must be signed in to perform this action.';
    }
    if (error.includes('not found')) {
      return 'The requested item was not found.';
    }
    if (error.includes('already completed')) {
      return 'This task is already completed.';
    }
    if (error.includes('not completed')) {
      return 'This task is not completed.';
    }
    // Return the error string if it's already user-friendly
    return error;
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message;
    
    // Check for actor availability
    if (message.includes('Actor not available')) {
      return 'Unable to connect to the backend. Please refresh the page and try again.';
    }
    
    // Check for authorization patterns
    if (message.includes('Unauthorized') || message.includes('Sign-in required')) {
      return 'You must be signed in to perform this action.';
    }
    
    // Check for network/connection issues
    if (message.includes('network') || message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    // Return the error message if it seems user-friendly
    if (message.length > 0 && message.length < 200) {
      return message;
    }
  }

  // Handle objects with message property
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = String((error as { message: unknown }).message);
    if (message) {
      return normalizeBackendError(message);
    }
  }

  // Fallback for unknown error types
  return 'An unexpected error occurred. Please try again.';
}
