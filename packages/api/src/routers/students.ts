/**
 * Students router
 * Handles student-specific operations including profile, goals, and session history
 */

import {
  assignments,
  programStudents,
  sessions,
  studentGoals,
  studentParents,
  studentProfiles,
  users,
  wordMistakes,
} from "@hifzhub/database/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const studentsRouter = router({
  /**
   * Get a student's complete profile
   * Includes: basic info, Quran progress, goals, parents, recent sessions
   */
  getProfile: protectedProcedure
    .input(z.object({ studentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { studentId } = input;

      // Get basic student info
      const student = await ctx.db.query.users.findFirst({
        where: and(eq(users.id, studentId), eq(users.role, "STUDENT")),
        columns: {
          id: true,
          email: true,
          name: true,
          phone: true,
          createdAt: true,
        },
      });

      if (!student) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not found",
        });
      }

      // Get student profile (Quran progress)
      const profile = await ctx.db.query.studentProfiles.findFirst({
        where: eq(studentProfiles.userId, studentId),
      });

      // Get student's parents with contact info
      const parentsData = await ctx.db.query.studentParents.findMany({
        where: eq(studentParents.studentId, studentId),
        with: {
          parent: {
            columns: {
              id: true,
              name: true,
              email: true,
              phone: true,
              alternatePhone: true,
            },
          },
        },
      });

      // Get active goals (semester and annual)
      const now = new Date();
      const goals = await ctx.db.query.studentGoals.findMany({
        where: and(
          eq(studentGoals.studentId, studentId),
          gte(studentGoals.endDate, now)
        ),
        orderBy: [desc(studentGoals.createdAt)],
      });

      // Get recent sessions (last 2) with their assignments
      const recentSessions = await ctx.db.query.sessions.findMany({
        where: eq(sessions.studentId, studentId),
        orderBy: [desc(sessions.sessionDate)],
        limit: 2,
        with: {
          teacher: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Get assignments for recent sessions
      const sessionIds = recentSessions.map((s) => s.id);
      const sessionAssignments =
        sessionIds.length > 0
          ? await ctx.db.query.assignments.findMany({
              where: inArray(assignments.sessionId, sessionIds),
              orderBy: [desc(assignments.createdAt)],
            })
          : [];

      // Get session statistics
      const sessionStats = await ctx.db
        .select({
          totalSessions: sql<number>`count(*)::int`,
          totalHifzSessions: sql<number>`count(*) filter (where ${sessions.sessionType} = 'NEW_HIFZ')::int`,
          totalReviewSessions: sql<number>`count(*) filter (where ${sessions.sessionType} in ('RECENT_REVIEW', 'OLD_REVIEW'))::int`,
          avgQuality: sql<number>`round(avg(${sessions.qualityRating})::numeric, 1)`,
          totalAyahsCovered: sql<number>`coalesce(sum(${sessions.ayahsCovered}), 0)::int`,
        })
        .from(sessions)
        .where(eq(sessions.studentId, studentId));

      // Get programs the student is enrolled in
      const programs = await ctx.db.query.programStudents.findMany({
        where: eq(programStudents.studentId, studentId),
        with: {
          program: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Calculate Quran completion percentage
      const TOTAL_AYAHS = 6236;
      const ayahsMemorized = profile?.totalAyahsMemorized ?? 0;
      const completionPercentage = Math.round(
        (ayahsMemorized / TOTAL_AYAHS) * 100
      );

      return {
        // Basic info
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        memberSince: student.createdAt,

        // Quran progress
        quranProgress: profile
          ? {
              currentJuz: profile.currentJuz,
              currentSurah: profile.currentSurah,
              currentAyah: profile.currentAyah,
              totalAyahsMemorized: profile.totalAyahsMemorized,
              totalJuzCompleted: profile.totalJuzCompleted,
              completionPercentage,
            }
          : {
              currentJuz: 1,
              currentSurah: 1,
              currentAyah: 1,
              totalAyahsMemorized: 0,
              totalJuzCompleted: 0,
              completionPercentage: 0,
            },

        // Enrollment info
        enrollmentDate: profile?.enrollmentDate ?? student.createdAt,
        programs: programs.map((p) => p.program),

        // Goals
        goals: {
          semester: goals.find((g) => g.type === "SEMESTER") ?? null,
          annual: goals.find((g) => g.type === "ANNUAL") ?? null,
          custom: goals.filter((g) => g.type === "CUSTOM"),
        },

        // Parent/guardian info
        parents: parentsData.map((p) => p.parent),

        // Session history with assignments
        recentSessions: recentSessions.map((s) => {
          const assignmentsForSession = sessionAssignments.filter(
            (a) => a.sessionId === s.id
          );
          return {
            id: s.id,
            date: s.sessionDate,
            attendance: s.attendanceStatus,
            duration: s.durationMinutes,
            qualityRating: s.qualityRating,
            teacherName: s.teacher.name,
            notes: s.teacherNotes,
            assignments: assignmentsForSession.map((a) => ({
              id: a.id,
              type: a.type,
              status: a.status,
              startSurah: a.startSurah,
              startAyah: a.startAyah,
              endSurah: a.endSurah,
              endAyah: a.endAyah,
              ayahCount: a.ayahCount,
              grade: a.grade,
            })),
          };
        }),

        // Statistics
        stats: {
          totalSessions: sessionStats[0]?.totalSessions ?? 0,
          totalHifzSessions: sessionStats[0]?.totalHifzSessions ?? 0,
          totalReviewSessions: sessionStats[0]?.totalReviewSessions ?? 0,
          averageQuality: sessionStats[0]?.avgQuality ?? 0,
          totalAyahsCovered: sessionStats[0]?.totalAyahsCovered ?? 0,
        },

        // Additional notes
        notes: profile?.notes ?? null,
        preferredSessionTime: profile?.preferredSessionTime ?? null,
      };
    }),

  /**
   * Get session history for a student with pagination
   */
  getSessionHistory: protectedProcedure
    .input(
      z.object({
        studentId: z.string().uuid(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
        type: z
          .enum(["NEW_HIFZ", "RECENT_REVIEW", "OLD_REVIEW", "MIXED"])
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { studentId, limit, offset, type } = input;

      const conditions = [eq(sessions.studentId, studentId)];
      if (type) {
        conditions.push(eq(sessions.sessionType, type));
      }

      const sessionList = await ctx.db.query.sessions.findMany({
        where: and(...conditions),
        orderBy: [desc(sessions.sessionDate)],
        limit,
        offset,
        with: {
          teacher: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Get total count for pagination
      const totalResult = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(sessions)
        .where(and(...conditions));

      return {
        sessions: sessionList.map((s) => ({
          id: s.id,
          date: s.sessionDate,
          type: s.sessionType,
          attendance: s.attendanceStatus,
          duration: s.durationMinutes,
          startSurah: s.startSurah,
          startAyah: s.startAyah,
          endSurah: s.endSurah,
          endAyah: s.endAyah,
          ayahsCovered: s.ayahsCovered,
          qualityRating: s.qualityRating,
          teacherName: s.teacher.name,
          notes: s.teacherNotes,
          mistakesSummary: s.mistakesSummary,
          improvementNotes: s.improvementNotes,
        })),
        total: totalResult[0]?.count ?? 0,
        hasMore: offset + limit < (totalResult[0]?.count ?? 0),
      };
    }),

  /**
   * Get student's goals
   */
  /**
   * Get the latest batch of word mistakes recorded for a student.
   * Accessible by the student themselves, their teacher, or a parent.
   */
  getWordMistakes: protectedProcedure
    .input(z.object({ studentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { studentId } = input;

      // Find the most recent recorded_at for this student
      const latest = await ctx.db
        .select({
          batchId: wordMistakes.batchId,
          recordedAt: wordMistakes.recordedAt,
        })
        .from(wordMistakes)
        .where(eq(wordMistakes.studentId, studentId))
        .orderBy(desc(wordMistakes.recordedAt))
        .limit(1);

      if (!latest[0]) return { mistakes: [], recordedAt: null };

      const { batchId, recordedAt } = latest[0];

      const mistakes = await ctx.db.query.wordMistakes.findMany({
        where: and(
          eq(wordMistakes.studentId, studentId),
          eq(wordMistakes.batchId, batchId),
        ),
      });

      return {
        mistakes: mistakes.map((m) => ({
          pageIndex: m.pageIndex,
          lineIndex: m.lineIndex,
          wordIndex: m.wordIndex,
          wordText: m.wordText,
          mistakeType: m.mistakeType,
        })),
        recordedAt,
      };
    }),

  getGoals: protectedProcedure
    .input(
      z.object({
        studentId: z.string().uuid(),
        includeCompleted: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const { studentId, includeCompleted } = input;

      const conditions = [eq(studentGoals.studentId, studentId)];

      if (!includeCompleted) {
        conditions.push(
          sql`${studentGoals.status} != 'COMPLETED'`
        );
      }

      const goals = await ctx.db.query.studentGoals.findMany({
        where: and(...conditions),
        orderBy: [desc(studentGoals.createdAt)],
        with: {
          createdBy: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      });

      return goals.map((g) => ({
        id: g.id,
        type: g.type,
        title: g.title,
        description: g.description,
        targetJuz: g.targetJuz,
        targetSurah: g.targetSurah,
        targetAyahs: g.targetAyahs,
        currentProgress: g.currentProgress,
        status: g.status,
        startDate: g.startDate,
        endDate: g.endDate,
        createdBy: g.createdBy?.name ?? null,
        progressPercentage: g.targetAyahs
          ? Math.round((g.currentProgress / g.targetAyahs) * 100)
          : 0,
      }));
    }),
});
