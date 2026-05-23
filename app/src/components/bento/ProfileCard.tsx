import React from 'react';
import { motion } from 'framer-motion';
import { useLmsStore } from '../../store/useLmsStore';
import { Award, Zap, Shield, Flame } from 'lucide-react';

export const ProfileCard: React.FC = () => {
  const { leaderboard, streak, studentName } = useLmsStore();
  const currentUser = leaderboard.find((u) => u.isCurrentUser);
  const totalXP = currentUser?.xp_score || 1200;

  // Level is calculated as Math.floor(XP / 1000) + 1
  const level = Math.floor(totalXP / 1000) + 1;
  const xpInCurrentLevel = totalXP % 1000;
  const xpProgressPercent = (xpInCurrentLevel / 1000) * 100;

  // Pre-calculated badges/achievements based on current progress
  const achievements = [
    {
      id: 'ach-1',
      title: 'Гофер-Новичок',
      desc: 'Вход в систему',
      icon: <Shield className="w-5 h-5 text-indigo-500" />,
      color: 'bg-indigo-50 border-indigo-100',
      unlocked: true
    },
    {
      id: 'ach-2',
      title: 'Марафонец',
      desc: 'Серия 14+ дней',
      icon: <Flame className="w-5 h-5 text-amber-500" />,
      color: 'bg-amber-50 border-amber-100',
      unlocked: streak >= 14
    },
    {
      id: 'ach-3',
      title: 'Гроза Тестов',
      desc: 'Тест на 100%',
      icon: <Zap className="w-5 h-5 text-emerald-500" />,
      color: 'bg-emerald-50 border-emerald-100',
      unlocked: totalXP >= 1350
    },
    {
      id: 'ach-4',
      title: 'Конспект-Мастер',
      desc: 'Сдача ДЗ одобрена',
      icon: <Award className="w-5 h-5 text-purple-500" />,
      color: 'bg-purple-50 border-purple-100',
      unlocked: totalXP >= 1500
    }
  ];

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

      {/* Achievements Bento Row */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-zinc-400 tracking-wider uppercase font-outfit">Достижения (Ачивки)</h4>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`flex items-center space-x-2.5 p-2 rounded-xl border transition-all duration-200 ${
                ach.unlocked
                  ? `${ach.color} opacity-100 shadow-sm`
                  : 'bg-zinc-50/50 border-zinc-100 opacity-40 grayscale'
              }`}
            >
              <div className="flex-shrink-0">{ach.icon}</div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-800 truncate">{ach.title}</p>
                <p className="text-[10px] text-zinc-400 font-medium truncate">{ach.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
