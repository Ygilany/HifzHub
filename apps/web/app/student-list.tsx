'use client';

/**
 * Client component demonstrating tRPC client-side usage
 */

import { api } from '@/lib/trpc/client';
import { useState } from 'react';

export function StudentList() {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('1');

  // Client-side query
  const { data: progress, isLoading } = api.test.getStudentProgress.useQuery({
    studentId: selectedStudentId,
  });

  const { data: sessions } = api.test.getSessionsByStudent.useQuery({
    studentId: selectedStudentId,
  });

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
        Student Details (Client-side)
      </h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
        Data fetched from tRPC API using React Query hooks
      </p>

      {/* Student Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
          Select Student:
        </label>
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50"
        >
          <option value="1">Ahmed Ibrahim</option>
          <option value="2">Fatima Hassan</option>
          <option value="3">Omar Ali</option>
        </select>
      </div>

      {/* Progress Display */}
      {isLoading ? (
        <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
          Loading...
        </div>
      ) : progress ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-100 dark:bg-zinc-700 rounded-lg p-4 text-center">
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                Pages Memorized
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {progress.pagesMemorized}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-500">
                / {progress.totalPages}
              </div>
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-700 rounded-lg p-4 text-center">
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                Current Juz
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {progress.currentJuz}
              </div>
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-700 rounded-lg p-4 text-center">
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                Streak
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {progress.streak} days
              </div>
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-700 rounded-lg p-4 text-center">
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                Progress
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {progress.progress.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Sessions */}
          {sessions && sessions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-50">
                Recent Sessions ({sessions.length})
              </h3>
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-zinc-900 dark:text-zinc-50">
                          {new Date(session.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                          {session.notes}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 text-xs rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          {session.attendance}
                        </span>
                        <span className="px-2 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {session.mistakes} mistakes
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
