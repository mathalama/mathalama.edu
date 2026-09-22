'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLmsStore } from '@/store/useLmsStore';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, UserCheck, Award, Sparkles, CheckCircle2, Users, Mail, Flame } from 'lucide-react';

export default function CoursesPage() {
  const { courses, modules, leaderboard, role, selectLesson } = useLmsStore();
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

  // ── CURATOR VIEW (Students Roster) ──
  if (role === 'curator') {
    const studentList = leaderboard.map((st) => {
      // If it's the current student, calculate dynamic progress across all courses
      if (st.isCurrentUser) {
        const courseProgresses = courses.map((course) => {
          const courseModules = modules.filter((m) => m.course_id === course.id);
          const total = courseModules.reduce((s, m) => s + m.lessons.length, 0);
          const completed = courseModules.reduce((s, m) => s + m.lessons.filter((l) => l.status === 'completed').length, 0);
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
          return { courseTitle: course.title, percent: pct };
        });
        return {
          ...st,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          streak: 14,
          email: 'student@example.com',
          courseProgresses
        };
      }
      
      // For other students, generate static progresses based on rank
      const mockProgresses = courses.map((course, idx) => {
        let pct = 0;
        if (st.student_id === 'stud-1') {
          pct = idx === 0 ? 100 : idx === 1 ? 50 : 0;
        } else if (st.student_id === 'stud-2') {
          pct = idx === 0 ? 85 : idx === 1 ? 0 : 0;
        } else if (st.student_id === 'stud-3') {
          pct = idx === 0 ? 70 : idx === 1 ? 0 : 0;
        } else if (st.student_id === 'stud-4') {
          pct = idx === 0 ? 40 : idx === 1 ? 0 : 0;
        } else {
          pct = idx === 0 ? 25 : idx === 1 ? 0 : 0;
        }
        return { courseTitle: course.title, percent: pct };
      });

      const avatars: Record<string, string> = {
        'stud-1': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        'stud-2': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        'stud-3': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        'stud-4': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        'stud-5': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      };

      const streaks: Record<string, number> = {
        'stud-1': 28,
        'stud-2': 19,
        'stud-3': 7,
        'stud-4': 4,
        'stud-5': 2
      };

      const emails: Record<string, string> = {
        'stud-1': 'maria@example.com',
        'stud-2': 'alexander@example.com',
        'stud-3': 'elena@example.com',
        'stud-4': 'damir@example.com',
        'stud-5': 'sofia@example.com'
      };

      return {
        ...st,
        avatar: avatars[st.student_id] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        streak: streaks[st.student_id] || 0,
        email: emails[st.student_id] || 'student@example.com',
        courseProgresses: mockProgresses
      };
    });

    return (
      <CuratorStudentsRoster studentList={studentList} />
    );
  }

  // ── STUDENT VIEW (Courses List) ──
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

// ── CURATOR SUB-COMPONENT ──
const CuratorStudentsRoster = ({ studentList }: any) => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-2rem)] p-6 md:p-8 space-y-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center space-x-2 text-brand font-bold text-xs uppercase tracking-wider mb-1">
          <Users className="w-4 h-4" />
          <span>Группы и успеваемость</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-outfit" style={{ color: 'var(--text-primary)' }}>
          Мои Студенты
        </h1>
        <p className="text-xs sm:text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
          Список студентов вашего потока, их активность, баллы успеваемости и прогресс по курсам.
        </p>
      </div>

      {/* Roster list */}
      <div className="grid grid-cols-1 gap-4">
        {studentList.map((student: any, idx: number) => (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={student.student_id}
            className="bento-card p-5 sm:p-6 border hover:border-brand/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            {/* Left part: Profile Info */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={student.avatar}
                  alt={student.student_name}
                  className="w-14 h-14 rounded-2xl border object-cover"
                  style={{ borderColor: 'var(--border)' }}
                />
                <span className="absolute -top-2 -left-2 w-6 h-6 bg-brand text-white text-[10px] font-black rounded-xl flex items-center justify-center border-2 border-white dark:border-zinc-900">
                  #{student.rank}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-extrabold font-outfit" style={{ color: 'var(--text-primary)' }}>
                    {student.student_name}
                  </h3>
                  {student.isCurrentUser && (
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-brand/10 text-brand border border-brand/20 rounded-md">
                      Вы
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-medium flex items-center" style={{ color: 'var(--text-tertiary)' }}>
                  <Mail className="w-3.5 h-3.5 mr-1 text-zinc-400" />
                  <span>{student.email}</span>
                </p>
                <div className="flex items-center space-x-3 text-[11px] font-bold">
                  <span className="flex items-center text-amber-500">
                    <Flame className="w-3.5 h-3.5 mr-0.5" />
                    <span>Стрик: {student.streak} дн</span>
                  </span>
                  <span className="flex items-center text-purple-500">
                    <Award className="w-3.5 h-3.5 mr-0.5" />
                    <span>{student.xp_score} XP</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right part: Course Progresses */}
            <div className="flex-1 max-w-md w-full space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                Прогресс по программам
              </div>
              <div className="space-y-2.5">
                {student.courseProgresses.map((prog: any, pidx: number) => (
                  <div key={pidx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="truncate max-w-[280px]" style={{ color: 'var(--text-secondary)' }}>{prog.courseTitle}</span>
                      <span style={{ color: prog.percent === 100 ? 'var(--color-emerald-500)' : 'var(--text-secondary)' }}>
                        {prog.percent}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div
                        className={`h-full rounded-full ${prog.percent === 100 ? 'bg-emerald-500' : 'bg-brand'}`}
                        style={{ width: `${prog.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

