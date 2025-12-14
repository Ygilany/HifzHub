/**
 * Authentication utilities for extracting user from tokens
 */

import { db } from '@hifzhub/database';
import { users } from '@hifzhub/database/schema';
import { eq } from 'drizzle-orm';

export interface ExtractedUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Extract user from authorization token
 * For mock tokens, extracts user ID from token format: "mock-token-${userId}"
 */
export async function extractUserFromToken(
  authHeader: string | null
): Promise<ExtractedUser | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  // For mock tokens, extract user ID from token format: "mock-token-${userId}"
  if (!token.startsWith('mock-token-')) {
    return null;
  }

  const userId = token.replace('mock-token-', '');

  try {
    // Look up user in database
    const foundUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!foundUser) {
      return null;
    }

    return {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role,
    };
  } catch (error) {
    console.error('Error looking up user from token:', error);
    return null;
  }
}
