/**
 * Classes router
 * Handles class management operations
 */

import { classes, classStudents, programs, users } from '@hifzhub/database/schema';
import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { protectedProcedure, router } from '../trpc';

export const classesRouter = router({
  /**
   * Get all classes for a program
   * Requires authentication
   */
  getByProgram: protectedProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'programId' in val) {
        return { programId: val.programId as string };
      }
      throw new Error('Invalid input: programId is required');
    })
    .query(async ({ ctx, input }) => {
      // Verify the program exists
      const program = await ctx.db.query.programs.findFirst({
        where: eq(programs.id, input.programId),
      });

      if (!program) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Program not found',
        });
      }

      return ctx.db.query.classes.findMany({
        where: eq(classes.programId, input.programId),
        orderBy: (classes, { asc }) => [asc(classes.createdAt)],
      });
    }),

  /**
   * Get a class by ID with its students
   * Requires authentication
   */
  getById: protectedProcedure
    .input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'id' in val) {
        return { id: val.id as string };
      }
      throw new Error('Invalid input: id is required');
    })
    .query(async ({ ctx, input }) => {
      const classData = await ctx.db.query.classes.findFirst({
        where: eq(classes.id, input.id),
        with: {
          students: {
            with: {
              student: {
                columns: {
                  id: true,
                  email: true,
                  name: true,
                  role: true,
                },
              },
            },
          },
          program: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!classData) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Class not found',
        });
      }

      return classData;
    }),

  /**
   * Create a new class in a program
   * Requires authentication
   */
  create: protectedProcedure
    .input((val: unknown) => {
      if (
        typeof val === 'object' &&
        val !== null &&
        'programId' in val &&
        'name' in val &&
        typeof val.name === 'string'
      ) {
        return {
          programId: val.programId as string,
          name: val.name,
          description: 'description' in val ? (val.description as string | undefined) : undefined,
        };
      }
      throw new Error('Invalid input: programId and name are required');
    })
    .mutation(async ({ ctx, input }) => {
      // Verify the program exists
      const program = await ctx.db.query.programs.findFirst({
        where: eq(programs.id, input.programId),
      });

      if (!program) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Program not found',
        });
      }

      const [newClass] = await ctx.db
        .insert(classes)
        .values({
          programId: input.programId,
          name: input.name,
          description: input.description,
        })
        .returning();

      return newClass;
    }),

  /**
   * Assign a student to a class
   * Requires authentication
   */
  assignStudent: protectedProcedure
    .input((val: unknown) => {
      if (
        typeof val === 'object' &&
        val !== null &&
        'classId' in val &&
        'studentId' in val
      ) {
        return {
          classId: val.classId as string,
          studentId: val.studentId as string,
        };
      }
      throw new Error('Invalid input: classId and studentId are required');
    })
    .mutation(async ({ ctx, input }) => {
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

      // Verify the class exists
      const classData = await ctx.db.query.classes.findFirst({
        where: eq(classes.id, input.classId),
      });

      if (!classData) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Class not found',
        });
      }

      // Check if relationship already exists
      const existing = await ctx.db.query.classStudents.findFirst({
        where: and(
          eq(classStudents.classId, input.classId),
          eq(classStudents.studentId, input.studentId)
        ),
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Student is already assigned to this class',
        });
      }

      // Create the relationship
      const [relationship] = await ctx.db
        .insert(classStudents)
        .values({
          classId: input.classId,
          studentId: input.studentId,
        })
        .returning();

      return relationship;
    }),

  /**
   * Remove a student from a class
   * Requires authentication
   */
  removeStudent: protectedProcedure
    .input((val: unknown) => {
      if (
        typeof val === 'object' &&
        val !== null &&
        'classId' in val &&
        'studentId' in val
      ) {
        return {
          classId: val.classId as string,
          studentId: val.studentId as string,
        };
      }
      throw new Error('Invalid input: classId and studentId are required');
    })
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(classStudents)
        .where(
          and(
            eq(classStudents.classId, input.classId),
            eq(classStudents.studentId, input.studentId)
          )
        );

      return { success: true };
    }),
});
