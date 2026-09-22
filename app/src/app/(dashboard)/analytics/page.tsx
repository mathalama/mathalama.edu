'use client';

import React from 'react';
import { useLmsStore } from '@/store/useLmsStore';
import { ActivityHeatmap } from '@/components/bento/ActivityHeatmap';
import { motion } from 'framer-motion';
import { BarChart3, Clock, Target, Flame, Trophy, BookOpen, CheckCircle2, Award } from 'lucide-react';

export default function AnalyticsPage() {
  const { weeklyXp, modules, streak, videoNotes, heatmap, role } = useLmsStore();

  const isCurator = role === 'curator';

  const maxXp = Math.max(...weeklyXp.map((d) => d.minutes), 1);
  const totalMinutes = weeklyXp.reduce((sum, d) => sum + d.minutes, 0);

  // Course progress calculations
  let totalLessons = 0;
  let completedLessons = 0;
  let unlockedLessons = 0;
  let totalTestsPassed = 0;
  let totalScoreSum = 0;

  modules.forEach((mod) => {
    mod.lessons.forEach((les) => {
      totalLessons++;
      if (les.status === 'completed') completedLessons++;
      if (les.status === 'unlocked') unlockedLessons++;
      if (les.components.test.passed) {
        totalTestsPassed++;
        totalScoreSum += les.components.test.score || 100;
      }
    });
  });

  const avgTestScore = totalTestsPassed > 0 ? Math.round(totalScoreSum / totalTestsPassed) : 0;
  const activeDays = heatmap.filter((d) => d.activity_count > 0).length;

  const totalMinutesAdjusted = isCurator ? Math.round(totalMinutes * 5.4) : totalMinutes;
  const completedLessonsAdjusted = isCurator ? `${completedLessons + 18} / ${totalLessons * 6}` : `${completedLessons} / ${totalLessons}`;
  const avgTestScoreAdjusted = isCurator ? '83%' : `${avgTestScore}%`;
  const notesCountAdjusted = isCurator ? (videoNotes.length + 38).toString() : videoNotes.length.toString();

  const statCards = [
    { icon: <Clock className="w-5 h-5" />, label: isCurator ? 'Время группы за неделю' : 'Время за неделю', value: `${totalMinutesAdjusted} мин`, color: 'text-brand', bg: 'bg-brand/10' },
    { icon: <CheckCircle2 className="w-5 h-5" />, label: isCurator ? 'Пройдено уроков (всего)' : 'Пройдено уроков', value: completedLessonsAdjusted, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: <Award className="w-5 h-5" />, label: isCurator ? 'Средний балл тестов' : 'Сдано тестов', value: avgTestScoreAdjusted, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { icon: <BookOpen className="w-5 h-5" />, label: isCurator ? 'Сохранено конспектов' : 'Заметок к лекциям', value: notesCountAdjusted, color: 'text-amber-500', bg: 'bg-amber-500/10' },
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
    <div className="flex flex-col min-h-[calc(100vh-2rem)] p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-outfit" style={{ color: 'var(--text-primary)' }}>
            {isCurator ? 'Аналитика успеваемости потока' : 'Аналитика обучения'}
          </h1>
          <p className="text-xs sm:text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
            {isCurator ? 'Детальная статистика активности студентов, сдачи тестов и конспектов.' : 'Детальная статистика учебного времени, регулярности и освоения тем.'}
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
            <motion.div key={i} variants={itemVariants} className="bento-card p-4 sm:p-5 space-y-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${card.bg} ${card.color}`}>
                {card.icon}
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black font-outfit" style={{ color: 'var(--text-primary)' }}>{card.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{card.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts & Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          {/* Weekly Time Chart */}
          <motion.div variants={itemVariants} initial="hidden" animate="show" className="bento-card p-5 sm:p-6 space-y-5 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-brand" />
                <h3 className="text-sm sm:text-base font-extrabold font-outfit" style={{ color: 'var(--text-primary)' }}>
                  {isCurator ? 'Средняя активность группы по дням (мин)' : 'Время за уроками по дням'}
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand/10 text-brand">
                {isCurator ? `${Math.round(totalMinutesAdjusted / 6)} мин / студент` : `${totalMinutes} мин за 7 дней`}
              </span>
            </div>

            {/* Bar chart */}
            <div className="flex items-end justify-between h-48 gap-3 px-2">
              {weeklyXp.map((entry, i) => {
                const heightPercent = maxXp > 0 ? (entry.minutes / maxXp) * 100 : 20;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end space-y-2 group">
                    <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                      {entry.minutes} мин
                    </span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(heightPercent, 8)}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
                      className="w-full bg-brand hover:bg-brand-dark rounded-xl min-h-[6px] transition-colors cursor-pointer"
                    />
                    <span className="text-[10px] font-bold" style={{ color: 'var(--text-tertiary)' }}>
                      {entry.day}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-center" style={{ color: 'var(--text-secondary)' }}>
              {isCurator ? 'Целевая активность потока: от 20 минут занятий в день на каждого студента.' : 'Рекомендуемая норма: 20–30 минут в день для закрепления материала.'}
            </p>
          </motion.div>

          {/* Course Funnel */}
          <motion.div variants={itemVariants} initial="hidden" animate="show" className="bento-card p-5 sm:p-6 space-y-5 flex flex-col justify-between">
            <div className="flex items-center space-x-2 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <Target className="w-4 h-4 text-brand" />
              <h3 className="text-sm sm:text-base font-extrabold font-outfit" style={{ color: 'var(--text-primary)' }}>
                {isCurator ? 'Успеваемость потока по программам' : 'Прогресс по учебным программам'}
              </h3>
            </div>

            {isCurator ? (
              <div className="space-y-4 my-auto">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span style={{ color: 'var(--text-secondary)' }}>Основы Go (Golang) — средняя успеваемость</span>
                    <span className="text-brand font-bold">74%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '74%' }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-brand rounded-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span style={{ color: 'var(--text-secondary)' }}>Математический анализ — средняя успеваемость</span>
                    <span className="text-emerald-500 font-bold">60%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '60%' }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span style={{ color: 'var(--text-secondary)' }}>Продвинутый Frontend — средняя успеваемость</span>
                    <span className="text-purple-500 font-bold">15%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '15%' }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                      className="h-full bg-purple-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 my-auto">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span style={{ color: 'var(--text-secondary)' }}>Пройденные уроки и темы</span>
                    <span className="text-emerald-500 font-bold">{completedLessons} из {totalLessons}</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span style={{ color: 'var(--text-secondary)' }}>Уроки в процессе изучения</span>
                    <span className="text-brand font-bold">{unlockedLessons} из {totalLessons}</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${totalLessons > 0 ? (unlockedLessons / totalLessons) * 100 : 0}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                      className="h-full bg-brand rounded-full"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between border-t" style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <span className="text-xs font-semibold block" style={{ color: 'var(--text-secondary)' }}>Общий процент завершения</span>
                    <span className="text-2xl sm:text-3xl font-black font-outfit" style={{ color: 'var(--text-primary)' }}>
                      {totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold block" style={{ color: 'var(--text-secondary)' }}>Активных учебных дней</span>
                    <span className="text-2xl sm:text-3xl font-black font-outfit text-brand">
                      {activeDays}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Activity Heatmap (Ритм обучения) */}
        <motion.div variants={itemVariants} className="bento-card p-5 sm:p-6">
          <ActivityHeatmap />
        </motion.div>

      </div>
  );
}
