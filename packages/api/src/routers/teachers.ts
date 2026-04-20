/**
 * Teachers router
 * Handles teacher-specific operations
 */

import {
  classes,
  programStudents,
  programTeachers,
  programs,
} from '@hifzhub/database/schema';
import { TRPCError } from '@trpc/server';
import { and, eq, inArray } from 'drizzle-orm';
import { protectedProcedure, router } from '../trpc';

export const teachersRouter = router({
  /**
   * Get all students associated with the logged-in teacher through programs
   * Requires authentication and TEACHER role
   */
  getMyStudents: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const userRole = ctx.user.role;

    // Verify user is a teacher
    if (userRole !== 'TEACHER') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only teachers can access this resource',
      });
    }

    // Get all programs where this teacher is associated
    const teacherPrograms = await ctx.db.query.programTeachers.findMany({
      where: eq(programTeachers.teacherId, userId),
      columns: {
        programId: true,
      },
    });

    if (teacherPrograms.length === 0) {
      return [];
    }

    const programIds = teacherPrograms.map((tp) => tp.programId);

    // Get all students in these programs
    const studentRelationships = await ctx.db.query.programStudents.findMany({
      where: inArray(programStudents.programId, programIds),
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

    // Extract unique students (a student might be in multiple programs)
    const studentMap = new Map();
    studentRelationships.forEach((rel) => {
      if (!studentMap.has(rel.student.id)) {
        studentMap.set(rel.student.id, rel.student);
      }
    });

    return Array.from(studentMap.values());
  }),

  /**
   * Get all programs where the logged-in teacher is associated
   * Requires authentication and TEACHER role
   */
  getMyPrograms: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const userRole = ctx.user.role;

    // Verify user is a teacher
    if (userRole !== 'TEACHER') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only teachers can access this resource',
      });
    }

    // Get all programs where this teacher is associated
    const relationships = await ctx.db.query.programTeachers.findMany({
      where: eq(programTeachers.teacherId, userId),
      with: {
        program: {
          with: {
            classes: {
              with: {
                students: {
                  with: {
                    student: {
                      columns: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return relationships.map((rel) => rel.program);
  }),

  /**
   * Create a class for the logged-in teacher.
   * - If `programId` is provided, the class is created in that program (after
   *   verifying the teacher belongs to it).
   * - Otherwise, the class is created in the teacher's first existing program;
   *   if the teacher has no programs yet, a default one is created and the
   *   teacher is associated with it.
   */
  createClass: protectedProcedure
    .input((val: unknown) => {
      if (
        typeof val === 'object' &&
        val !== null &&
        'name' in val &&
        typeof (val as { name: unknown }).name === 'string'
      ) {
        const v = val as {
          name: string;
          description?: unknown;
          programId?: unknown;
          programName?: unknown;
        };
        const name = v.name.trim();
        if (!name) throw new Error('Invalid input: name cannot be empty');
        return {
          name,
          description:
            typeof v.description === 'string' ? v.description : undefined,
          programId: typeof v.programId === 'string' ? v.programId : undefined,
          programName:
            typeof v.programName === 'string' ? v.programName.trim() : undefined,
        };
      }
      throw new Error('Invalid input: name is required');
    })
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      if (ctx.user.role !== 'TEACHER') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only teachers can create classes',
        });
      }

      let programId = input.programId;

      if (programId) {
        const membership = await ctx.db.query.programTeachers.findFirst({
          where: and(
            eq(programTeachers.programId, programId),
            eq(programTeachers.teacherId, userId),
          ),
        });
        if (!membership) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You are not a teacher in this program',
          });
        }
      } else {
        const existing = await ctx.db.query.programTeachers.findFirst({
          where: eq(programTeachers.teacherId, userId),
          columns: { programId: true },
        });
        if (existing) {
          programId = existing.programId;
        } else {
          const [newProgram] = await ctx.db
            .insert(programs)
            .values({
              name: input.programName ?? 'My Program',
            })
            .returning();
          if (!newProgram) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to create program',
            });
          }
          programId = newProgram.id;
          await ctx.db.insert(programTeachers).values({
            programId,
            teacherId: userId,
          });
        }
      }

      const [newClass] = await ctx.db
        .insert(classes)
        .values({
          programId,
          name: input.name,
          description: input.description,
        })
        .returning();

      return newClass;
    }),
});
