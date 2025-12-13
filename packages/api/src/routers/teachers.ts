/**
 * Teachers router
 * Handles teacher-specific operations
 */

import { programTeachers, programStudents, users } from '@hifzhub/database/schema';
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
        program: true,
      },
    });

    return relationships.map((rel) => rel.program);
  }),
});
