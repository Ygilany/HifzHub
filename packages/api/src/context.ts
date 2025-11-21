/**
 * This file defines the context that's available to all tRPC procedures.
 * In a real app, this would include:
 * - Database instance
 * - Current user/session
 * - Request headers
 */

export interface CreateContextOptions {
  headers?: Headers;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  } | null;
}

export function createContext(opts?: CreateContextOptions) {
  return {
    user: opts?.user ?? null,
    headers: opts?.headers,
  };
}

export type Context = ReturnType<typeof createContext>;
