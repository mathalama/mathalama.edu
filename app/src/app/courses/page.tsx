'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { useLmsStore } from '@/store/useLmsStore';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, PlayCircle, Lock, ArrowRight, UserCheck } from 'lucide-react';

export default function CoursesPage() {
  const { courses, modules, selectLesson, selectedLessonId } = useLmsStore();
  const router = useRouter();

  const handleStudyLesson = (lessonId: string, courseId: string) => {
    selectLesson(lessonId);
    router.push(`/courses/${courseId}/lessons/${lessonId}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-8">
        
        {/* Header section */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 font-outfit">Мои Курсы</h1>
          <p className="text-sm text-zinc-400 mt-1 font-medium">Ваш доступный учебный план и прогресс прохождения.</p>
        </div>

        {courses.map((course) => (
          <motion.div
            key={course.id}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {/* Course card banner */}
            <motion.div 
              variants={itemVariants} 
              className="bg-white border border-zinc-150 rounded-bento p-6 md:p-8 shadow-bento flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-brand font-bold text-xs uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Активная программа</span>
                </div>
                <h2 className="text-2xl font-black text-zinc-900 font-outfit">{course.title}</h2>
                <p className="text-sm text-zinc-500 max-w-2xl leading-relaxed">{course.description}</p>
              </div>

              <div className="flex-shrink-0 bg-zinc-50 border border-zinc-100 p-4 rounded-2xl flex flex-col justify-center space-y-2">
                <div className="flex items-center text-xs font-semibold text-zinc-500">
                  <UserCheck className="w-4 h-4 mr-1.5 text-zinc-400" />
                  <span>Когорта: {course.cohort_name}</span>
                </div>
                <div className="text-[10px] text-zinc-400 font-medium">
                  Преподаватель: <strong className="text-zinc-700 font-bold">{course.curator_name}</strong>
                </div>
              </div>
            </motion.div>

            {/* Course Progress Bar */}
            {(() => {
              const total = modules.reduce((s, m) => s + m.lessons.length, 0);
              const completed = modules.reduce((s, m) => s + m.lessons.filter(l => l.status === 'completed').length, 0);
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <motion.div variants={itemVariants} className="bento-card p-5 space-y-3" style={{ borderRadius: 'var(--radius-bento)' }}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Общий прогресс курса</span>
                    <span className="font-bold text-brand">{pct}% ({completed}/{total} уроков)</span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div className="h-full bg-gradient-to-r from-brand to-indigo-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </motion.div>
              );
            })()}

            {/* Modules / Curriculum list */}
            <div className="space-y-6">
              <h3 className="text-lg font-black text-zinc-900 font-outfit tracking-tight">Программа обучения</h3>

              {modules.map((module) => (
                <motion.div
                  key={module.module_id}
                  variants={itemVariants}
                  className="bg-white border border-zinc-150 rounded-bento p-6 shadow-bento space-y-5"
                >
                  <h4 className="text-base font-extrabold text-zinc-800 font-outfit border-b border-zinc-50 pb-3">
                    {module.module_title}
                  </h4>

                  <div className="grid grid-cols-1 gap-4">
                    {module.lessons.map((lesson) => {
                      const isSelected = selectedLessonId === lesson.id;
                      let statusBadge = null;
                      let cardStyle = 'border-zinc-100 bg-white opacity-100';

                      if (lesson.status === 'completed') {
                        statusBadge = (
                          <span className="flex items-center space-x-1 text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold">
                            <CheckCircle className="w-3.5 h-3.5 mr-0.5 fill-current" />
                            Пройден
                          </span>
                        );
                        cardStyle = 'border-zinc-150 bg-zinc-50/20 hover:bg-zinc-50/50';
                      } else if (lesson.status === 'unlocked') {
                        statusBadge = (
                          <span className="flex items-center space-x-1 text-[10px] bg-brand-light text-brand px-2.5 py-1 rounded-full font-bold">
                            <PlayCircle className="w-3.5 h-3.5 mr-0.5" />
                            Доступен
                          </span>
                        );
                        cardStyle = isSelected 
                          ? 'border-brand bg-brand-light/10 shadow-sm' 
                          : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm';
                      } else {
                        statusBadge = (
                          <span className="flex items-center space-x-1 text-[10px] bg-zinc-100 text-zinc-400 px-2.5 py-1 rounded-full font-bold">
                            <Lock className="w-3 h-3 mr-0.5" />
                            Заблокирован
                          </span>
                        );
                        cardStyle = 'border-zinc-100 bg-zinc-50/30 opacity-60';
                      }

                      return (
                        <div
                          key={lesson.id}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all duration-300 gap-4 ${cardStyle}`}
                        >
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center space-x-2">
                              {statusBadge}
                              {isSelected && (
                                <span className="text-[9px] bg-brand text-white font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase">
                                  Активный
                                </span>
                              )}
                            </div>
                            <h5 className="text-sm font-bold text-zinc-800 truncate">{lesson.title}</h5>
                          </div>

                          <div className="flex-shrink-0 flex items-center">
                            {lesson.status !== 'locked' ? (
                              <button
                                onClick={() => handleStudyLesson(lesson.id, course.id)}
                                className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-brand text-white hover:bg-brand-dark shadow-sm'
                                    : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                                }`}
                              >
                                <span>{isSelected ? 'Изучать сейчас' : 'Перейти к уроку'}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-zinc-400 select-none bg-zinc-100 px-3 py-2 rounded-xl flex items-center space-x-1">
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
        ))}

      </div>
    </DashboardLayout>
  );
}
