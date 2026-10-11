import crypto from 'crypto';

/**
 * Generates a high-entropy cryptographically secure random token (hex).
 */
export function generateRandomToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString('hex');
}

/**
 * Computes SHA-256 hash of a token.
 * We store token hashes in the database rather than plaintext tokens
 * for session IDs, email verification tokens, and password reset tokens.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
