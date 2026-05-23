import React from 'react';
import { motion } from 'framer-motion';
import { useLmsStore } from '../../store/useLmsStore';
import { Flame } from 'lucide-react';

export const ActivityHeatmap: React.FC = () => {
  const { heatmap, streak, leaderboard } = useLmsStore();
  
  const currentUser = leaderboard.find((u) => u.isCurrentUser);
  const totalXP = currentUser?.xp_score || 1200;

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-zinc-100/80 hover:scale-110';
    if (count <= 2) return 'bg-emerald-100 hover:scale-110 hover:bg-emerald-200';
    if (count <= 4) return 'bg-emerald-300 hover:scale-110 hover:bg-emerald-400';
    return 'bg-emerald-500 hover:scale-110 hover:bg-emerald-600';
  };

  // Group days into weeks (each week has 7 days)
  const weeks: typeof heatmap[] = [];
  const daysPerWeek = 7;
  for (let i = 0; i < heatmap.length; i += daysPerWeek) {
    weeks.push(heatmap.slice(i, i + daysPerWeek));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-col h-full justify-between space-y-6"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 font-outfit">Календарь активности</h3>
          <p className="text-xs text-zinc-400 font-medium mt-0.5">Ежедневный вклад в обучение за последние 6 месяцев</p>
        </div>
        <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-extrabold animate-pulse">
          <Flame className="w-4 h-4 fill-current" />
          <span>{streak} ДНЕЙ ПОДРЯД!</span>
        </div>
      </div>

      {/* Grid container with custom scrollbars */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex space-x-1.5 min-w-[380px] py-1 justify-center md:justify-start">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col space-y-1.5">
              {week.map((day, dIdx) => (
                <div
                  key={day.date}
                  className={`w-3.5 h-3.5 rounded-sm transition-all duration-200 cursor-pointer relative group ${getIntensityClass(
                    day.activity_count
                  )}`}
                >
                  {/* Premium HTML Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-zinc-900 text-white text-[10px] py-1 px-2 rounded shadow-md whitespace-nowrap z-50">
                    {day.date}: {day.activity_count} действий (+{day.xp_earned} XP)
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend & Analytics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-zinc-400 pt-3 border-t border-zinc-100 gap-2">
        <div className="flex items-center space-x-1.5 font-medium">
          <span>Меньше</span>
          <div className="w-3 h-3 bg-zinc-100 rounded-sm"></div>
          <div className="w-3 h-3 bg-emerald-100 rounded-sm"></div>
          <div className="w-3 h-3 bg-emerald-300 rounded-sm"></div>
          <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
          <span>Больше</span>
        </div>
        <div className="font-semibold">
          Всего опыта начислено: <span className="text-emerald-600 font-bold">{totalXP} XP</span>
        </div>
      </div>
    </motion.div>
  );
};
