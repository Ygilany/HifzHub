/**
 * Authentication router
 */

import { users } from '@hifzhub/database/schema';
import { loginSchema, registerSchema } from '@hifzhub/validators';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { publicProcedure, router } from '../trpc';

export const authRouter = router({
  /**
   * Login procedure
   * Validates credentials and returns user data with a token
   */
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ ctx, input }) => {
      const { email, password } = input;

      // Find user by email
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
      });

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Check if password exists
      if (!user.passwordHash) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);

      if (!isValidPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Return user data (excluding password hash)
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        // In a real app, you'd generate a JWT token here
        token: `mock-token-${user.id}`,
      };
    }),

  /**
   * Register procedure
   * Creates a new user account
   */
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const { email, password, name, role } = input;

      // Check if user already exists
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email already exists',
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const [newUser] = await ctx.db
        .insert(users)
        .values({
          email: email.toLowerCase(),
          name,
          role,
          passwordHash,
        })
        .returning();

      if (!newUser) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user',
        });
      }

      // Return user data (excluding password hash)
      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
        token: `mock-token-${newUser.id}`,
      };
    }),
});
