'use client';

import React, { useState } from 'react';
import { useLmsStore } from '../../store/useLmsStore';
import { SPACED_REPETITION_POOL } from '../../mocks/db';
import { Brain, CheckCircle2, XCircle, Sparkles, RefreshCw, Bookmark, ArrowRight, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const StudyReviewCard: React.FC = () => {
  const { spacedRepetitionStates, submitReviewAnswer, videoNotes } = useLmsStore();
  const [activeTab, setActiveTab] = useState<'flashcards' | 'notes'>('flashcards');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [resultInfo, setResultInfo] = useState<{ isCorrect: boolean; explanation: string } | null>(null);

  const card = SPACED_REPETITION_POOL[currentCardIndex % SPACED_REPETITION_POOL.length];

  const handleSelectOption = (idx: number) => {
    if (showResult) return;
    setSelectedOption(idx);
    const res = submitReviewAnswer(card.id, idx);
    setResultInfo({ isCorrect: res.isCorrect, explanation: res.explanation });
    setShowResult(true);
  };

  const handleNextCard = () => {
    setSelectedOption(null);
    setShowResult(false);
    setResultInfo(null);
    setCurrentCardIndex((prev) => prev + 1);
  };

  return (
    <div className="space-y-4 flex flex-col justify-between h-full">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold font-outfit" style={{ color: 'var(--text-primary)' }}>
              Закрепление знаний
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Интервальное повторение и конспекты
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl p-0.5 border" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'flashcards'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Вопрос дня
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Мои заметки ({videoNotes.length})
          </button>
        </div>
      </div>

      {activeTab === 'flashcards' ? (
        <div className="space-y-3.5 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold" style={{ color: 'var(--text-secondary)' }}>
              <span className="flex items-center space-x-1 text-purple-600 dark:text-purple-400">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Быстрый самоконтроль</span>
              </span>
              <span>Карточка {(currentCardIndex % SPACED_REPETITION_POOL.length) + 1} из {SPACED_REPETITION_POOL.length}</span>
            </div>

            <p className="text-xs sm:text-sm font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
              {card.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {card.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = card.correctOptionIndex === idx;

              let optionStyle = 'border hover:border-brand/40 bg-zinc-50/60 dark:bg-zinc-900/40 text-zinc-800 dark:text-zinc-200';
              
              if (showResult) {
                if (isCorrect) {
                  optionStyle = 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold';
                } else if (isSelected) {
                  optionStyle = 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-bold';
                } else {
                  optionStyle = 'opacity-40 border-zinc-200 dark:border-zinc-800 text-zinc-400';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={showResult}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                  style={{ borderColor: !showResult ? 'var(--border)' : undefined }}
                >
                  <span>{option}</span>
                  {showResult && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 ml-2" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          {/* Result explanation & Next Card button */}
          <AnimatePresence>
            {showResult && resultInfo && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2.5 pt-2 border-t"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed ${
                  resultInfo.isCorrect 
                    ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-800 dark:text-amber-200 border border-amber-500/20'
                }`}>
                  <span className="font-extrabold flex items-center space-x-1 mb-0.5">
                    {resultInfo.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Верно!</span>
                      </>
                    ) : (
                      <>
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span>Разбор ответа:</span>
                      </>
                    )}
                  </span>
                  {resultInfo.explanation}
                </div>

                <button
                  onClick={handleNextCard}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-dark transition-all cursor-pointer"
                >
                  <span>Следующий вопрос</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Notes Tab */
        <div className="space-y-2 flex-1 overflow-y-auto max-h-[220px] pr-1">
          {videoNotes.length === 0 ? (
            <div className="text-center py-6">
              <Bookmark className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
              <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Заметок пока нет</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Сохраняйте важные мысли прямо во время просмотра лекций</p>
            </div>
          ) : (
            videoNotes.map((note) => (
              <div
                key={note.id}
                className="p-3 rounded-xl border space-y-1"
                style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-brand">
                  <span>Таймкод: {Math.floor(note.video_timestamp_seconds / 60)}:{(note.video_timestamp_seconds % 60).toString().padStart(2, '0')}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{new Date(note.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
                <p className="text-xs leading-relaxed font-medium" style={{ color: 'var(--text-primary)' }}>
                  {note.note_text}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
