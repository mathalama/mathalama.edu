import React, { useState, useEffect } from 'react';
import { useLmsStore } from '../../store/useLmsStore';
import { SPACED_REPETITION_POOL } from '../../mocks/db';
import { Swords, Trophy, Crown, Users } from 'lucide-react';

export const BattleArena: React.FC = () => {
  const { activeBattle, createBattleLobby, submitBattleAnswer, leaveBattle } = useLmsStore();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnsweredThisRound, setHasAnsweredThisRound] = useState(false);
  const [answerResult, setAnswerResult] = useState<{ isCorrect: boolean; points: number; speedBonus: number } | null>(null);
  const [lobbyAnimationCount, setLobbyAnimationCount] = useState(1);

  // Tick the battle countdown timer in active play
  useEffect(() => {
    if (!activeBattle || activeBattle.status !== 'battle') return;

    const interval = setInterval(() => {
      if (activeBattle.timer > 0) {
        // We decrement the timer locally by updating our Zustand store state directly
        useLmsStore.setState((state) => {
          if (!state.activeBattle) return {};
          return {
            activeBattle: {
              ...state.activeBattle,
              timer: state.activeBattle.timer - 1
            }
          };
        });
      } else {
        // If timer runs out, auto-submit wrong answer
        handleTimeOut();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeBattle]);

  // Simulate dynamic player joining animations in Lobby
  useEffect(() => {
    if (!activeBattle || activeBattle.status !== 'lobby') return;
    const interval = setInterval(() => {
      setLobbyAnimationCount(prev => Math.min(activeBattle.participants.length, prev + 1));
    }, 600);
    return () => clearInterval(interval);
  }, [activeBattle]);

  if (!activeBattle) {
    /* LANDING SCREEN */
    return (
      <div className="bg-white border border-zinc-200 rounded-bento p-6 md:p-8 shadow-bento hover:shadow-bento-hover transition-all duration-300 flex flex-col justify-between items-center text-center min-h-[420px] relative overflow-hidden">
        {/* Decorative Grid Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
        
        <div className="relative z-10 my-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-md mb-6 text-indigo-600 animate-bounce">
            <Swords className="w-8 h-8" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-zinc-950 tracking-tight font-outfit">
            Тест-Арена Соревнований
          </h2>
          <p className="text-sm text-zinc-500 max-w-lg mt-3 leading-relaxed font-medium">
            Сразитесь с одногруппниками в реальном времени! Решайте тесты по программированию на Go и высшей математике быстрее всех, заслужите призовые XP и взлетите на пьедестал почета!
          </p>
        </div>

        <button 
          onClick={createBattleLobby}
          className="relative z-10 w-full max-w-sm py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg shadow-indigo-600/10 uppercase tracking-wider"
        >
          Создать Лобби Соревнований (1v20)
        </button>
      </div>
    );
  }

  const currentQuestion = SPACED_REPETITION_POOL[activeBattle.currentQuestionIndex];

  const handleOptionClick = (idx: number) => {
    if (hasAnsweredThisRound) return;
    setSelectedOption(idx);
    setHasAnsweredThisRound(true);

    const res = submitBattleAnswer(idx);
    setAnswerResult({
      isCorrect: res.isCorrect,
      points: res.pointsEarned,
      speedBonus: res.speedBonus
    });
  };

  const handleTimeOut = () => {
    if (hasAnsweredThisRound) return;
    setHasAnsweredThisRound(true);
    setSelectedOption(null);
    setAnswerResult({ isCorrect: false, points: 0, speedBonus: 0 });
    submitBattleAnswer(-1); // Submits incorrect answer
  };

  const handleNextRound = () => {
    setSelectedOption(null);
    setHasAnsweredThisRound(false);
    setAnswerResult(null);
  };

  const startMatch = () => {
    useLmsStore.setState((state) => {
      if (!state.activeBattle) return {};
      return {
        activeBattle: {
          ...state.activeBattle,
          status: 'battle'
        }
      };
    });
  };

  /* LOBBY PHASE */
  if (activeBattle.status === 'lobby') {
    return (
      <div className="bg-white border border-zinc-200 rounded-bento p-6 md:p-8 shadow-bento hover:shadow-bento-hover transition-all duration-300 min-h-[420px] flex flex-col justify-between relative overflow-hidden">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-4 mb-6 gap-4">
            <div>
              <h2 className="text-xl font-black text-zinc-950 tracking-tight font-outfit flex items-center gap-2">
                Зал Ожидания Соперников
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">Участники присоединяются по пригласительному токену</p>
            </div>
            
            <div className="flex items-center gap-2.5 bg-zinc-50 border border-zinc-200/80 px-4 py-2 rounded-2xl shadow-sm">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wide">Код комнаты:</span>
              <span className="text-sm font-black text-indigo-600 font-outfit select-all">{activeBattle.lobbyCode}</span>
            </div>
          </div>

          {/* Grid of connected players */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-6">
            {activeBattle.participants.slice(0, lobbyAnimationCount).map((p, idx) => (
              <div 
                key={p.friendId} 
                className="flex flex-col items-center p-3 rounded-2xl bg-zinc-50 border border-zinc-200/60 shadow-sm animate-scale-in text-center"
              >
                <div className="relative">
                  <img 
                    src={p.avatar} 
                    alt={p.name} 
                    className="w-12 h-12 rounded-xl object-cover border border-zinc-200 shadow-sm"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                </div>
                <h4 className="text-[10px] font-black text-zinc-800 mt-2 truncate w-full">{p.name}</h4>
                <span className="text-[8px] font-bold text-zinc-400">ГОТОВ</span>
              </div>
            ))}
            
            {/* Dummy connecting items to fill the bento grid */}
            {lobbyAnimationCount < activeBattle.participants.length && (
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/20 text-center animate-pulse">
                <span className="text-xs text-zinc-300 font-black">ПОДКЛЮЧЕНИЕ...</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={leaveBattle}
            className="flex-1 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-black text-xs rounded-xl transition-all uppercase tracking-wide border border-zinc-200 shadow-sm active:scale-95"
          >
            Выйти
          </button>
          
          <button 
            onClick={startMatch}
            className="flex-[2] py-3.5 bg-brand hover:bg-brand-dark text-white font-black text-xs rounded-xl transition-all uppercase tracking-wide shadow-md active:scale-95 border border-brand-dark"
          >
            Запустить Битву!
          </button>
        </div>
      </div>
    );
  }

  /* PODIUM / WINNER PHASE */
  if (activeBattle.status === 'podium') {
    const sorted = [...activeBattle.participants].sort((a, b) => b.score - a.score);
    const first = sorted[0];
    const second = sorted[1];
    const third = sorted[2];
    const myStats = sorted.find(p => p.isCurrentUser);

    return (
      <div className="bg-white border border-zinc-200 rounded-bento p-6 md:p-8 shadow-bento hover:shadow-bento-hover transition-all duration-300 min-h-[420px] flex flex-col justify-between relative overflow-hidden">
        {/* Glowing sparkles confetti style overlay */}
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-yellow-100/30 via-transparent to-transparent pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full font-black border border-yellow-200 shadow-sm">
            БИТВА ЗАВЕРШЕНА
          </span>
          <h2 className="text-2xl font-black text-zinc-950 tracking-tight font-outfit mt-3">Пьедестал Почета Арены</h2>
        </div>

        {/* 3D Podium Layout */}
        <div className="flex justify-center items-end gap-3.5 max-w-md mx-auto w-full mb-8 h-48 relative z-10">
          
          {/* 2nd Place */}
          {second && (
            <div className="flex flex-col items-center flex-1 h-3/4">
              <img src={second.avatar} alt={second.name} className="w-12 h-12 rounded-full border-2 border-slate-300 object-cover shadow" />
              <span className="text-[10px] font-black text-zinc-800 truncate w-24 text-center mt-1.5">{second.name}</span>
              <div className="w-full bg-slate-200 border-t-2 border-slate-300 rounded-t-xl mt-2 flex-1 flex flex-col items-center justify-center p-2 shadow-inner">
                <span className="text-[10px] font-bold text-slate-500 uppercase">2 место</span>
                <span className="text-[10px] font-black text-slate-700 mt-1">{second.score}</span>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {first && (
            <div className="flex flex-col items-center flex-1 h-full">
              <Crown className="w-5 h-5 text-yellow-500 animate-bounce" />
              <img src={first.avatar} alt={first.name} className="w-14 h-14 rounded-full border-4 border-yellow-400 object-cover shadow-lg" />
              <span className="text-[10px] font-black text-zinc-950 truncate w-24 text-center mt-1.5">{first.name}</span>
              <div className="w-full bg-yellow-100 border-t-4 border-yellow-400 rounded-t-xl mt-2 flex-1 flex flex-col items-center justify-center p-2 shadow-inner">
                <span className="text-[10px] font-bold text-yellow-700 uppercase">1 место</span>
                <span className="text-[11px] font-black text-yellow-800 mt-1">{first.score}</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {third && (
            <div className="flex flex-col items-center flex-1 h-2/3">
              <img src={third.avatar} alt={third.name} className="w-10 h-10 rounded-full border-2 border-amber-500 object-cover shadow" />
              <span className="text-[10px] font-black text-zinc-800 truncate w-24 text-center mt-1.5">{third.name}</span>
              <div className="w-full bg-amber-50 border-t-2 border-amber-200 rounded-t-xl mt-2 flex-1 flex flex-col items-center justify-center p-2 shadow-inner">
                <span className="text-[10px] font-bold text-amber-600 uppercase">3 место</span>
                <span className="text-[10px] font-black text-amber-800 mt-1">{third.score}</span>
              </div>
            </div>
          )}
        </div>

        {/* Player recap details */}
        {myStats && (
          <div className="bg-zinc-50 border border-zinc-200/60 rounded-2xl p-4 flex justify-between items-center max-w-lg mx-auto w-full mb-6 text-center">
            <div className="flex-1">
              <span className="block text-[9px] font-black text-zinc-400 uppercase tracking-wide">Ваше место</span>
              <span className="text-lg font-black text-zinc-900 font-outfit">
                {sorted.findIndex(p => p.isCurrentUser) + 1}-е из {sorted.length}
              </span>
            </div>
            
            <div className="w-px h-8 bg-zinc-200" />
            
            <div className="flex-1">
              <span className="block text-[9px] font-black text-zinc-400 uppercase tracking-wide">Набрано очков</span>
              <span className="text-lg font-black text-brand font-outfit">{myStats.score}</span>
            </div>

            <div className="w-px h-8 bg-zinc-200" />
            
            <div className="flex-1">
              <span className="block text-[9px] font-black text-zinc-400 uppercase tracking-wide">Бонус скорости</span>
              <span className="text-lg font-black text-yellow-600 font-outfit">+{myStats.speedBonusTotal}</span>
            </div>
          </div>
        )}

        <button 
          onClick={leaveBattle}
          className="w-full py-4 bg-zinc-950 hover:bg-zinc-900 text-white rounded-2xl font-black text-xs transition-all uppercase tracking-wide shadow-md active:scale-95 text-center block"
        >
          Вернуться в Личный Кабинет
        </button>
      </div>
    );
  }

  /* PLAYING THE BATTLE */
  return (
    <div className="bg-white border border-zinc-200 rounded-bento shadow-bento p-6 md:p-8 flex flex-col lg:flex-row gap-6 min-h-[460px]">
      
      {/* LEFT: CURRENT QUESTION PANEL (2/3 width) */}
      <div className="flex-1 lg:flex-[2] flex flex-col justify-between min-h-[360px]">
        <div>
          {/* Header Row */}
          <div className="flex justify-between items-center border-b border-zinc-100 pb-3 mb-4">
            <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-black border border-indigo-100 shadow-sm uppercase tracking-wide">
              Вопрос {activeBattle.currentQuestionIndex + 1} из 5
            </span>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Осталось:</span>
              <span className="text-sm font-black text-rose-500 font-outfit tracking-tighter w-6 text-right">
                {activeBattle.timer} сек
              </span>
            </div>
          </div>

          {/* Progress Timeline Indicator */}
          <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden mb-6">
            <div 
              className="h-full bg-indigo-600 transition-all duration-1000" 
              style={{ width: `${(activeBattle.timer / 15) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <h3 className="text-base font-extrabold text-zinc-950 leading-relaxed font-outfit mb-6">
            {currentQuestion.question}
          </h3>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQuestion.correctOptionIndex;
              
              let optStyle = 'border-zinc-200 hover:bg-zinc-50 text-zinc-800';
              if (hasAnsweredThisRound) {
                if (isCorrect) {
                  optStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold';
                } else if (isSelected) {
                  optStyle = 'bg-rose-50 border-rose-500 text-rose-800 font-bold';
                } else {
                  optStyle = 'opacity-50 border-zinc-100';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={hasAnsweredThisRound}
                  className={`w-full p-4 text-left text-xs font-bold border-2 rounded-2xl transition-all duration-150 flex items-center justify-between ${optStyle} ${!hasAnsweredThisRound && 'active:scale-[0.98]'}`}
                >
                  <span>{opt}</span>
                  {hasAnsweredThisRound && isCorrect && <span className="text-emerald-600">✓</span>}
                  {hasAnsweredThisRound && isSelected && !isCorrect && <span className="text-rose-600">✗</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Round Feedback & Controls */}
        {hasAnsweredThisRound ? (
          <div className="bg-zinc-50 border border-zinc-200/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-scale-in">
            <div>
              {answerResult?.isCorrect ? (
                <p className="text-xs text-emerald-700 font-black">
                  Правильно! Получено +{answerResult.points} очков (Speed Bonus +{answerResult.speedBonus})!
                </p>
              ) : (
                <p className="text-xs text-rose-700 font-black">
                  Неверно! Попробуйте сосредоточиться на следующем раунде.
                </p>
              )}
              <p className="text-[10px] text-zinc-500 leading-normal mt-1 max-w-md">
                {currentQuestion.explanation}
              </p>
            </div>
            
            <button 
              onClick={handleNextRound}
              className="py-2.5 px-5 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black shadow border border-brand-dark active:scale-95 self-end sm:self-center transition-all uppercase tracking-wide"
            >
              Дальше
            </button>
          </div>
        ) : (
          <p className="text-[10px] font-bold text-zinc-400 text-center select-none uppercase tracking-wide">
            Выберите вариант ответа для начисления очков
          </p>
        )}
      </div>

      {/* RIGHT: REAL-TIME SCOREBOARD (1/3 width) */}
      <div className="w-full lg:w-72 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-black text-zinc-950 tracking-tight font-outfit uppercase tracking-wider mb-4 border-b border-zinc-200 pb-2">
            Таблица лидеров битвы
          </h4>
          
          {/* Dynamic Sorted participants list */}
          <div className="space-y-2.5">
            {activeBattle.participants.map((player, index) => (
              <div 
                key={player.friendId}
                className={`flex items-center justify-between p-2 rounded-xl border transition-all duration-300 ${
                  player.isCurrentUser 
                    ? 'bg-indigo-50/50 border-indigo-200/80' 
                    : 'bg-white border-zinc-200/60 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 max-w-[70%]">
                  <span className="text-[10px] font-black text-zinc-400 w-4 text-center">
                    {index + 1}
                  </span>
                  
                  <img 
                    src={player.avatar} 
                    alt={player.name} 
                    className="w-6 h-6 rounded-lg object-cover border border-zinc-200"
                  />
                  
                  <div className="truncate">
                    <h5 className="text-[10px] font-black text-zinc-800 truncate leading-tight">
                      {player.name}
                    </h5>
                    
                    {/* Previous Answers dots */}
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: 5 }).map((_, qIdx) => {
                        const answered = player.answers[qIdx];
                        if (answered === undefined) {
                          return <div key={qIdx} className="w-1.5 h-1.5 rounded-full bg-zinc-200" />;
                        }
                        return (
                          <div 
                            key={qIdx} 
                            className={`w-1.5 h-1.5 rounded-full ${answered ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-zinc-950 font-outfit">
                    {player.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={leaveBattle}
          className="mt-6 w-full py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-600 rounded-xl text-[10px] font-black transition-colors uppercase tracking-wider text-center"
        >
          Прервать Битву
        </button>
      </div>

    </div>
  );
};
