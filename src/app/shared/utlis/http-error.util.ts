/**
 * Extracts a user-facing error message from an HTTP error response.
 * Handles all common NestJS error response shapes across the app:
 *
 *   1. { message: "Some error" }
 *   2. { message: ["error 1", "error 2"] }               (class-validator array)
 *   3. { message: { message: [...], error, statusCode } } (nested/wrapped errors)
 *
 * Falls back to a generic message if the backend didn't return one
 * (network failure, server down, unexpected shape, etc.) so the UI
 * never shows "[object Object]" or a blank toast.
 *
 * Usage:
 *   error: (err) => this.toaster.error(getHttpErrorMessage(err))
 */
export function getHttpErrorMessage(
  err: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  const body = (err as { error?: unknown })?.error;
  return extractMessage(body, fallback);
}

function extractMessage(source: unknown, fallback: string): string {
  if (typeof source === 'string' && source.trim()) {
    return source;
  }

  if (Array.isArray(source)) {
    return typeof source[0] === 'string' ? source[0] : fallback;
  }

  if (source && typeof source === 'object' && 'message' in source) {
    return extractMessage((source as { message: unknown }).message, fallback);
  }

  return fallback;
}