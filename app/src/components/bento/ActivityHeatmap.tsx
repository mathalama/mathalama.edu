'use client';

import React from 'react';
import { useLmsStore } from '../../store/useLmsStore';
import { Calendar, Flame, Clock, BookCheck, Sparkles } from 'lucide-react';

export const ActivityHeatmap: React.FC = () => {
  const { heatmap, streak, modules } = useLmsStore();

  const getIntensityStyle = (count: number) => {
    if (count === 0) return { backgroundColor: 'var(--heatmap-empty)' };
    if (count <= 2) return { backgroundColor: 'var(--heatmap-low)' };
    if (count <= 4) return { backgroundColor: 'var(--heatmap-medium)' };
    return { backgroundColor: 'var(--heatmap-high)' };
  };

  // Calculate total completed lessons
  let completedLessonsCount = 0;
  let totalLessonsCount = 0;
  modules.forEach((m) => {
    totalLessonsCount += m.lessons.length;
    completedLessonsCount += m.lessons.filter((l) => l.status === 'completed').length;
  });

  // Group days into weeks (each week has 7 days)
  const weeks: typeof heatmap[] = [];
  const daysPerWeek = 7;
  for (let i = 0; i < heatmap.length; i += daysPerWeek) {
    weeks.push(heatmap.slice(i, i + daysPerWeek));
  }

  const activeDaysCount = heatmap.filter((day) => day.activity_count > 0).length;
  const activePercent = Math.round((activeDaysCount / heatmap.length) * 100);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayActivity = heatmap.find((day) => day.date === todayStr);
  const todayDone = todayActivity ? todayActivity.activity_count > 0 : false;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold font-outfit" style={{ color: 'var(--text-primary)' }}>
              Ритм обучения и регулярность
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              История занятий и поддержание учебной привычки
            </p>
          </div>
        </div>

        {/* Quick pill stats */}
        <div className="flex items-center space-x-3 text-xs font-bold">
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>Серия: {streak} дней</span>
          </span>
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <BookCheck className="w-3.5 h-3.5" />
            <span>{completedLessonsCount} из {totalLessonsCount} уроков</span>
          </span>
        </div>
      </div>

      {/* Heatmap Grid & Legend */}
      <div className="space-y-3">
        <div className="overflow-x-auto pb-2 scrollbar-thin">
          <div className="flex space-x-2 min-w-[500px] py-1 justify-start">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col space-y-2">
                {week.map((day) => (
                  <div
                    key={day.date}
                    style={getIntensityStyle(day.activity_count)}
                    className="w-3.5 h-3.5 rounded-md transition-all duration-200 cursor-pointer relative group flex-shrink-0"
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-zinc-950 text-white text-[10px] py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap z-50 border border-zinc-800">
                      <span className="font-bold">{day.date}</span>: {day.activity_count} {day.activity_count === 1 ? 'урок/задание' : 'действий'}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Footer info: Legend & Today's goal status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-2 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          <div className="flex items-center space-x-2 font-medium">
            <span>Меньше</span>
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--heatmap-empty)' }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--heatmap-low)' }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--heatmap-medium)' }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--heatmap-high)' }} />
            <span>Больше активности</span>
          </div>

          <div className="font-semibold text-[11px]">
            {todayDone ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Сегодня вы уже позанимались, отличная работа!</span>
              </span>
            ) : (
              <span className="text-zinc-500">Занимайтесь по 15–20 минут в день для закрепления материала.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
