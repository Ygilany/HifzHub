import { api } from '@/lib/trpc/server';
import { StudentList } from './student-list';

export default async function Home() {
  // Fetch students using tRPC server-side
  const students = await api.test.getStudents();
  const greeting = await api.test.hello({ name: 'HifzHub' });

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">
            HifzHub - tRPC Demo
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            {greeting.message} - {new Date(greeting.timestamp).toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
            Students ({students.length})
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Data fetched from tRPC API (Server-side)
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <div
                key={student.id}
                className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-lg mb-2 text-zinc-900 dark:text-zinc-50">
                  {student.name}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                  {student.email}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  Class: {student.className}
                </p>
                <div className="grid grid-cols-3 gap-2 text-center mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-500">Pages</div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {student.pagesMemorized}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-500">Juz</div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {student.currentJuz}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-500">Streak</div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {student.streak}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client-side component for interactive features */}
        <StudentList />
      </div>
    </div>
  );
}
