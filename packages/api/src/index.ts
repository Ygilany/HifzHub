/**
 * Main entry point for the API package
 */

export { createContext, type Context, type CreateContextOptions } from './context';
export { appRouter, type AppRouter } from './root';
export { protectedProcedure, publicProcedure, router } from './trpc';
export { extractUserFromToken, type ExtractedUser } from './utils/auth';

