'use client';

/**
 * Client-side tRPC configuration
 * Use this in client components with React Query hooks
 */

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@hifzhub/api';

export const api = createTRPCReact<AppRouter>();
