'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { ProfileCard } from '@/components/bento/ProfileCard';
import { ActivityHeatmap } from '@/components/bento/ActivityHeatmap';
import { Leaderboard } from '@/components/bento/Leaderboard';
import { DeadlinesList } from '@/components/bento/DeadlinesList';
import { useLmsStore } from '@/store/useLmsStore';
import { motion } from 'framer-motion';
import { Flame, PlayCircle, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { courses, modules, selectedLessonId, selectLesson } = useLmsStore();
  const router = useRouter();

  // Find active course and lesson for Continue Learning widget
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
        
        {/* Dashboard Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 font-outfit">
              Мой личный кабинет
            </h1>
            <p className="text-sm text-zinc-400 mt-1 font-medium">
              Добро пожаловать в учебную среду MathalamaEdu. Проходите уроки по порядку.
            </p>
          </div>
          
          <div className="flex items-center space-x-3 bg-white border border-zinc-150 p-2.5 rounded-2xl shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-bold text-zinc-500">Система активна: Mock DB</span>
          </div>
        </div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {/* Left Column (Takes 2 spans on desktop) */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* 1. Continue learning Widget */}
            {activeLesson && activeCourse && (
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-brand/90 to-indigo-650 text-white rounded-bento p-6 md:p-8 shadow-lg shadow-brand/10 relative overflow-hidden"
              >
                <div className="absolute -right-8 -bottom-8 opacity-10 text-white pointer-events-none">
                  <PlayCircle className="w-48 h-48" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="inline-flex items-center space-x-1.5 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                      <Flame className="w-3.5 h-3.5 fill-current animate-pulse text-amber-300" />
                      <span>Продолжить обучение</span>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-bold text-white/80">{activeCourse.title}</h3>
                      <h2 className="text-xl md:text-2xl font-black font-outfit mt-1">{activeLesson.title}</h2>
                      <p className="text-xs text-white/70 mt-1 font-medium">{activeModule?.module_title}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleResume}
                    className="bg-white text-zinc-950 hover:bg-zinc-100 px-6 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center space-x-2 active:scale-95 shadow cursor-pointer self-start md:self-center"
                  >
                    <span>Изучать дальше</span>
                    <ArrowRight className="w-4 h-4 text-brand" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* 2. Activity Heatmap */}
            <motion.div variants={itemVariants} className="bento-card">
              <ActivityHeatmap />
            </motion.div>

            {/* 3. Bottom Row inside Left Column: Profile Card and Deadlines side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <motion.div variants={itemVariants} className="bento-card">
                <ProfileCard />
              </motion.div>
              
              <motion.div variants={itemVariants} className="bento-card">
                <DeadlinesList />
              </motion.div>
            </div>
          </div>

          {/* Right Column (Takes 1 span on desktop) */}
          <div className="lg:col-span-1 space-y-6 md:space-y-8">
            {/* 4. Leaderboard */}
            <motion.div variants={itemVariants} className="bento-card">
              <Leaderboard />
            </motion.div>
          </div>
        </motion.div>

      </div>
    </DashboardLayout>
  );
}
