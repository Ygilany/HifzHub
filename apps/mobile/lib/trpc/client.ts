/**
 * tRPC client for mobile app
 */

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@hifzhub/api';

export const api = createTRPCReact<AppRouter>();
