/**
 * This file defines the context that's available to all tRPC procedures.
 */

import { db } from '@hifzhub/database';

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
    db,
    user: opts?.user ?? null,
    headers: opts?.headers,
  };
}

export type Context = ReturnType<typeof createContext>;
