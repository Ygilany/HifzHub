/**
 * Root tRPC router that combines all sub-routers
 */

import { authRouter } from './routers/auth';
import { parentsRouter } from './routers/parents';
import { teachersRouter } from './routers/teachers';
import { programsRouter } from './routers/programs';
import { classesRouter } from './routers/classes';
import { testRouter } from './routers/test';
import { router } from './trpc';

/**
 * This is the primary router for your server.
 * All routers added in /routers should be manually added here.
 */
export const appRouter = router({
  test: testRouter,
  auth: authRouter,
  teachers: teachersRouter,
  parents: parentsRouter,
  programs: programsRouter,
  classes: classesRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
