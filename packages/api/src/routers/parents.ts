/**
 * Parents router
 * Handles parent-specific operations
 */

import { studentParents, users } from '@hifzhub/database/schema';
import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { protectedProcedure, router } from '../trpc';

export const parentsRouter = router({
  /**
   * Get all children (students) associated with the logged-in parent
   * Requires authentication and PARENT role
   */
  getMyChildren: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const userRole = ctx.user.role;

    // Verify user is a parent
    if (userRole !== 'PARENT') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only parents can access this resource',
      });
    }

    // Get all student-parent relationships for this parent
    const relationships = await ctx.db.query.studentParents.findMany({
      where: eq(studentParents.parentId, userId),
      with: {
        student: {
          columns: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    // Extract and return student data
    return relationships.map((rel) => rel.student);
  }),

  /**
   * Associate a student (child) with the logged-in parent
   * Requires authentication and PARENT role
   */
  addChild: protectedProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'studentId' in val) {
        return { studentId: val.studentId as string };
      }
      throw new Error('Invalid input: studentId is required');
    })
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const userRole = ctx.user.role;

      // Verify user is a parent
      if (userRole !== 'PARENT') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only parents can access this resource',
        });
      }

      // Verify the student exists and has STUDENT role
      const student = await ctx.db.query.users.findFirst({
        where: and(eq(users.id, input.studentId), eq(users.role, 'STUDENT')),
      });

      if (!student) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Student not found',
        });
      }

      // Check if relationship already exists
      const existing = await ctx.db.query.studentParents.findFirst({
        where: and(
          eq(studentParents.parentId, userId),
          eq(studentParents.studentId, input.studentId)
        ),
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Student is already associated with this parent',
        });
      }

      // Create the relationship
      const [relationship] = await ctx.db
        .insert(studentParents)
        .values({
          parentId: userId,
          studentId: input.studentId,
        })
        .returning();

      return relationship;
    }),

  /**
   * Remove a child association from the logged-in parent
   * Requires authentication and PARENT role
   */
  removeChild: protectedProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'studentId' in val) {
        return { studentId: val.studentId as string };
      }
      throw new Error('Invalid input: studentId is required');
    })
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const userRole = ctx.user.role;

      // Verify user is a parent
      if (userRole !== 'PARENT') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only parents can access this resource',
        });
      }

      // Delete the relationship
      await ctx.db
        .delete(studentParents)
        .where(
          and(
            eq(studentParents.parentId, userId),
            eq(studentParents.studentId, input.studentId)
          )
        );

      return { success: true };
    }),
});
