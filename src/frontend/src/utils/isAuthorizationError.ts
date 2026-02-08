/**
 * Detects authorization/permission-denied failures across common error variants.
 * Supports different error shapes (Error objects, strings, objects with message property).
 */
export function isAuthorizationError(error: unknown): boolean {
  if (!error) return false;

  // Common authorization-related keywords
  const authKeywords = [
    'unauthorized',
    'forbidden',
    'permission denied',
    'not authorized',
    'authentication required',
    'access denied',
    'sign-in required',
    'login required',
  ];

  let errorMessage = '';

  // Extract message from different error shapes
  if (error instanceof Error) {
    errorMessage = error.message.toLowerCase();
  } else if (typeof error === 'string') {
    errorMessage = error.toLowerCase();
  } else if (typeof error === 'object' && error !== null && 'message' in error) {
    errorMessage = String((error as { message: unknown }).message).toLowerCase();
  }

  // Check if any authorization keyword is present
  return authKeywords.some((keyword) => errorMessage.includes(keyword));
}
