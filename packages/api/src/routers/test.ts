/**
 * Test router with mock data for development
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';

// Mock data
const MOCK_STUDENTS = [
  {
    id: '1',
    name: 'Ahmed Ibrahim',
    email: 'ahmed@example.com',
    role: 'STUDENT',
    classId: 'class-1',
    className: 'Beginner Hifz Class',
    pagesMemorized: 45,
    currentJuz: 3,
    streak: 7,
  },
  {
    id: '2',
    name: 'Fatima Hassan',
    email: 'fatima@example.com',
    role: 'STUDENT',
    classId: 'class-1',
    className: 'Beginner Hifz Class',
    pagesMemorized: 78,
    currentJuz: 5,
    streak: 12,
  },
  {
    id: '3',
    name: 'Omar Ali',
    email: 'omar@example.com',
    role: 'STUDENT',
    classId: 'class-2',
    className: 'Advanced Hifz Class',
    pagesMemorized: 234,
    currentJuz: 15,
    streak: 28,
  },
];

const MOCK_SESSIONS = [
  {
    id: 'session-1',
    studentId: '1',
    studentName: 'Ahmed Ibrahim',
    date: new Date('2025-01-15'),
    attendance: 'PRESENT',
    mistakes: 3,
    notes: 'Good progress on Surah Al-Baqarah',
  },
  {
    id: 'session-2',
    studentId: '2',
    studentName: 'Fatima Hassan',
    date: new Date('2025-01-15'),
    attendance: 'PRESENT',
    mistakes: 1,
    notes: 'Excellent tajweed',
  },
  {
    id: 'session-3',
    studentId: '1',
    studentName: 'Ahmed Ibrahim',
    date: new Date('2025-01-14'),
    attendance: 'PRESENT',
    mistakes: 5,
    notes: 'Needs more practice on pronunciation',
  },
];

export const testRouter = router({
  // Public endpoint - no auth required
  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return {
        message: `Hello ${input.name ?? 'World'}!`,
        timestamp: new Date().toISOString(),
      };
    }),

  // Get all students
  getStudents: publicProcedure.query(() => {
    return MOCK_STUDENTS;
  }),

  // Get student by ID
  getStudentById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const student = MOCK_STUDENTS.find((s) => s.id === input.id);
      if (!student) {
        throw new Error('Student not found');
      }
      return student;
    }),

  // Get sessions (protected - requires auth)
  getSessions: protectedProcedure.query(({ ctx }) => {
    return {
      sessions: MOCK_SESSIONS,
      user: ctx.user,
    };
  }),

  // Get sessions by student ID
  getSessionsByStudent: publicProcedure
    .input(z.object({ studentId: z.string() }))
    .query(({ input }) => {
      return MOCK_SESSIONS.filter((s) => s.studentId === input.studentId);
    }),

  // Create session (mutation)
  createSession: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        attendance: z.enum(['PRESENT', 'ABSENT', 'EXCUSED', 'LATE']),
        mistakes: z.number().min(0),
        notes: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const student = MOCK_STUDENTS.find((s) => s.id === input.studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      const newSession = {
        id: `session-${Date.now()}`,
        studentId: input.studentId,
        studentName: student.name,
        date: new Date(),
        attendance: input.attendance,
        mistakes: input.mistakes,
        notes: input.notes || '',
        createdBy: ctx.user.name,
      };

      // In a real app, this would save to database
      MOCK_SESSIONS.push(newSession);

      return {
        success: true,
        session: newSession,
      };
    }),

  // Get student progress
  getStudentProgress: publicProcedure
    .input(z.object({ studentId: z.string() }))
    .query(({ input }) => {
      const student = MOCK_STUDENTS.find((s) => s.id === input.studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      return {
        studentId: student.id,
        studentName: student.name,
        pagesMemorized: student.pagesMemorized,
        currentJuz: student.currentJuz,
        streak: student.streak,
        totalPages: 604,
        progress: (student.pagesMemorized / 604) * 100,
      };
    }),
});
