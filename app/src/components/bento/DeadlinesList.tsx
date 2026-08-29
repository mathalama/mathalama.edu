'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Calendar, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useLmsStore } from '../../store/useLmsStore';

export const DeadlinesList: React.FC = () => {
  const { modules, courses, selectLesson } = useLmsStore();
  const router = useRouter();

  const deadlines = [
    {
      id: 'dl-1',
      lessonId: 'lesson-2-uuid',
      courseId: 'go-course-uuid',
      daysLeft: 2,
      hoursLeft: 4,
      requiredAction: 'Сдать конспект и тест',
      type: 'homework',
      isOverdue: false
    },
    {
      id: 'dl-2',
      lessonId: 'lesson-math-2-uuid',
      courseId: 'math-course-uuid',
      daysLeft: 4,
      hoursLeft: 12,
      requiredAction: 'Пройти тест урока',
      type: 'test',
      isOverdue: false
    },
    {
      id: 'dl-3',
      lessonId: 'lesson-3-uuid',
      courseId: 'go-course-uuid',
      daysLeft: 7,
      hoursLeft: 0,
      requiredAction: 'Горутины и каналы',
      type: 'lesson',
      isOverdue: false
    }
  ];

  const getLessonTitle = (lessonId: string) => {
    for (const mod of modules) {
      const les = mod.lessons.find((l) => l.id === lessonId);
      if (les) return les.title;
    }
    return 'Урок';
  };

  const getCourseTitle = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    return course ? course.title.split(' ')[0] : 'Курс';
  };

  const handleOpenTask = (courseId: string, lessonId: string) => {
    selectLesson(lessonId);
    router.push(`/courses/${courseId}/lessons/${lessonId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold font-outfit" style={{ color: 'var(--text-primary)' }}>
              Ближайшие дедлайны
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Задания, требующие внимания
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
          {deadlines.length} задачи
        </span>
      </div>

      <div className="space-y-2.5">
        {deadlines.map((item) => {
          const lessonTitle = getLessonTitle(item.lessonId);
          const courseLabel = getCourseTitle(item.courseId);
          const isUrgent = item.daysLeft <= 2;

          return (
            <div
              key={item.id}
              onClick={() => handleOpenTask(item.courseId, item.lessonId)}
              className="flex items-center justify-between p-3 rounded-2xl border transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
              style={{
                background: 'var(--surface-hover, var(--border-light))',
                borderColor: 'var(--border)'
              }}
            >
              <div className="space-y-1 min-w-0 flex-1 mr-3">
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {courseLabel}
                  </span>
                  <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {item.requiredAction}
                  </span>
                </div>

                <h4 className="text-xs font-bold font-outfit truncate group-hover:text-brand transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {lessonTitle}
                </h4>
              </div>

              {/* Time Remaining Tag & Action Button */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[11px] font-extrabold border ${
                    isUrgent
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  }`}
                >
                  <AlertCircle className="w-3 h-3" />
                  <span>
                    {item.daysLeft > 0 ? `${item.daysLeft}д ` : ''}
                    {item.hoursLeft > 0 ? `${item.hoursLeft}ч` : ''}
                  </span>
                </div>

                <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-brand transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
