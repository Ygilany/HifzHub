/**
 * Next.js API route handler for tRPC
 * This handles all tRPC requests at /api/trpc/*
 */

import { appRouter, createContext, extractUserFromToken } from '@hifzhub/api';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

const handler = async (req: Request) => {
  // Extract authorization header and get user
  const authHeader = req.headers.get('authorization');
  const user = await extractUserFromToken(authHeader);

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () =>
      createContext({
        headers: req.headers,
        user,
      }),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`
            );
          }
        : undefined,
  });
};

export { handler as GET, handler as POST };
