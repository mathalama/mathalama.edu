'use client';

import React, { useState } from 'react';
import { SmartResumeCard } from '@/components/bento/SmartResumeCard';
import { ActiveCoursesCard } from '@/components/bento/ActiveCoursesCard';
import { DeadlinesList } from '@/components/bento/DeadlinesList';
import { useLmsStore } from '@/store/useLmsStore';
import { motion } from 'framer-motion';
import { Calendar, Users, FileCheck, CheckCircle2, BookOpen, Check, X, FileText, ExternalLink } from 'lucide-react';

export default function DashboardPage() {
  const { studentName, role, courses, modules, leaderboard, reviewAssignment } = useLmsStore();

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
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  const todayFormatted = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  // ── CURATOR VIEW ──
  if (role === 'curator') {
    const totalStudents = leaderboard.length;
    const totalCourses = courses.length;
    
    // Find all lessons with pending assignments
    const pendingAssignments: any[] = [];
    modules.forEach((mod) => {
      mod.lessons.forEach((les) => {
        if (les.components?.assignment?.status === 'pending') {
          const course = courses.find((c) => c.id === mod.course_id);
          pendingAssignments.push({
            courseId: mod.course_id,
            courseTitle: course?.title || 'Курс',
            moduleId: mod.module_id,
            moduleTitle: mod.module_title,
            lesson: les,
            studentName: 'Иван Смирнов',
            studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
          });
        }
      });
    });

    let reviewsDoneCount = 0;
    modules.forEach((mod) => {
      mod.lessons.forEach((les) => {
        if (les.components?.assignment?.status === 'approved' || les.components?.assignment?.status === 'rejected') {
          reviewsDoneCount++;
        }
      });
    });

    return (
      <CuratorDashboard
        studentName={studentName}
        totalStudents={totalStudents}
        totalCourses={totalCourses}
        pendingAssignments={pendingAssignments}
        reviewsDoneCount={reviewsDoneCount}
        reviewAssignment={reviewAssignment}
      />
    );
  }

  // ── STUDENT VIEW ──
  return (
    <div className="flex flex-col min-h-[calc(100vh-2rem)] p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-outfit" style={{ color: 'var(--text-primary)' }}>
            С возвращением, {studentName}!
          </h1>
          <p className="text-xs sm:text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
            Ваше персональное учебное пространство. Осваивайте материал в удобном для вас темпе.
          </p>
        </div>
        
        <div className="flex items-center space-x-2 px-3.5 py-2 rounded-2xl border self-start sm:self-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          <Calendar className="w-4 h-4 text-brand" />
          <span className="text-xs font-bold capitalize" style={{ color: 'var(--text-secondary)' }}>
            {todayFormatted}
          </span>
        </div>
      </div>

      {/* Focused Bento Grid (Hero Lesson Track + Active Courses + Upcoming Deadlines) */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 flex-1 flex flex-col justify-start"
      >
        {/* 1. Hero: Smart In-Progress Lesson Track */}
        <motion.div variants={itemVariants}>
          <SmartResumeCard />
        </motion.div>

        {/* 2. Middle Row: Active Courses & Upcoming Deadlines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants} className="bento-card">
            <ActiveCoursesCard />
          </motion.div>
          
          <motion.div variants={itemVariants} className="bento-card">
            <DeadlinesList />
          </motion.div>
        </div>
      </motion.div>

    </div>
  );
}

// ── CURATOR SUB-COMPONENT ──
const CuratorDashboard = ({
  studentName,
  totalStudents,
  totalCourses,
  pendingAssignments,
  reviewsDoneCount,
  reviewAssignment
}: any) => {
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});

  const handleReview = (lessonId: string, status: 'approved' | 'rejected') => {
    const feedbackText = feedbacks[lessonId] || (status === 'approved' 
      ? 'Превосходная работа! Все формулы записаны правильно, конспект содержит детальный разбор кода. Следующий урок разблокирован!'
      : 'Работа требует доработки. Пожалуйста, дополните конспект и отправьте заново.');
    
    reviewAssignment(lessonId, status, feedbackText);
    
    // Clear feedback state
    setFeedbacks(prev => {
      const next = { ...prev };
      delete next[lessonId];
      return next;
    });
  };

  const statCards = [
    { icon: <Users className="w-5 h-5" />, label: 'Всего студентов', value: totalStudents.toString(), color: 'text-brand', bg: 'bg-brand/10' },
    { icon: <FileCheck className="w-5 h-5" />, label: 'ДЗ на проверке', value: pendingAssignments.length.toString(), color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { icon: <CheckCircle2 className="w-5 h-5" />, label: 'Проверено конспектов', value: reviewsDoneCount.toString(), color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: <BookOpen className="w-5 h-5" />, label: 'Активных курсов', value: totalCourses.toString(), color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-2rem)] p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Welcome Header */}
      <div className="border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-outfit" style={{ color: 'var(--text-primary)' }}>
          Панель проверки куратора
        </h1>
        <p className="text-xs sm:text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
          Добро пожаловать, {studentName}. Ниже представлена очередь конспектов, ожидающих проверки.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bento-card p-4 sm:p-5 space-y-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${card.bg} ${card.color}`}>
              {card.icon}
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black font-outfit" style={{ color: 'var(--text-primary)' }}>{card.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Queue section */}
      <div className="space-y-4">
        <h2 className="text-lg font-black font-outfit" style={{ color: 'var(--text-primary)' }}>
          Очередь домашних заданий ({pendingAssignments.length})
        </h2>

        {pendingAssignments.length === 0 ? (
          <div className="bento-card p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Все работы проверены!</h3>
              <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Отличная работа! В очереди нет заданий, ожидающих вашей проверки.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {pendingAssignments.map((item: any, idx: number) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={item.lesson.id}
                className="bento-card p-6 space-y-4 border hover:border-brand/20 transition-all"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-brand/10 text-brand border border-brand/20 rounded-md">
                      {item.courseTitle}
                    </span>
                    <h3 className="text-base font-extrabold font-outfit mt-1.5" style={{ color: 'var(--text-primary)' }}>
                      {item.lesson.title}
                    </h3>
                    <p className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                      {item.moduleTitle}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 bg-zinc-50 dark:bg-zinc-900/60 p-2 rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
                    <img
                      src={item.studentAvatar}
                      alt={item.studentName}
                      className="w-8 h-8 rounded-full border"
                      style={{ borderColor: 'var(--border)' }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{item.studentName}</div>
                      <div className="text-[10px] text-zinc-400 font-medium">Студент потока</div>
                    </div>
                  </div>
                </div>

                {/* Body: Assignment details */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                      Материалы для проверки:
                    </span>
                    <a
                      href={item.lesson.components.assignment.file_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-extrabold text-brand hover:underline flex items-center space-x-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Открыть конспект (PDF)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Feedback Textarea */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-secondary)' }}>
                      Ваш комментарий / фидбек
                    </label>
                    <textarea
                      value={feedbacks[item.lesson.id] || ''}
                      onChange={(e) => setFeedbacks(prev => ({ ...prev, [item.lesson.id]: e.target.value }))}
                      placeholder="Напишите отзыв на работу студента. Укажите, что сделано отлично, а что можно улучшить..."
                      className="w-full h-24 p-3 rounded-xl text-xs border outline-none focus:border-brand transition-all resize-none"
                      style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                {/* Footer: Approve / Reject Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    onClick={() => handleReview(item.lesson.id, 'rejected')}
                    className="px-4 py-2.5 rounded-xl border border-rose-500/20 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Отклонить</span>
                  </button>
                  <button
                    onClick={() => handleReview(item.lesson.id, 'approved')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shadow-md shadow-emerald-500/10"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Одобрить</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

