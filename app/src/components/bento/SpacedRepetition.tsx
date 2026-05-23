import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLmsStore } from '../../store/useLmsStore';
import { SPACED_REPETITION_POOL } from '../../mocks/db';
import { CheckCircle2, AlertCircle, HelpCircle, Trophy, RefreshCw } from 'lucide-react';

export const SpacedRepetition: React.FC = () => {
  const { 
    spacedRepetitionStates, 
    activeSessionQueue, 
    submitReviewAnswer, 
    addToast 
  } = useLmsStore();

  const [queue, setQueue] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<{
    isCorrect: boolean;
    explanation: string;
    nextReviewInDays: number;
    xpEarned: number;
  } | null>(null);

  const [isFinished, setIsFinished] = useState(false);
  const [totalXpEarned, setTotalXpEarned] = useState(0);

  // Get today's local date string YYYY-MM-DD
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Re-build active queue of cards scheduled for today
  useEffect(() => {
    const today = getTodayString();
    
    // Find all question IDs that need review today (next_review_date <= today)
    const todayReviewIds = spacedRepetitionStates
      .filter(state => state.next_review_date <= today)
      .map(state => state.question_id);

    // Combine with current active session retry cards
    const combinedIds = Array.from(new Set([...todayReviewIds, ...activeSessionQueue]));
    
    // Fallback: If everything is cleared but activeSessionQueue is running, use it
    if (combinedIds.length > 0) {
      setQueue(combinedIds);
      setCurrentIdx(0);
      setIsFinished(false);
    } else {
      setQueue([]);
    }
  }, [spacedRepetitionStates, activeSessionQueue]);

  if (queue.length === 0 || isFinished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="h-full bg-white border border-zinc-100 rounded-bento p-6 shadow-bento flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-sm">
          <Trophy className="w-8 h-8" />
        </div>
        
        <div className="space-y-1.5 max-w-xs">
          <h4 className="text-lg font-bold text-zinc-900 font-outfit">
            Разминка завершена!
          </h4>
          <p className="text-xs text-zinc-400 font-medium leading-relaxed">
            {totalXpEarned > 0 
              ? `Отличная работа! Все карточки повторены. Вы заработали +${totalXpEarned} XP!` 
              : "Все карточки на сегодня успешно повторены! Возвращайтесь завтра для закрепления новых тем."
            }
          </p>
        </div>

        <div className="bg-zinc-50 border border-zinc-100 px-4 py-2.5 rounded-2xl text-[10px] text-zinc-500 font-bold tracking-wide uppercase">
          Алгоритм: SuperMemo-2 (SM2)
        </div>
      </motion.div>
    );
  }

  // Get active question card details
  const activeQuestionId = queue[currentIdx];
  const activeCard = SPACED_REPETITION_POOL.find(q => q.id === activeQuestionId);

  if (!activeCard) {
    return null;
  }

  const handleOptionClick = (optIdx: number) => {
    if (answerResult !== null) return; // Allow answering only once per step
    setSelectedOpt(optIdx);

    const res = submitReviewAnswer(activeQuestionId, optIdx);
    setAnswerResult(res);

    if (res.isCorrect) {
      setTotalXpEarned(prev => prev + res.xpEarned);
    }
  };

  const handleNext = () => {
    // If incorrect, this card was added back into activeSessionQueue in Zustand store.
    // We should move to the next item or cycle back.
    setSelectedOpt(null);
    setAnswerResult(null);

    if (currentIdx + 1 < queue.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Checked all in current queue, check if queue has shrunk
      setIsFinished(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white border border-zinc-100 rounded-bento p-5 shadow-bento flex flex-col justify-between h-full min-h-[360px]"
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-brand" />
          <h4 className="text-sm font-bold text-zinc-900 font-outfit">
            Ежедневная разминка (SM2)
          </h4>
        </div>
        <span className="text-[10px] bg-brand-light text-brand px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
          Карточка {currentIdx + 1} из {queue.length}
        </span>
      </div>

      {/* Main Flashcard Container */}
      <div className="flex-1 flex flex-col justify-center space-y-4">
        <h3 className="text-sm font-bold text-zinc-800 font-outfit leading-relaxed bg-zinc-50 border border-zinc-100/50 p-4 rounded-2xl">
          {activeCard.question}
        </h3>

        {/* Options Stack */}
        <div className="grid grid-cols-1 gap-2">
          {activeCard.options.map((option, idx) => {
            const isSelected = selectedOpt === idx;
            const isCorrectOption = idx === activeCard.correctOptionIndex;
            
            let btnStyle = "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:scale-[1.005]";
            let indicator = null;

            if (answerResult !== null) {
              if (isCorrectOption) {
                // Highlight correct answer in green
                btnStyle = "bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold";
                indicator = <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
              } else if (isSelected && !answerResult.isCorrect) {
                // Highlight incorrect selection in red
                btnStyle = "bg-red-50 border-red-200 text-red-800";
                indicator = <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />;
              } else {
                // Dim other options
                btnStyle = "bg-white border-zinc-100 text-zinc-400 opacity-60";
              }
            }

            return (
              <button
                key={idx}
                disabled={answerResult !== null}
                onClick={() => handleOptionClick(idx)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-semibold font-outfit flex items-center justify-between transition-all duration-200 cursor-pointer ${btnStyle}`}
              >
                <span>{option}</span>
                {indicator}
              </button>
            );
          })}
        </div>

        {/* Sliding Explanation Panel */}
        <AnimatePresence>
          {answerResult !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className={`p-4 rounded-2xl border text-[11px] leading-relaxed font-medium space-y-1.5 ${
                answerResult.isCorrect 
                  ? 'bg-emerald-50/30 border-emerald-100/60 text-emerald-800' 
                  : 'bg-red-50/30 border-red-100/60 text-red-800'
              }`}>
                <div className="font-bold flex items-center space-x-1.5">
                  {answerResult.isCorrect ? (
                    <>
                      <span>Отлично! +{answerResult.xpEarned} XP</span>
                      <span className="text-[9px] bg-emerald-100 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-emerald-700">
                        Интервал: {answerResult.nextReviewInDays} дн.
                      </span>
                    </>
                  ) : (
                    <>
                      <span>Ошибка закреплена в сессии</span>
                      <span className="text-[9px] bg-red-100 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-red-700">
                        Повтор сегодня
                      </span>
                    </>
                  )}
                </div>
                <p className="text-zinc-600 leading-relaxed">
                  {answerResult.explanation}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Footer */}
      {answerResult !== null && (
        <button
          onClick={handleNext}
          className={`mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-bold font-outfit transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm ${
            answerResult.isCorrect 
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10' 
              : 'bg-zinc-800 hover:bg-zinc-900 text-white shadow-zinc-800/10'
          }`}
        >
          {answerResult.isCorrect ? (
            <span>Следующий вопрос</span>
          ) : (
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
              <span>Повторить ошибку в конце очереди</span>
            </span>
          )}
        </button>
      )}
    </motion.div>
  );
};
