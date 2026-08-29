'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLmsStore } from '../../store/useLmsStore';
import { PlayCircle, CheckCircle2, Circle, Clock, ArrowRight, BookOpen, Sparkles, FileText, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const SmartResumeCard: React.FC = () => {
  const { courses, modules, selectedLessonId, selectLesson } = useLmsStore();
  const router = useRouter();

  // Find active course, module, and lesson
  let activeCourse: any = null;
  let activeLesson: any = null;
  let activeModule: any = null;

  if (selectedLessonId) {
    modules.forEach((mod) => {
      const les = mod.lessons.find((l) => l.id === selectedLessonId);
      if (les) {
        activeLesson = les;
        activeModule = mod;
        activeCourse = courses.find((c) => c.id === mod.course_id);
      }
    });
  }

  // Fallback to first unlocked lesson if none selected
  if (!activeLesson) {
    modules.forEach((mod) => {
      const les = mod.lessons.find((l) => l.status === 'unlocked');
      if (les && !activeLesson) {
        activeLesson = les;
        activeModule = mod;
        activeCourse = courses.find((c) => c.id === mod.course_id);
      }
    });
  }

  // Fallback to first lesson if all completed
  if (!activeLesson && modules.length > 0 && modules[0].lessons.length > 0) {
    activeLesson = modules[0].lessons[0];
    activeModule = modules[0];
    activeCourse = courses.find((c) => c.id === modules[0].course_id);
  }

  if (!activeLesson || !activeCourse) {
    return (
      <div className="bento-card p-6 md:p-8 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Все курсы пройдены!</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Вы успешно завершили текущие учебные модули.</p>
        </div>
        <button
          onClick={() => router.push('/courses')}
          className="bg-brand text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-dark transition-all cursor-pointer"
        >
          Каталог курсов
        </button>
      </div>
    );
  }

  const handleResume = () => {
    selectLesson(activeLesson.id);
    router.push(`/courses/${activeCourse.id}/lessons/${activeLesson.id}`);
  };

  // Step breakdown calculations
  const videoWatched = !!activeLesson.components?.video_watched;
  const testPassed = !!activeLesson.components?.test?.passed;
  const testScore = activeLesson.components?.test?.score || 0;
  const assignmentStatus = activeLesson.components?.assignment?.status || 'not_submitted';

  let completedSteps = 0;
  if (videoWatched) completedSteps += 1;
  if (testPassed) completedSteps += 1;
  if (assignmentStatus === 'approved') completedSteps += 1;

  const totalSteps = 3;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-blue-500/20 bg-gradient-to-br from-blue-600 via-indigo-650 to-slate-900 text-white p-6 md:p-8 shadow-xl shadow-blue-500/10">
      {/* Subtle Background Pattern */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-6 opacity-10 text-white pointer-events-none">
        <PlayCircle className="w-56 h-56" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Top Header inside card */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <span className="inline-flex items-center space-x-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Текущий урок</span>
            </span>
            <span className="text-xs font-semibold text-white/80 bg-white/10 px-2.5 py-1 rounded-full">
              {activeCourse.title}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-white/70 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>~15 мин на завершение</span>
          </div>
        </div>

        {/* Lesson Title & Module */}
        <div>
          <p className="text-xs text-white/70 font-medium">{activeModule?.module_title}</p>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-outfit mt-1 text-white">
            {activeLesson.title}
          </h2>
        </div>

        {/* 3 Step Track Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Step 1: Video */}
          <div className={`p-3 rounded-2xl border transition-all ${
            videoWatched 
              ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-100' 
              : 'bg-white/10 border-white/15 text-white/90'
          }`}>
            <div className="flex items-center space-x-2">
              {videoWatched ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <PlayCircle className="w-4 h-4 text-amber-300 flex-shrink-0" />
              )}
              <span className="text-xs font-bold truncate">1. Теория & Видео</span>
            </div>
            <p className="text-[11px] text-white/60 mt-1 pl-6">
              {videoWatched ? 'Просмотрено' : 'Осталось посмотреть'}
            </p>
          </div>

          {/* Step 2: Test */}
          <div className={`p-3 rounded-2xl border transition-all ${
            testPassed 
              ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-100' 
              : 'bg-white/10 border-white/15 text-white/90'
          }`}>
            <div className="flex items-center space-x-2">
              {testPassed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <HelpCircle className="w-4 h-4 text-amber-300 flex-shrink-0" />
              )}
              <span className="text-xs font-bold truncate">2. Тест</span>
            </div>
            <p className="text-[11px] text-white/60 mt-1 pl-6">
              {testPassed ? `Сдан на ${testScore}%` : 'Нужно сдать'}
            </p>
          </div>

          {/* Step 3: Assignment */}
          <div className={`p-3 rounded-2xl border transition-all ${
            assignmentStatus === 'approved' 
              ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-100' 
              : assignmentStatus === 'pending'
              ? 'bg-amber-500/15 border-amber-400/30 text-amber-100'
              : 'bg-white/10 border-white/15 text-white/90'
          }`}>
            <div className="flex items-center space-x-2">
              {assignmentStatus === 'approved' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : assignmentStatus === 'pending' ? (
                <Clock className="w-4 h-4 text-amber-300 flex-shrink-0" />
              ) : (
                <FileText className="w-4 h-4 text-white/50 flex-shrink-0" />
              )}
              <span className="text-xs font-bold truncate">3. Практика & ДЗ</span>
            </div>
            <p className="text-[11px] text-white/60 mt-1 pl-6 truncate">
              {assignmentStatus === 'approved' 
                ? 'Принято куратором' 
                : assignmentStatus === 'pending' 
                ? 'На проверке' 
                : 'Сдать конспект'}
            </p>
          </div>
        </div>

        {/* Footer Bar: Progress bar + Resume Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-white/15">
          <div className="space-y-1.5 flex-1 max-w-sm">
            <div className="flex items-center justify-between text-xs font-bold text-white/80">
              <span>Готовность урока</span>
              <span>{completedSteps} из {totalSteps} шагов ({progressPercent}%)</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-400 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleResume}
            className="inline-flex items-center justify-center space-x-2 bg-white text-zinc-950 hover:bg-zinc-100 active:scale-[0.98] px-6 py-3 rounded-xl font-extrabold text-sm transition-all shadow-md cursor-pointer self-stretch sm:self-auto"
          >
            <span>{completedSteps === 0 ? 'Начать урок' : 'Продолжить с места остановки'}</span>
            <ArrowRight className="w-4 h-4 text-brand" />
          </button>
        </div>
      </div>
    </div>
  );
};
