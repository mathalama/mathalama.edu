'use client';

import React from 'react';
import { SmartResumeCard } from '@/components/bento/SmartResumeCard';
import { ActiveCoursesCard } from '@/components/bento/ActiveCoursesCard';
import { DeadlinesList } from '@/components/bento/DeadlinesList';
import { useLmsStore } from '@/store/useLmsStore';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

export default function DashboardPage() {
  const studentName = useLmsStore((s) => s.studentName);

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
