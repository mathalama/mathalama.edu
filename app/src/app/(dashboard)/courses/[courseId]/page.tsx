'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { useLmsStore } from '@/store/useLmsStore';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, PlayCircle, Lock, ArrowRight, UserCheck, ChevronRight, ArrowLeft } from 'lucide-react';

export default function CourseSyllabusPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  const { courses, modules, selectedLessonId, selectLesson } = useLmsStore();
  const router = useRouter();

  // Find the course
  const course = courses.find((c) => c.id === resolvedParams.courseId);
  const courseModules = modules.filter((m) => m.course_id === resolvedParams.courseId);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>Курс не найден</p>
        <button
          onClick={() => router.push('/courses')}
          className="flex items-center space-x-2 px-4 py-2 border text-xs font-bold rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Вернуться к курсам</span>
        </button>
      </div>
    );
  }

  const handleStudyLesson = (lessonId: string) => {
    selectLesson(lessonId);
    router.push(`/courses/${course.id}/lessons/${lessonId}`);
  };

  const total = courseModules.reduce((s, m) => s + m.lessons.length, 0);
  const completed = courseModules.reduce((s, m) => s + m.lessons.filter((l) => l.status === 'completed').length, 0);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-2rem)] p-6 md:p-8 space-y-8 w-full max-w-7xl mx-auto">
        
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
          <button onClick={() => router.push('/courses')} className="hover:text-brand transition-colors cursor-pointer flex items-center">
            Мои Курсы
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span style={{ color: 'var(--text-primary)' }}>{course.title}</span>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6 flex-1"
        >
          {/* Course card banner */}
          <motion.div 
            variants={itemVariants} 
            className="bento-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-2.5">
              <div className="flex items-center space-x-2 text-brand font-bold text-xs uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>Программа обучения</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit" style={{ color: 'var(--text-primary)' }}>
                {course.title}
              </h1>
              <p className="text-xs sm:text-sm max-w-2xl leading-relaxed font-medium" style={{ color: 'var(--text-secondary)' }}>
                {course.description}
              </p>
            </div>

            <div className="flex-shrink-0 p-4 rounded-2xl flex flex-col justify-center space-y-2 border" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
              <div className="flex items-center text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                <UserCheck className="w-4 h-4 mr-1.5 text-brand" />
                <span>Когорта: {course.cohort_name}</span>
              </div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Преподаватель: <strong style={{ color: 'var(--text-primary)' }}>{course.curator_name}</strong>
              </div>
            </div>
          </motion.div>

          {/* Course Progress Bar */}
          <motion.div variants={itemVariants} className="bento-card p-5 space-y-2.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Прогресс прохождения курса</span>
              <span className="font-extrabold text-brand">{pct}% ({completed}/{total} уроков)</span>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div className="h-full bg-brand rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
          </motion.div>

          {/* Modules / Curriculum list */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-base sm:text-lg font-extrabold font-outfit tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Разделы программы
              </h3>
              <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                Всего разделов: {courseModules.length}
              </span>
            </div>

            {courseModules.map((module) => (
              <motion.div
                key={module.module_id}
                variants={itemVariants}
                className="bento-card p-5 sm:p-6 space-y-4"
              >
                <h4 className="text-sm sm:text-base font-extrabold font-outfit" style={{ color: 'var(--text-primary)' }}>
                  {module.module_title}
                </h4>

                <div className="grid grid-cols-1 gap-3">
                  {module.lessons.map((lesson) => {
                    const isSelected = selectedLessonId === lesson.id;
                    let statusBadge = null;

                    if (lesson.status === 'completed') {
                      statusBadge = (
                        <span className="flex items-center space-x-1 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold">
                          <CheckCircle className="w-3 h-3 mr-0.5 fill-current" />
                          Пройден
                        </span>
                      );
                    } else if (lesson.status === 'unlocked') {
                      statusBadge = (
                        <span className="flex items-center space-x-1 text-[10px] bg-brand/10 text-brand border border-brand/20 px-2.5 py-1 rounded-full font-bold">
                          <PlayCircle className="w-3 h-3 mr-0.5" />
                          Доступен
                        </span>
                      );
                    } else {
                      statusBadge = (
                        <span className="flex items-center space-x-1 text-[10px] bg-zinc-200/50 dark:bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full font-bold">
                          <Lock className="w-3 h-3 mr-0.5" />
                          Заблокирован
                        </span>
                      );
                    }

                    return (
                      <div
                        key={lesson.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 gap-3 ${
                          isSelected
                            ? 'border-brand bg-brand/5 shadow-sm'
                            : 'hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                        style={{
                          background: isSelected ? undefined : 'var(--surface-hover)',
                          borderColor: isSelected ? undefined : 'var(--border)'
                        }}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            {statusBadge}
                            {isSelected && (
                              <span className="text-[9px] bg-brand text-white font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase">
                                Текущий
                              </span>
                            )}
                          </div>
                          <h5 className="text-xs sm:text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                            {lesson.title}
                          </h5>
                        </div>

                        <div className="flex-shrink-0 flex items-center">
                          {lesson.status !== 'locked' ? (
                            <button
                              onClick={() => handleStudyLesson(lesson.id)}
                              className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-brand text-white hover:bg-brand-dark shadow-sm'
                                  : 'border hover:bg-zinc-200/50 dark:hover:bg-zinc-800'
                              }`}
                              style={!isSelected ? { borderColor: 'var(--border)', color: 'var(--text-primary)' } : undefined}
                            >
                              <span>{isSelected ? 'Изучать сейчас' : 'Перейти к уроку'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold select-none px-3 py-1.5 rounded-xl flex items-center space-x-1" style={{ background: 'var(--surface)', color: 'var(--text-tertiary)', border: '1px solid var(--border)' }}>
                              <Lock className="w-3 h-3" />
                              <span>Предыдущие шаги не сданы</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

        </motion.div>
      </div>
  );
}
