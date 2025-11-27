/**
 * Root tRPC router that combines all sub-routers
 */

import { router } from './trpc';
import { testRouter } from './routers/test';
import { authRouter } from './routers/auth';

/**
 * This is the primary router for your server.
 * All routers added in /routers should be manually added here.
 */
export const appRouter = router({
  test: testRouter,
  auth: authRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
