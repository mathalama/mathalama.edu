'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { useLmsStore } from '@/store/useLmsStore';
import { motion } from 'framer-motion';
import { Trophy, Lock, Star, BookOpen, Flame, Users, Zap, Award } from 'lucide-react';

const CATEGORIES = [
  { key: 'all', label: 'Все' },
  { key: 'learning', label: 'Обучение' },
  { key: 'streak', label: 'Серия' },
  { key: 'social', label: 'Социальное' },
  { key: 'speed', label: 'Скорость' },
  { key: 'mastery', label: 'Мастерство' },
] as const;

const RARITY_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  common: { bg: 'bg-zinc-50', border: 'border-zinc-200', text: 'text-zinc-600', label: 'Обычное' },
  rare: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', label: 'Редкое' },
  epic: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', label: 'Эпическое' },
  legendary: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: 'Легендарное' },
};

export default function AchievementsPage() {
  const { achievements } = useLmsStore();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = activeCategory === 'all'
    ? achievements
    : achievements.filter((a) => a.category === activeCategory);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalXpFromAchievements = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.xpReward, 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight font-outfit" style={{ color: 'var(--text-primary)' }}>
              Достижения
            </h1>
            <p className="text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
              Коллекция ваших бейджей и наград за обучение
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4">
            <div className="bento-card p-3 text-center min-w-[100px]" style={{ padding: '12px 16px' }}>
              <div className="text-2xl font-black font-outfit" style={{ color: 'var(--text-primary)' }}>{unlockedCount}/{achievements.length}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Разблокировано</div>
            </div>
            <div className="bento-card p-3 text-center min-w-[100px]" style={{ padding: '12px 16px' }}>
              <div className="text-2xl font-black font-outfit text-brand">{totalXpFromAchievements}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>XP заработано</div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat.key
                  ? 'bg-brand text-white shadow-sm'
                  : 'border hover:opacity-80'
              }`}
              style={activeCategory !== cat.key ? { borderColor: 'var(--border)', color: 'var(--text-secondary)' } : undefined}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          key={activeCategory}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filtered.map((ach) => {
            const rarity = RARITY_COLORS[ach.rarity] || RARITY_COLORS.common;

            const getCategoryIcon = (cat: string) => {
              switch (cat) {
                case 'learning': return <BookOpen className="w-6 h-6 text-blue-600" />;
                case 'streak': return <Flame className="w-6 h-6 text-rose-500" />;
                case 'social': return <Users className="w-6 h-6 text-indigo-600" />;
                case 'speed': return <Zap className="w-6 h-6 text-amber-500" />;
                case 'mastery': return <Award className="w-6 h-6 text-purple-600" />;
                default: return <Trophy className="w-6 h-6 text-zinc-600" />;
              }
            };

            return (
              <motion.div
                key={ach.id}
                variants={itemVariants}
                className={`bento-card p-5 space-y-3 relative overflow-hidden ${
                  !ach.unlocked ? 'opacity-60' : ''
                }`}
              >
                {/* Rarity badge */}
                <span className={`absolute top-3 right-3 text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${rarity.bg} ${rarity.border} ${rarity.text} border`}>
                  {rarity.label}
                </span>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border ${
                  ach.unlocked
                    ? `${rarity.bg} ${rarity.border}`
                    : 'bg-zinc-100 border-zinc-200 grayscale'
                }`}>
                  {ach.unlocked ? getCategoryIcon(ach.category) : <Lock className="w-6 h-6 text-zinc-400" />}
                </div>

                {/* Info */}
                <div>
                  <h4 className="text-sm font-bold font-outfit" style={{ color: 'var(--text-primary)' }}>
                    {ach.title}
                  </h4>
                  <p className="text-[11px] leading-relaxed mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {ach.description}
                  </p>
                </div>

                {/* XP Reward */}
                <div className="flex items-center space-x-1.5 text-[10px] font-bold">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                  <span style={{ color: 'var(--text-secondary)' }}>+{ach.xpReward} XP</span>
                </div>

                {/* Progress bar for locked achievements */}
                {!ach.unlocked && ach.progress !== undefined && (
                  <div className="space-y-1.5">
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div
                        className="h-full bg-brand rounded-full transition-all duration-500"
                        style={{ width: `${ach.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>
                      <span>{ach.progressLabel}</span>
                      <span>{ach.progress}%</span>
                    </div>
                  </div>
                )}

                {/* Unlocked date */}
                {ach.unlocked && ach.unlockedAt && (
                  <div className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                    Разблокировано: {new Date(ach.unlockedAt).toLocaleDateString('ru-RU')}
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
