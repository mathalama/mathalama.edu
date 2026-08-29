'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLmsStore } from '@/store/useLmsStore';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, UserCheck, Award, Sparkles, CheckCircle2 } from 'lucide-react';

export default function CoursesPage() {
  const { courses, modules, selectLesson } = useLmsStore();
  const router = useRouter();

  const handleOpenCourse = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

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
        
        {/* Header section */}
        <div className="border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center space-x-2 text-brand font-bold text-xs uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Каталог и учебные треки</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-outfit" style={{ color: 'var(--text-primary)' }}>
            Мои Курсы
          </h1>
          <p className="text-xs sm:text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
            Ваш персональный учебный план и доступные программы обучения.
          </p>
        </div>

        {/* Courses grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1"
        >
          {courses.map((course) => {
            const courseModules = modules.filter((m) => m.course_id === course.id);
            const total = courseModules.reduce((s, m) => s + m.lessons.length, 0);
            const completed = courseModules.reduce((s, m) => s + m.lessons.filter((l) => l.status === 'completed').length, 0);
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            const currentLesson = courseModules.flatMap(m => m.lessons).find(l => l.status === 'unlocked') || courseModules[0]?.lessons[0];

            return (
              <motion.div
                key={course.id}
                variants={itemVariants}
                className="bento-card flex flex-col justify-between h-full hover:border-brand/40 cursor-pointer group transition-all"
                onClick={() => handleOpenCourse(course.id)}
              >
                <div className="space-y-4">
                  {/* Icon and category badge */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-brand bg-brand/10 border border-brand/20 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    {pct === 100 ? (
                      <span className="flex items-center text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Завершен
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                        В процессе
                      </span>
                    )}
                  </div>

                  {/* Course text */}
                  <div className="space-y-2">
                    <h2 className="text-xl font-extrabold group-hover:text-brand transition-colors font-outfit" style={{ color: 'var(--text-primary)' }}>
                      {course.title}
                    </h2>
                    <p className="text-xs font-semibold flex items-center" style={{ color: 'var(--text-secondary)' }}>
                      <UserCheck className="w-3.5 h-3.5 mr-1 text-brand" />
                      <span>{course.cohort_name} · Преподаватель: {course.curator_name}</span>
                    </p>
                    <p className="text-xs sm:text-sm font-medium leading-relaxed pt-1" style={{ color: 'var(--text-secondary)' }}>
                      {course.description}
                    </p>
                  </div>
                </div>

                {/* Progress bar and button */}
                <div className="space-y-4 pt-6 mt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span style={{ color: 'var(--text-secondary)' }}>Прогресс обучения</span>
                      <span className="text-brand font-black">{pct}% ({completed}/{total} уроков)</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div
                        className="h-full bg-brand rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-extrabold text-brand group-hover:text-brand-dark pt-1">
                    <span>Открыть программу курса</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
  );
}
