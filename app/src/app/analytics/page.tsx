'use client';

import React from 'react';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { useLmsStore } from '@/store/useLmsStore';
import { motion } from 'framer-motion';
import { BarChart3, Clock, TrendingUp, Target, Flame, Trophy, BookOpen } from 'lucide-react';

export default function AnalyticsPage() {
  const { weeklyXp, leaderboard, heatmap, modules, streak, videoNotes } = useLmsStore();

  const currentUser = leaderboard.find((u) => u.isCurrentUser);
  const totalXP = currentUser?.xp_score || 1200;
  const maxXp = Math.max(...weeklyXp.map((d) => d.xp), 1);
  const totalMinutes = weeklyXp.reduce((sum, d) => sum + d.minutes, 0);
  const totalWeekXp = weeklyXp.reduce((sum, d) => sum + d.xp, 0);

  // Course funnel
  let totalLessons = 0;
  let completedLessons = 0;
  let unlockedLessons = 0;
  modules.forEach((mod) => {
    mod.lessons.forEach((les) => {
      totalLessons++;
      if (les.status === 'completed') completedLessons++;
      if (les.status === 'unlocked') unlockedLessons++;
    });
  });

  // Average cohort XP
  const cohortAvg = leaderboard.length > 0
    ? Math.round(leaderboard.reduce((s, l) => s + l.xp_score, 0) / leaderboard.length)
    : 0;
  const vsAvgPercent = cohortAvg > 0 ? Math.round(((totalXP - cohortAvg) / cohortAvg) * 100) : 0;

  // Active days from heatmap
  const activeDays = heatmap.filter((d) => d.activity_count > 0).length;
  const totalHeatmapXP = heatmap.reduce((s, d) => s + d.xp_earned, 0);

  const statCards = [
    { icon: <Trophy className="w-5 h-5" />, label: 'Общий XP', value: totalXP.toLocaleString(), color: 'text-brand', bg: 'bg-brand-light' },
    { icon: <Flame className="w-5 h-5" />, label: 'Серия дней', value: `${streak} дней`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: <Clock className="w-5 h-5" />, label: 'Время за неделю', value: `${totalMinutes} мин`, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { icon: <BookOpen className="w-5 h-5" />, label: 'Заметок создано', value: videoNotes.length.toString(), color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit" style={{ color: 'var(--text-primary)' }}>
            Аналитика
          </h1>
          <p className="text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
            Детальная статистика вашего обучения и прогресса
          </p>
        </div>

        {/* Stat Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {statCards.map((card, i) => (
            <motion.div key={i} variants={itemVariants} className="bento-card p-5 space-y-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg} ${card.color}`}>
                {card.icon}
              </div>
              <div>
                <div className="text-2xl font-black font-outfit" style={{ color: 'var(--text-primary)' }}>{card.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{card.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly XP Chart */}
          <motion.div variants={itemVariants} initial="hidden" animate="show" className="bento-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-brand" />
                <h3 className="text-lg font-bold font-outfit" style={{ color: 'var(--text-primary)' }}>XP за неделю</h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-light text-brand">
                {totalWeekXp} XP
              </span>
            </div>

            {/* Bar chart (pure CSS) */}
            <div className="flex items-end justify-between h-48 gap-3 px-2">
              {weeklyXp.map((entry, i) => {
                const heightPercent = (entry.xp / maxXp) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end space-y-2 group">
                    <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                      {entry.xp}
                    </span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
                      className="w-full bg-gradient-to-t from-brand to-blue-400 rounded-xl min-h-[4px] group-hover:from-brand-dark group-hover:to-blue-500 transition-colors cursor-pointer"
                    />
                    <span className="text-[10px] font-bold" style={{ color: 'var(--text-tertiary)' }}>
                      {entry.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Course Funnel */}
          <motion.div variants={itemVariants} initial="hidden" animate="show" className="bento-card p-6 space-y-6">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-brand" />
              <h3 className="text-lg font-bold font-outfit" style={{ color: 'var(--text-primary)' }}>Воронка курса</h3>
            </div>

            <div className="space-y-4">
              {/* Completed */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span style={{ color: 'var(--text-secondary)' }}>Пройденные уроки</span>
                  <span className="text-emerald-600 font-bold">{completedLessons}/{totalLessons}</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedLessons / totalLessons) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>

              {/* In Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span style={{ color: 'var(--text-secondary)' }}>В процессе</span>
                  <span className="text-brand font-bold">{unlockedLessons}/{totalLessons}</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(unlockedLessons / totalLessons) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                    className="h-full bg-brand rounded-full"
                  />
                </div>
              </div>

              {/* Overall progress */}
              <div className="pt-4 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Общий прогресс курса</div>
                <div className="text-4xl font-black font-outfit" style={{ color: 'var(--text-primary)' }}>
                  {Math.round((completedLessons / totalLessons) * 100)}%
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Comparison with Cohort */}
        <motion.div variants={itemVariants} initial="hidden" animate="show" className="bento-card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-brand" />
            <h3 className="text-lg font-bold font-outfit" style={{ color: 'var(--text-primary)' }}>Сравнение с когортой</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>Ваш XP</div>
              <div className="text-2xl font-black font-outfit text-brand mt-1">{totalXP.toLocaleString()}</div>
            </div>
            <div className="text-center p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>Среднее по потоку</div>
              <div className="text-2xl font-black font-outfit mt-1" style={{ color: 'var(--text-primary)' }}>{cohortAvg.toLocaleString()}</div>
            </div>
            <div className="text-center p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>Ваш результат</div>
              <div className={`text-2xl font-black font-outfit mt-1 ${vsAvgPercent >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {vsAvgPercent >= 0 ? '+' : ''}{vsAvgPercent}%
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
              Всего активных дней: {activeDays} · Всего заработано: {totalHeatmapXP.toLocaleString()} XP
            </span>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
