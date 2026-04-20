/**
 * Announcements router
 * Teachers create program-wide (or class-scoped) announcements;
 * teachers, students, and parents can list announcements relevant to them.
 */

import {
  announcements,
  classStudents,
  programStudents,
  programTeachers,
  studentParents,
} from '@hifzhub/database/schema';
import { TRPCError } from '@trpc/server';
import { and, desc, eq, inArray, isNull, or } from 'drizzle-orm';

import { protectedProcedure, router } from '../trpc';

const MAX_TITLE = 200;
const MAX_BODY = 5000;

function parseCreateInput(val: unknown): {
  programId: string;
  classId?: string;
  title: string;
  body: string;
} {
  if (
    typeof val !== 'object' ||
    val === null ||
    !('programId' in val) ||
    !('title' in val) ||
    !('body' in val)
  ) {
    throw new Error('Invalid input: programId, title, and body are required');
  }
  const v = val as {
    programId: unknown;
    classId?: unknown;
    title: unknown;
    body: unknown;
  };
  if (typeof v.programId !== 'string' || !v.programId) {
    throw new Error('Invalid input: programId must be a non-empty string');
  }
  if (typeof v.title !== 'string' || !v.title.trim()) {
    throw new Error('Invalid input: title must be a non-empty string');
  }
  if (typeof v.body !== 'string' || !v.body.trim()) {
    throw new Error('Invalid input: body must be a non-empty string');
  }
  const title = v.title.trim().slice(0, MAX_TITLE);
  const body = v.body.trim().slice(0, MAX_BODY);
  const classId =
    typeof v.classId === 'string' && v.classId ? v.classId : undefined;
  return { programId: v.programId, classId, title, body };
}

export const announcementsRouter = router({
  /**
   * Create an announcement for one of the teacher's programs.
   * Optionally narrow to a specific class within that program.
   */
  create: protectedProcedure
    .input(parseCreateInput)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'TEACHER') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only teachers can create announcements',
        });
      }

      const membership = await ctx.db.query.programTeachers.findFirst({
        where: and(
          eq(programTeachers.programId, input.programId),
          eq(programTeachers.teacherId, ctx.user.id),
        ),
      });
      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not a teacher in this program',
        });
      }

      const [created] = await ctx.db
        .insert(announcements)
        .values({
          programId: input.programId,
          classId: input.classId,
          teacherId: ctx.user.id,
          title: input.title,
          body: input.body,
        })
        .returning();

      if (!created) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create announcement',
        });
      }

      return created;
    }),

  /**
   * List announcements visible to the logged-in user, newest first.
   * - Teachers: announcements in any program where they teach
   * - Students: announcements in any program/class they belong to
   * - Parents:  announcements relevant to any of their children
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const role = ctx.user.role;

    let programIds: string[] = [];
    let classIds: string[] = [];

    if (role === 'TEACHER') {
      const memberships = await ctx.db.query.programTeachers.findMany({
        where: eq(programTeachers.teacherId, userId),
        columns: { programId: true },
      });
      programIds = memberships.map((m) => m.programId);
    } else if (role === 'STUDENT') {
      const programs = await ctx.db.query.programStudents.findMany({
        where: eq(programStudents.studentId, userId),
        columns: { programId: true },
      });
      programIds = programs.map((p) => p.programId);
      const classes = await ctx.db.query.classStudents.findMany({
        where: eq(classStudents.studentId, userId),
        columns: { classId: true },
      });
      classIds = classes.map((c) => c.classId);
    } else if (role === 'PARENT') {
      const children = await ctx.db.query.studentParents.findMany({
        where: eq(studentParents.parentId, userId),
        columns: { studentId: true },
      });
      const studentIds = children.map((c) => c.studentId);
      if (studentIds.length === 0) return [];
      const programs = await ctx.db.query.programStudents.findMany({
        where: inArray(programStudents.studentId, studentIds),
        columns: { programId: true },
      });
      programIds = programs.map((p) => p.programId);
      const classes = await ctx.db.query.classStudents.findMany({
        where: inArray(classStudents.studentId, studentIds),
        columns: { classId: true },
      });
      classIds = classes.map((c) => c.classId);
    } else {
      return [];
    }

    if (programIds.length === 0) return [];

    const uniqueProgramIds = Array.from(new Set(programIds));
    const uniqueClassIds = Array.from(new Set(classIds));

    // Teachers see all program announcements (including class-scoped) for
    // their programs. Students/parents see program-wide announcements
    // (classId IS NULL) plus announcements scoped to their classes.
    const where =
      role === 'TEACHER'
        ? inArray(announcements.programId, uniqueProgramIds)
        : and(
            inArray(announcements.programId, uniqueProgramIds),
            or(
              isNull(announcements.classId),
              uniqueClassIds.length > 0
                ? inArray(announcements.classId, uniqueClassIds)
                : undefined,
            ),
          );

    const rows = await ctx.db.query.announcements.findMany({
      where,
      orderBy: [desc(announcements.createdAt)],
      with: {
        teacher: { columns: { id: true, name: true } },
        program: { columns: { id: true, name: true } },
        class: { columns: { id: true, name: true } },
      },
      limit: 200,
    });

    return rows;
  }),
});
