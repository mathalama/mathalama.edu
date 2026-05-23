'use client';

import React from 'react';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { VideoPlayer } from '@/components/bento/VideoPlayer';
import { LessonFlow } from '@/components/bento/LessonFlow';
import { ProfileCard } from '@/components/bento/ProfileCard';
import { ActivityHeatmap } from '@/components/bento/ActivityHeatmap';
import { Leaderboard } from '@/components/bento/Leaderboard';
import { SpacedRepetition } from '@/components/bento/SpacedRepetition';
import { FriendsList } from '@/components/bento/FriendsList';
import { BattleArena } from '@/components/bento/BattleArena';
import { useLmsStore } from '@/store/useLmsStore';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { selectedLessonId, activeBattle } = useLmsStore();
  const [activeTab, setActiveTab] = React.useState<'player' | 'arena'>('player');

  // Auto-focus Arena tab when a battle is created or joined
  React.useEffect(() => {
    if (activeBattle) {
      setActiveTab('arena');
    }
  }, [activeBattle]);

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
      <div className="p-6 md:p-8 space-y-8">
        
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
          {/* Column 1 & 2 (Takes 2 span on desktop) */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            
            {/* Sleek Tabbed bento container */}
            <motion.div variants={itemVariants} className="bento-card relative">
              <div className="flex justify-between items-center px-6 pt-5 pb-3 border-b border-zinc-100 bg-zinc-50/50 rounded-t-bento">
                <span className="text-xs font-black text-zinc-400 uppercase tracking-widest font-outfit">
                  Обучение и Баттлы
                </span>
                
                <div className="flex bg-zinc-200/60 p-0.5 rounded-xl border border-zinc-300/35">
                  <button
                    onClick={() => setActiveTab('player')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                      activeTab === 'player'
                        ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/55'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    Урок и Конспект
                  </button>
                  <button
                    onClick={() => setActiveTab('arena')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                      activeTab === 'arena'
                        ? 'bg-white text-indigo-650 shadow-sm border border-zinc-200/55'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    Арена Соревнований
                    {activeBattle && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-0">
                {activeTab === 'player' ? (
                  <VideoPlayer lessonId={selectedLessonId || 'lesson-2-uuid'} />
                ) : (
                  <BattleArena />
                )}
              </div>
            </motion.div>

            {/* 2. Activity Heatmap */}
            <motion.div variants={itemVariants} className="bento-card">
              <ActivityHeatmap />
            </motion.div>

            {/* 3. Bottom Row Stats: Profile and Leaderboard on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <motion.div variants={itemVariants} className="bento-card">
                <ProfileCard />
              </motion.div>
              
              <motion.div variants={itemVariants} className="bento-card">
                <Leaderboard />
              </motion.div>
            </div>
          </div>

          {/* Column 3 (Takes 1 span on desktop) - Daily review, friends, and Lesson pipeline */}
          <div className="lg:col-span-1 space-y-6 md:space-y-8">
            {/* 1. Spaced Repetition (Daily Warm-up) */}
            <motion.div variants={itemVariants} className="bento-card">
              <SpacedRepetition />
            </motion.div>

            {/* 2. Friends and Chat Bento List */}
            <motion.div variants={itemVariants} className="bento-card">
              <FriendsList />
            </motion.div>

            {/* 3. Lesson Flow Dripping Pipeline */}
            <motion.div variants={itemVariants} className="bento-card bg-white border border-zinc-200">
              <LessonFlow lessonId={selectedLessonId || 'lesson-2-uuid'} />
            </motion.div>
          </div>

        </motion.div>

      </div>
    </DashboardLayout>
  );
}
