import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { generateRandomToken, hashToken } from '../../utils/tokens.js';

describe('Password & Token Security Helpers', () => {
  it('hashes passwords securely and verifies correctly', async () => {
    const raw = 'SecurePassword123!';
    const hash = await hashPassword(raw);

    expect(hash).not.toBe(raw);
    expect(hash.startsWith('$2')).toBe(true);

    const isMatch = await comparePassword(raw, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await comparePassword('WrongPassword123!', hash);
    expect(isWrongMatch).toBe(false);
  });

  it('generates high-entropy random tokens', () => {
    const token1 = generateRandomToken(32);
    const token2 = generateRandomToken(32);

    expect(token1).toHaveLength(64); // 32 bytes hex
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);
  });

  it('computes deterministic SHA-256 token hashes', () => {
    const token = 'sample-verification-token';
    const hash1 = hashToken(token);
    const hash2 = hashToken(token);

    expect(hash1).toHaveLength(64);
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(token);
  });
});
