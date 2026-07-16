import React from 'react';
import { motion } from 'framer-motion';
import { useLmsStore } from '../../store/useLmsStore';

export const ProfileCard: React.FC = () => {
  const { leaderboard, studentName, modules, streak } = useLmsStore();
  const currentUser = leaderboard.find((u) => u.isCurrentUser);
  const totalXP = currentUser?.xp_score || 1200;

  // Level is calculated as Math.floor(XP / 1000) + 1
  const level = Math.floor(totalXP / 1000) + 1;
  const xpInCurrentLevel = totalXP % 1000;
  const xpProgressPercent = (xpInCurrentLevel / 1000) * 100;

  // Count lessons progress
  let totalLessonsCount = 0;
  let completedLessonsCount = 0;
  modules.forEach((m) => {
    totalLessonsCount += m.lessons.length;
    completedLessonsCount += m.lessons.filter((l) => l.status === 'completed').length;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex flex-col h-full justify-between space-y-6"
    >
      <div className="flex items-center space-x-4">
        {/* Animated Level Circular Indicator */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-zinc-100"
              strokeWidth="2.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <motion.path
              initial={{ strokeDasharray: '0, 100' }}
              animate={{ strokeDasharray: `${xpProgressPercent}, 100` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-brand"
              strokeWidth="2.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-zinc-400 font-medium leading-none">LVL</span>
            <span className="text-lg font-extrabold text-zinc-900 font-outfit leading-none mt-0.5">{level}</span>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-zinc-900 font-outfit">{studentName}</h3>
          <p className="text-xs text-zinc-400 font-medium">Статус: Активный студент</p>
        </div>
      </div>

      {/* Quick stats section in the middle */}
      <div className="grid grid-cols-3 gap-3.5 py-4 border-y border-zinc-100">
        <div className="text-center">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Уроки</span>
          <span className="text-xs font-black text-zinc-800 mt-1 block">
            {completedLessonsCount} / {totalLessonsCount}
          </span>
        </div>
        <div className="text-center border-x border-zinc-100">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Серия дней</span>
          <span className="text-xs font-black text-amber-500 mt-1 flex items-center justify-center">
            🔥 {streak}
          </span>
        </div>
        <div className="text-center">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Всего XP</span>
          <span className="text-xs font-black text-brand mt-1 block">
            {totalXP}
          </span>
        </div>
      </div>

      {/* Progress Bar details */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-zinc-500">Прогресс уровня</span>
          <span className="text-zinc-800">{xpInCurrentLevel} / 1000 XP</span>
        </div>
        <div className="w-full h-2.5 bg-zinc-50 border border-zinc-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpProgressPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full bg-brand rounded-full"
          />
        </div>
        <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
          <span>{level} Уровень</span>
          <span>{level + 1} Уровень</span>
        </div>
      </div>
    </motion.div>
  );
};
