'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { useLmsStore } from '@/store/useLmsStore';
import { motion } from 'framer-motion';
import { BookOpen, PlayCircle, ArrowRight, UserCheck, Flame, Award } from 'lucide-react';

export default function CoursesPage() {
  const { courses, modules, selectedLessonId, selectLesson } = useLmsStore();
  const router = useRouter();

  // Find the last active/selected lesson to continue studying
  let activeCourse: any = null;
  let activeLesson: any = null;
  let activeModule: any = null;

  if (selectedLessonId) {
    modules.forEach((mod) => {
      const les = mod.lessons.find((l) => l.id === selectedLessonId);
      if (les) {
        activeLesson = les;
        activeModule = mod;
        activeCourse = courses.find((c) => c.id === mod.course_id);
      }
    });
  }

  // Fallback to first unlocked lesson if none selected
  if (!activeLesson) {
    modules.forEach((mod) => {
      const les = mod.lessons.find((l) => l.status === 'unlocked');
      if (les && !activeLesson) {
        activeLesson = les;
        activeModule = mod;
        activeCourse = courses.find((c) => c.id === mod.course_id);
      }
    });
  }

  const handleResume = () => {
    if (activeLesson && activeCourse) {
      selectLesson(activeLesson.id);
      router.push(`/courses/${activeCourse.id}/lessons/${activeLesson.id}`);
    }
  };

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
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-8 w-full">
        
        {/* Header section */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 font-outfit">Мои Курсы</h1>
          <p className="text-sm text-zinc-400 mt-1 font-medium">Ваш учебный план и доступные программы обучения.</p>
        </div>


        {/* Courses grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {courses.map((course) => {
            // Calculate progress for specific course
            const courseModules = modules.filter((m) => m.course_id === course.id);
            const total = courseModules.reduce((s, m) => s + m.lessons.length, 0);
            const completed = courseModules.reduce((s, m) => s + m.lessons.filter((l) => l.status === 'completed').length, 0);
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <motion.div
                key={course.id}
                variants={itemVariants}
                className="bento-card flex flex-col justify-between h-full hover:border-brand/35 cursor-pointer group"
                onClick={() => handleOpenCourse(course.id)}
              >
                <div className="space-y-4">
                  {/* Icon and category badge */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 group-hover:border-brand/20 group-hover:bg-brand/5 rounded-2xl flex items-center justify-center text-zinc-500 group-hover:text-brand transition-colors">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    {pct === 100 ? (
                      <span className="flex items-center text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                        <Award className="w-3.5 h-3.5 mr-1" /> Завершен
                      </span>
                    ) : (
                      <span className="text-[10px] bg-zinc-50 text-zinc-500 border border-zinc-100 px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider">
                        В процессе
                      </span>
                    )}
                  </div>

                  {/* Course text */}
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-black text-zinc-950 group-hover:text-brand transition-colors font-outfit">
                      {course.title}
                    </h2>
                    <p className="text-xs text-zinc-400 font-semibold flex items-center">
                      <UserCheck className="w-3.5 h-3.5 mr-1 text-zinc-300" />
                      <span>{course.cohort_name} · Преподаватель: {course.curator_name}</span>
                    </p>
                    <p className="text-sm text-zinc-500 font-medium leading-relaxed pt-1.5">
                      {course.description}
                    </p>
                  </div>
                </div>

                {/* Progress bar and button */}
                <div className="space-y-4 pt-6 mt-6 border-t border-zinc-100">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-zinc-400">Прогресс обучения</span>
                      <span className="text-brand font-black">{pct}% ({completed}/{total} уроков)</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-50 border border-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center text-xs font-black text-brand group-hover:text-brand-dark pt-1.5">
                    <span>Открыть программу курса</span>
                    <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </DashboardLayout>
  );
}

