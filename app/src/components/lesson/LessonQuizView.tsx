'use client';

import React, { useState } from 'react';
import { useLmsStore } from '../../store/useLmsStore';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LessonQuizViewProps {
  lesson: any;
  onQuizCompleted?: () => void;
}

export const LessonQuizView: React.FC<LessonQuizViewProps> = ({ lesson, onQuizCompleted }) => {
  const { submitTest, addToast } = useLmsStore();
  const questions = lesson.components?.test?.questions || [];
  const testInfo = lesson.components?.test || { required: true, passed: false, score: 0 };

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(testInfo.passed);
  const [currentScore, setCurrentScore] = useState<number>(testInfo.score || 0);

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q: any) => {
      if (selectedAnswers[q.id] === q.correctOptionIndex) {
        correctCount += 1;
      }
    });

    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 100;
    setCurrentScore(score);
    setSubmitted(true);
    submitTest(lesson.id, score);

    if (onQuizCompleted) onQuizCompleted();
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  const allAnswered = questions.every((q: any) => selectedAnswers[q.id] !== undefined);
  const isPassed = submitted && currentScore >= 70;

  return (
    <div className="space-y-6">
      {/* Quiz Header Banner */}
      <div className="p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-brand" />
            <h3 className="text-base font-extrabold font-outfit" style={{ color: 'var(--text-primary)' }}>
              Проверочный тренажер на понимание
            </h3>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Ответьте на вопросы по материалу урока. Для зачета необходимо от 70% верных ответов.
          </p>
        </div>

        {submitted && (
          <div className="flex items-center space-x-2">
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-black flex items-center space-x-1.5 ${
                isPassed
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}
            >
              {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              <span>Результат: {currentScore}%</span>
            </span>

            <button
              onClick={handleRetry}
              className="p-1.5 rounded-xl border hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors cursor-pointer"
              title="Пройти заново"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q: any, qIdx: number) => {
          const userAnswer = selectedAnswers[q.id];
          const isCorrect = submitted && userAnswer === q.correctOptionIndex;
          const isWrong = submitted && userAnswer !== undefined && userAnswer !== q.correctOptionIndex;

          return (
            <div
              key={q.id}
              className="p-5 rounded-2xl border space-y-3.5 transition-all"
              style={{
                background: 'var(--card-bg)',
                borderColor: submitted
                  ? isCorrect
                    ? 'rgba(16, 185, 129, 0.4)'
                    : 'rgba(244, 63, 94, 0.4)'
                  : 'var(--border)'
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-black uppercase text-brand">
                  Вопрос {qIdx + 1} из {questions.length}
                </span>

                {submitted && (
                  <span className="text-xs font-bold">
                    {isCorrect ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Верно (+1 балл)
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Неверно
                      </span>
                    )}
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
                {q.text}
              </h4>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {q.options.map((opt: string, oIdx: number) => {
                  const isSelected = userAnswer === oIdx;
                  const isOptionRight = oIdx === q.correctOptionIndex;

                  let btnStyle = 'border bg-zinc-50/70 dark:bg-zinc-900/50 hover:border-brand/40 text-zinc-800 dark:text-zinc-200';

                  if (submitted) {
                    if (isOptionRight) {
                      btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold';
                    } else if (isSelected && !isOptionRight) {
                      btnStyle = 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold';
                    } else {
                      btnStyle = 'opacity-40 border-zinc-200 dark:border-zinc-800 text-zinc-400';
                    }
                  } else if (isSelected) {
                    btnStyle = 'border-brand bg-brand/10 text-brand font-bold shadow-sm';
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={submitted}
                      onClick={() => handleSelectOption(q.id, oIdx)}
                      className={`text-left p-3 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                      style={{ borderColor: !submitted && !isSelected ? 'var(--border)' : undefined }}
                    >
                      <span>{opt}</span>
                      {submitted && isOptionRight && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 ml-2" />}
                      {submitted && isSelected && !isOptionRight && <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              {/* Educational Explanation Breakdown */}
              {submitted && (
                <div
                  className="p-3 rounded-xl text-xs space-y-1 mt-2 border"
                  style={{
                    background: isCorrect ? 'rgba(16, 185, 129, 0.06)' : 'rgba(245, 158, 11, 0.08)',
                    borderColor: isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'
                  }}
                >
                  <div className="flex items-center space-x-1.5 font-extrabold text-zinc-900 dark:text-white">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Разбор и логика ответа:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {q.explanation ||
                      `Правильный вариант: «${q.options[q.correctOptionIndex]}». Данное правило подробно разбирается в теоретическом блоке урока.`}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit / Retry Actions */}
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="w-full py-3.5 rounded-xl text-sm font-extrabold bg-brand text-white hover:bg-brand-dark transition-all disabled:opacity-40 cursor-pointer shadow-md flex items-center justify-center space-x-2"
        >
          <span>Завершить тест и проверить ответы</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-xs text-zinc-500 font-medium text-center sm:text-left">
            {isPassed
              ? 'Отличная работа! Тест зачтен, следующий этап разблокирован.'
              : 'Для успешного закрепления рекомендуется пересмотреть фрагмент лекции и попробовать снова.'}
          </p>
          <button
            onClick={handleRetry}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold border hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Пройти тест еще раз</span>
          </button>
        </div>
      )}
    </div>
  );
};
