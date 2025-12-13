/**
 * Programs router
 * Handles program management operations
 */

import { programs, programTeachers, programStudents, users, classes } from '@hifzhub/database/schema';
import { TRPCError } from '@trpc/server';
import { and, eq, inArray } from 'drizzle-orm';
import { protectedProcedure, router } from '../trpc';

export const programsRouter = router({
  /**
   * Get all programs
   * Requires authentication
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.programs.findMany({
      orderBy: (programs, { asc }) => [asc(programs.createdAt)],
    });
  }),

  /**
   * Get a program by ID with its teachers, students, and classes
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
      const program = await ctx.db.query.programs.findFirst({
        where: eq(programs.id, input.id),
        with: {
          teachers: {
            with: {
              teacher: {
                columns: {
                  id: true,
                  email: true,
                  name: true,
                  role: true,
                },
              },
            },
          },
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
          classes: true,
        },
      });

      if (!program) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Program not found',
        });
      }

      return program;
    }),

  /**
   * Create a new program
   * Requires authentication (typically ADMIN or TEACHER)
   */
  create: protectedProcedure
    .input((val: unknown) => {
      if (
        typeof val === 'object' &&
        val !== null &&
        'name' in val &&
        typeof val.name === 'string'
      ) {
        return {
          name: val.name,
          description: 'description' in val ? (val.description as string | undefined) : undefined,
        };
      }
      throw new Error('Invalid input: name is required');
    })
    .mutation(async ({ ctx, input }) => {
      const [newProgram] = await ctx.db
        .insert(programs)
        .values({
          name: input.name,
          description: input.description,
        })
        .returning();

      return newProgram;
    }),

  /**
   * Add a teacher to a program
   * Requires authentication
   */
  addTeacher: protectedProcedure
    .input((val: unknown) => {
      if (
        typeof val === 'object' &&
        val !== null &&
        'programId' in val &&
        'teacherId' in val
      ) {
        return {
          programId: val.programId as string,
          teacherId: val.teacherId as string,
        };
      }
      throw new Error('Invalid input: programId and teacherId are required');
    })
    .mutation(async ({ ctx, input }) => {
      // Verify the teacher exists and has TEACHER role
      const teacher = await ctx.db.query.users.findFirst({
        where: and(eq(users.id, input.teacherId), eq(users.role, 'TEACHER')),
      });

      if (!teacher) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Teacher not found',
        });
      }

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

      // Check if relationship already exists
      const existing = await ctx.db.query.programTeachers.findFirst({
        where: and(
          eq(programTeachers.programId, input.programId),
          eq(programTeachers.teacherId, input.teacherId)
        ),
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Teacher is already associated with this program',
        });
      }

      // Create the relationship
      const [relationship] = await ctx.db
        .insert(programTeachers)
        .values({
          programId: input.programId,
          teacherId: input.teacherId,
        })
        .returning();

      return relationship;
    }),

  /**
   * Register a student to a program
   * Requires authentication
   */
  registerStudent: protectedProcedure
    .input((val: unknown) => {
      if (
        typeof val === 'object' &&
        val !== null &&
        'programId' in val &&
        'studentId' in val
      ) {
        return {
          programId: val.programId as string,
          studentId: val.studentId as string,
        };
      }
      throw new Error('Invalid input: programId and studentId are required');
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

      // Check if relationship already exists
      const existing = await ctx.db.query.programStudents.findFirst({
        where: and(
          eq(programStudents.programId, input.programId),
          eq(programStudents.studentId, input.studentId)
        ),
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Student is already registered in this program',
        });
      }

      // Create the relationship
      const [relationship] = await ctx.db
        .insert(programStudents)
        .values({
          programId: input.programId,
          studentId: input.studentId,
        })
        .returning();

      return relationship;
    }),

  /**
   * Remove a student from a program
   * Requires authentication
   */
  removeStudent: protectedProcedure
    .input((val: unknown) => {
      if (
        typeof val === 'object' &&
        val !== null &&
        'programId' in val &&
        'studentId' in val
      ) {
        return {
          programId: val.programId as string,
          studentId: val.studentId as string,
        };
      }
      throw new Error('Invalid input: programId and studentId are required');
    })
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(programStudents)
        .where(
          and(
            eq(programStudents.programId, input.programId),
            eq(programStudents.studentId, input.studentId)
          )
        );

      return { success: true };
    }),
});
