import React from 'react';
import { Flame } from 'lucide-react';

interface PublicProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    name: string;
    avatar: string;
    xp_score: number;
    streak: number;
  } | null;
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  const xp = student.xp_score;
  const level = Math.floor(xp / 1000) + 1;
  const nextLevelXp = level * 1000;
  const prevLevelXp = (level - 1) * 1000;
  const progressPercent = Math.min(100, Math.max(0, ((xp - prevLevelXp) / 1000) * 100));

  // Generate a mock mini-heatmap for this user (12 weeks * 7 days)
  const mockHeatmapSeed = student.name.charCodeAt(0) + student.name.charCodeAt(1);
  const getIntensityClass = (index: number) => {
    const val = (mockHeatmapSeed + index * 17) % 7;
    if (val === 0) return 'bg-zinc-100';
    if (val <= 2) return 'bg-emerald-100';
    if (val <= 4) return 'bg-emerald-300';
    return 'bg-emerald-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-white border border-zinc-200 rounded-bento shadow-2xl p-6 md:p-8 relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Steam-like glowing card top banner */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-600 p-2 hover:bg-zinc-100 rounded-full transition-colors duration-150"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Profile Card Info */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mt-2 border-b border-zinc-100 pb-6">
          <div className="relative">
            <img 
              src={student.avatar} 
              alt={student.name} 
              className="w-24 h-24 rounded-2xl object-cover border-4 border-zinc-50 shadow-md"
            />
            <div className="absolute -bottom-2 -right-2 bg-brand text-white text-xs font-black px-2.5 py-1 rounded-full shadow border-2 border-white">
              LVL {level}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black text-zinc-950 tracking-tight font-outfit">{student.name}</h2>
            <p className="text-zinc-500 text-sm mt-1">Обучается на потоке: <span className="font-bold text-zinc-800">Весна 2026</span></p>
            
            {/* Stats row */}
            <div className="flex items-center justify-center md:justify-start gap-6 mt-4">
              <div className="bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-100 text-center">
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Всего XP</span>
                <span className="text-base font-extrabold text-brand font-outfit">{student.xp_score.toLocaleString()} XP</span>
              </div>
              
              <div className="bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-100 text-center">
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Активность</span>
                <span className="text-base font-extrabold text-rose-600 font-outfit flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 fill-current text-rose-500" />
                  {student.streak} дней
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable details */}
        <div className="flex-1 overflow-y-auto space-y-6 pt-6 pr-1">
          {/* Level progress bar */}
          <div>
            <div className="flex justify-between text-xs font-bold text-zinc-500 mb-2">
              <span>ПРОГРЕСС ДО LVL {level + 1}</span>
              <span>{xp} / {nextLevelXp} XP</span>
            </div>
            <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden p-0.5 border border-zinc-200/50">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Activity Heatmap Grid */}
          <div>
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider mb-3 font-outfit">Матрица активности</h3>
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/60 overflow-x-auto">
              <div className="flex space-x-1.5 min-w-[360px] justify-between">
                {Array.from({ length: 18 }).map((_, colIndex) => (
                  <div key={colIndex} className="flex flex-col space-y-1.5">
                    {Array.from({ length: 7 }).map((_, rowIndex) => (
                      <div 
                         key={rowIndex} 
                         className={`w-3.5 h-3.5 rounded-sm transition-colors duration-150 ${getIntensityClass(colIndex * 7 + rowIndex)}`} 
                         title={`Активность в ячейке ${colIndex * 7 + rowIndex}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-black transition-all shadow-md active:scale-95 uppercase tracking-wide"
          >
            Закрыть профиль
          </button>
        </div>
      </div>
    </div>
  );
};
