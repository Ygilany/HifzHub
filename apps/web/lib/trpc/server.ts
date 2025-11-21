import 'server-only';

/**
 * Server-side tRPC configuration
 * Use this in server components for direct procedure calls
 */

import { cache } from 'react';
import { appRouter, createContext } from '@hifzhub/api';

/**
 * This wraps the createContext function from the API package
 * and ensures it's only called once per request
 */
const createContextCached = cache(() => {
  return createContext({
    // In a real app, you would get the user from the session
    // For now, we'll pass a mock user
    user: null,
  });
});

/**
 * Create a server-side caller for tRPC procedures
 * In tRPC v11, we use the router's createCaller method
 */
export const api = appRouter.createCaller(createContextCached());
