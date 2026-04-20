/**
 * Sessions router
 * Handles session creation and management
 */

import {
  assignments,
  sessions,
  users,
  wordMistakes,
} from "@hifzhub/database/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

// Assignment input schema
const assignmentInputSchema = z.object({
  type: z.enum(["NEW_MEMORIZATION", "RECENT_REVISION", "DISTANT_REVISION"]),
  startSurah: z.number().min(1).max(114),
  startAyah: z.number().min(1),
  endSurah: z.number().min(1).max(114),
  endAyah: z.number().min(1),
  ayahCount: z.number().optional(),
  grade: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
});

// Session creation input schema
const createSessionInputSchema = z.object({
  studentId: z.string().uuid(),
  sessionDate: z.string().or(z.date()),
  attendanceStatus: z.enum(["PRESENT", "ABSENT", "EXCUSED", "LATE"]),
  durationMinutes: z.number().min(1).max(300).optional(),
  qualityRating: z.number().min(1).max(5).optional(),
  teacherNotes: z.string().optional(),
  assignments: z.array(assignmentInputSchema).min(0).max(10),
});

export const sessionsRouter = router({
  /**
   * Create a new session with assignments
   */
  create: protectedProcedure
    .input(createSessionInputSchema)
    .mutation(async ({ ctx, input }) => {
      const teacherId = ctx.user.id;
      const userRole = ctx.user.role;

      // Verify user is a teacher
      if (userRole !== "TEACHER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only teachers can create sessions",
        });
      }

      // Verify student exists
      const student = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.studentId),
      });

      if (!student || student.role !== "STUDENT") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student not found",
        });
      }

      // Determine session type based on assignments
      let sessionType: "NEW_HIFZ" | "RECENT_REVIEW" | "OLD_REVIEW" | "MIXED" =
        "MIXED";
      if (input.assignments.length > 0) {
        const types = new Set(input.assignments.map((a) => a.type));
        if (types.size === 1) {
          const firstAssignment = input.assignments[0];
          if (firstAssignment) {
            const type = firstAssignment.type;
            if (type === "NEW_MEMORIZATION") sessionType = "NEW_HIFZ";
            else if (type === "RECENT_REVISION") sessionType = "RECENT_REVIEW";
            else if (type === "DISTANT_REVISION") sessionType = "OLD_REVIEW";
          }
        }
      }

      // Create the session
      const result = await ctx.db
        .insert(sessions)
        .values({
          studentId: input.studentId,
          teacherId,
          sessionDate: new Date(input.sessionDate),
          sessionType,
          attendanceStatus: input.attendanceStatus,
          durationMinutes: input.durationMinutes,
          qualityRating: input.qualityRating,
          teacherNotes: input.teacherNotes,
        })
        .returning();

      const newSession = result[0];
      if (!newSession) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create session",
        });
      }

      // Create assignments if any
      if (input.assignments.length > 0) {
        await ctx.db.insert(assignments).values(
          input.assignments.map((a) => ({
            sessionId: newSession.id,
            studentId: input.studentId,
            type: a.type,
            startSurah: a.startSurah,
            startAyah: a.startAyah,
            endSurah: a.endSurah,
            endAyah: a.endAyah,
            ayahCount: a.ayahCount,
            grade: a.grade,
            notes: a.notes,
            status: "COMPLETED" as const,
          }))
        );
      }

      return {
        id: newSession.id,
        success: true,
      };
    }),

  /**
   * Save word-level mistakes recorded by a teacher for a student.
   * Each call creates a new batch; students and teachers can later
   * retrieve the latest batch via students.getWordMistakes.
   */
  recordWordMistakes: protectedProcedure
    .input(
      z.object({
        studentId: z.string().uuid(),
        mistakes: z.array(
          z.object({
            pageIndex: z.number().int().min(0),
            lineIndex: z.number().int().min(0),
            wordIndex: z.number().int().min(0),
            wordText: z.string(),
            mistakeType: z.enum(["memory", "tashkeel", "tajweed", "corrected"]),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "TEACHER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only teachers can record mistakes",
        });
      }

      const batchId = crypto.randomUUID();
      const now = new Date();

      if (input.mistakes.length > 0) {
        await ctx.db.insert(wordMistakes).values(
          input.mistakes.map((m) => ({
            batchId,
            studentId: input.studentId,
            teacherId: ctx.user.id,
            pageIndex: m.pageIndex,
            lineIndex: m.lineIndex,
            wordIndex: m.wordIndex,
            wordText: m.wordText,
            mistakeType: m.mistakeType,
            recordedAt: now,
          })),
        );
      }

      return { batchId, saved: input.mistakes.length };
    }),

  /**
   * Get a single session by ID with its assignments
   */
  getById: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.db.query.sessions.findFirst({
        where: eq(sessions.id, input.sessionId),
        with: {
          student: {
            columns: {
              id: true,
              name: true,
            },
          },
          teacher: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      }

      // Get assignments for this session
      const sessionAssignments = await ctx.db.query.assignments.findMany({
        where: eq(assignments.sessionId, input.sessionId),
      });

      return {
        ...session,
        assignments: sessionAssignments,
      };
    }),
});
