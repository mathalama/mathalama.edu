import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLmsStore } from '../../store/useLmsStore';
import { Trophy, Users, Star } from 'lucide-react';
import { PublicProfileModal } from './PublicProfileModal';

export const Leaderboard: React.FC = () => {
  const { leaderboard, friends } = useLmsStore();
  const [activeTab, setActiveTab] = useState<'cohort' | 'global'>('cohort');
  const [selectedStudent, setSelectedStudent] = useState<{
    name: string;
    avatar: string;
    xp_score: number;
    streak: number;
  } | null>(null);

  // For V1, cohort has our default students, and global adds a couple of mock top users
  const globalLeaderboard = [
    { student_id: "glob-1", student_name: "Асем Муратова (Алматы)", xp_score: 5200, rank: 1 },
    { student_id: "glob-2", student_name: "Кирилл Белов (Астана)", xp_score: 4100, rank: 2 },
    ...leaderboard.map(st => ({
      ...st,
      rank: st.rank + 2 // shift ranks down
    }))
  ].sort((a, b) => b.xp_score - a.xp_score);

  // Recalculate global ranks
  globalLeaderboard.forEach((st, idx) => {
    st.rank = idx + 1;
  });

  const activeEntries = activeTab === 'cohort' ? leaderboard : globalLeaderboard;

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="text-lg" title="1-е место">🥇</span>;
    if (rank === 2) return <span className="text-lg" title="2-е место">🥈</span>;
    if (rank === 3) return <span className="text-lg" title="3-е место">🥉</span>;
    return <span className="text-xs font-extrabold text-zinc-400 w-5 text-center">{rank}</span>;
  };

  const handleStudentClick = (student: any) => {
    if (student.student_id === 'current-student') {
      setSelectedStudent({
        name: "Иван Смирнов (Вы)",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        xp_score: student.xp_score,
        streak: 14
      });
      return;
    }

    const matchedFriend = friends.find(f => f.name === student.student_name);
    if (matchedFriend) {
      setSelectedStudent(matchedFriend);
    } else {
      const mockAvatars = [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      ];
      setSelectedStudent({
        name: student.student_name,
        avatar: mockAvatars[student.rank % mockAvatars.length],
        xp_score: student.xp_score,
        streak: 5 + (student.rank * 2)
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="flex flex-col h-full justify-between space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 font-outfit">Рейтинг студентов</h3>
          <p className="text-xs text-zinc-400 font-medium mt-0.5">Кликните на соперника для просмотра его профиля</p>
        </div>
        
        {/* Animated Tabs */}
        <div className="flex bg-zinc-50 border border-zinc-100 p-1 rounded-xl self-start sm:self-center">
          <button
            onClick={() => setActiveTab('cohort')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
              activeTab === 'cohort' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            {activeTab === 'cohort' && (
              <motion.div
                layoutId="activeTabBg"
                className="absolute inset-0 bg-white border border-zinc-200/50 shadow-sm rounded-lg"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">Мой поток</span>
          </button>
          <button
            onClick={() => setActiveTab('global')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
              activeTab === 'global' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            {activeTab === 'global' && (
              <motion.div
                layoutId="activeTabBg"
                className="absolute inset-0 bg-white border border-zinc-200/50 shadow-sm rounded-lg"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">Глобальный</span>
          </button>
        </div>
      </div>

      {/* Rankings List */}
      <div className="flex-1 overflow-y-auto max-h-[220px] pr-1 space-y-2 mt-2">
        <AnimatePresence mode="popLayout">
          {activeEntries.map((student, index) => (
            <motion.div
              layout
              key={student.student_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={() => handleStudentClick(student)}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer hover:scale-[1.01] active:scale-95 transition-all duration-250 ${
                student.isCurrentUser
                  ? 'bg-brand-light border-brand/20 shadow-sm'
                  : 'bg-white border-zinc-100 hover:bg-zinc-50/50 hover:border-zinc-200 shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-zinc-50 border border-zinc-100 rounded-lg">
                  {getRankBadge(student.rank)}
                </div>
                <div className="min-w-0">
                  <span className={`text-xs font-bold text-zinc-800 truncate block ${
                    student.isCurrentUser ? 'text-brand font-extrabold' : ''
                  }`}>
                    {student.student_name}
                  </span>
                  {student.isCurrentUser && (
                    <span className="text-[9px] bg-brand text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider block w-max mt-0.5">
                      Это ты
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1 flex-shrink-0">
                <Star className={`w-3.5 h-3.5 fill-current ${
                  student.rank <= 3 ? 'text-amber-500' : 'text-zinc-300'
                }`} />
                <span className="text-xs font-extrabold text-zinc-700 tabular-nums">
                  {student.xp_score.toLocaleString()} XP
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium pt-2 border-t border-zinc-50">
        <span className="flex items-center space-x-1">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>Лидерборд обновляется в реальном времени</span>
        </span>
        <span className="flex items-center space-x-1">
          <Users className="w-3.5 h-3.5 text-zinc-400" />
          <span>Всего: {activeTab === 'cohort' ? '482' : '15,200'} участников</span>
        </span>
      </div>

      {/* Steam-Style Public Profile Overlay */}
      {selectedStudent && (
        <PublicProfileModal 
          isOpen={!!selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
          student={selectedStudent}
        />
      )}
    </motion.div>
  );
};
