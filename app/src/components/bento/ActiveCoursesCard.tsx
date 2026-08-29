'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLmsStore } from '../../store/useLmsStore';
import { BookOpen, ChevronRight, CheckCircle2, Award, ArrowUpRight } from 'lucide-react';

export const ActiveCoursesCard: React.FC = () => {
  const { courses, modules, selectLesson } = useLmsStore();
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-brand flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold font-outfit" style={{ color: 'var(--text-primary)' }}>
              Мои курсы
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Активные программы обучения
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push('/courses')}
          className="text-xs font-bold text-brand hover:underline flex items-center space-x-1 cursor-pointer"
        >
          <span>Все курсы</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3">
        {courses.map((course) => {
          // Get all lessons belonging to this course's modules
          const courseModules = modules.filter((m) => m.course_id === course.id);
          const allLessons = courseModules.flatMap((m) => m.lessons);
          const totalLessons = allLessons.length;
          const completedLessons = allLessons.filter((l) => l.status === 'completed').length;
          const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

          // Find current in-progress or next unlocked lesson
          const currentLesson = allLessons.find((l) => l.status === 'unlocked') || allLessons[0];

          const handleOpenCourse = () => {
            if (currentLesson) {
              selectLesson(currentLesson.id);
              router.push(`/courses/${course.id}/lessons/${currentLesson.id}`);
            } else {
              router.push(`/courses/${course.id}`);
            }
          };

          return (
            <div
              key={course.id}
              onClick={handleOpenCourse}
              className="p-4 rounded-2xl border transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
              style={{
                background: 'var(--surface-hover, var(--border-light))',
                borderColor: 'var(--border)'
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-brand/10 text-brand border border-brand/20">
                      {course.cohort_name || 'Поток 2026'}
                    </span>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Куратор: {course.curator_name}
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold font-outfit truncate pt-0.5 group-hover:text-brand transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {course.title}
                  </h4>

                  {currentLesson && (
                    <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                      Следующий шаг: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{currentLesson.title}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:bg-brand group-hover:text-white transition-all flex-shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Course Progress */}
              <div className="mt-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Пройдено {completedLessons} из {totalLessons} уроков
                  </span>
                  <span className="text-brand font-black">{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div
                    className="h-full bg-brand rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
