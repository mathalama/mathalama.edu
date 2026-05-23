import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLmsStore } from '../../store/useLmsStore';
import { CheckCircle2, Lock, HelpCircle, FileText, Upload, AlertCircle, RefreshCw, Send, Check } from 'lucide-react';

interface LessonFlowProps {
  lessonId: string;
}

export const LessonFlow: React.FC<LessonFlowProps> = ({ lessonId }) => {
  const { modules, submitTest, submitPdf, isSubmittingPdf, pdfUploadProgress } = useLmsStore();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Extract lesson progress
  let lessonTitle = '';
  let isVideoWatched = false;
  let testPassed = false;
  let testScore = 0;
  let testQuestions: any[] = [];
  let assignmentStatus: string = 'not_submitted';
  let assignmentFeedback: string | undefined = '';

  modules.forEach((mod) => {
    mod.lessons.forEach((les) => {
      if (les.id === lessonId) {
        lessonTitle = les.title;
        isVideoWatched = les.components.video_watched;
        testPassed = les.components.test.passed;
        testScore = les.components.test.score;
        testQuestions = les.components.test.questions || [];
        assignmentStatus = les.components.assignment.status;
        assignmentFeedback = les.components.assignment.feedback;
      }
    });
  });

  // Step state
  const step1Active = true;
  const step2Active = isVideoWatched;
  const step3Active = isVideoWatched && testPassed;

  // Quiz calculations
  const handleAnswerSelect = (questionId: string, optionIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleQuizSubmit = () => {
    if (Object.keys(selectedAnswers).length < testQuestions.length) return;
    
    let correctCount = 0;
    testQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / testQuestions.length) * 100);
    submitTest(lessonId, score);
    setQuizSubmitted(true);
  };

  const handleQuizRetry = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
  };

  // PDF simulated S3 direct upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      triggerUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      triggerUpload(file);
    }
  };

  const triggerUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Допускаются только PDF-файлы для конспектов лекций.');
      return;
    }
    setUploadedFileName(file.name);
    await submitPdf(lessonId, file.name);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-8"
    >
      <div className="border-b border-zinc-100 pb-4">
        <h2 className="text-2xl font-black text-zinc-900 font-outfit">Конвейер прохождения урока</h2>
        <p className="text-xs text-zinc-400 mt-1">Последовательный (Content Dripping) доступ к шагам обучения</p>
      </div>

      {/* STEP 1: Video Lecture Tracker */}
      <div className={`relative flex items-start space-x-4 p-4 rounded-2xl border transition-all duration-300 ${
        isVideoWatched ? 'bg-emerald-50/20 border-emerald-100' : 'bg-white border-zinc-100'
      }`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold ${
          isVideoWatched ? 'bg-emerald-500 text-white' : 'bg-brand text-white'
        }`}>
          {isVideoWatched ? <CheckCircle2 className="w-5 h-5" /> : '1'}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-zinc-800">Шаг 1: Видеолекция</h4>
          <p className="text-xs text-zinc-400 mt-0.5">Посмотрите видеоматериал урока на левой Bento-панели.</p>
          {isVideoWatched ? (
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 mt-2 bg-emerald-50 px-2 py-0.5 rounded-md">
              ✓ Лекция успешно просмотрена (+50 XP)
            </span>
          ) : (
            <span className="inline-flex items-center text-[10px] font-bold text-zinc-400 mt-2 bg-zinc-50 px-2 py-0.5 rounded-md">
              ● Ожидание просмотра видеолекции
            </span>
          )}
        </div>
      </div>

      {/* STEP 2: Interactive Quiz */}
      <div className={`relative flex items-start space-x-4 p-4 rounded-2xl border transition-all duration-300 ${
        !step2Active 
          ? 'bg-zinc-50/50 border-zinc-100 opacity-50 select-none' 
          : testPassed 
            ? 'bg-emerald-50/20 border-emerald-100' 
            : 'bg-white border-zinc-100'
      }`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold ${
          !step2Active 
            ? 'bg-zinc-200 text-zinc-400' 
            : testPassed 
              ? 'bg-emerald-500 text-white' 
              : 'bg-brand text-white'
        }`}>
          {!step2Active ? <Lock className="w-4 h-4" /> : testPassed ? <CheckCircle2 className="w-5 h-5" /> : '2'}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h4 className="text-sm font-bold text-zinc-800">Шаг 2: Интерактивный тест</h4>
            <p className="text-xs text-zinc-400 mt-0.5">Закрепите полученные знания. Проходной балл — 70%.</p>
          </div>

          {step2Active && (
            <div className="space-y-4 pt-2">
              {testQuestions.map((q) => (
                <div key={q.id} className="bg-zinc-50/70 border border-zinc-100 p-3 rounded-xl space-y-2">
                  <div className="flex items-start space-x-1.5">
                    <HelpCircle className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs font-bold text-zinc-700 leading-tight">{q.text}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {q.options.map((opt: string, idx: number) => {
                      const isSelected = selectedAnswers[q.id] === idx;
                      let optionStyle = 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600';
                      if (isSelected) {
                        optionStyle = 'border-brand bg-brand-light text-brand font-semibold';
                      }
                      if (quizSubmitted) {
                        if (idx === q.correctOptionIndex) {
                          optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold';
                        } else if (isSelected && idx !== q.correctOptionIndex) {
                          optionStyle = 'border-rose-300 bg-rose-50 text-rose-600';
                        } else {
                          optionStyle = 'border-zinc-100 bg-zinc-50/20 text-zinc-400 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={quizSubmitted}
                          onClick={() => handleAnswerSelect(q.id, idx)}
                          className={`w-full text-left px-3.5 py-2 text-xs border rounded-lg transition-all ${optionStyle} cursor-pointer`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Submit / Results Actions */}
              {!testPassed && !quizSubmitted && (
                <button
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(selectedAnswers).length < testQuestions.length}
                  className="px-4 py-2 bg-brand text-white text-xs font-bold rounded-lg hover:bg-brand-dark active:scale-95 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:scale-100 transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Отправить ответы</span>
                </button>
              )}

              {quizSubmitted && !testPassed && (
                <div className="flex items-center space-x-3 pt-2">
                  <div className="text-xs text-rose-500 font-semibold flex items-center space-x-1 bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span>Не набрано 70%. Результат: {testScore}%</span>
                  </div>
                  <button
                    onClick={handleQuizRetry}
                    className="flex items-center space-x-1 px-3.5 py-2 border border-zinc-200 text-xs font-bold text-zinc-600 rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Пересдать</span>
                  </button>
                </div>
              )}

              {testPassed && (
                <div className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  ✓ Тест сдан на {testScore}% (+150 XP)
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* STEP 3: Homework Upload */}
      <div className={`relative flex items-start space-x-4 p-4 rounded-2xl border transition-all duration-300 ${
        !step3Active 
          ? 'bg-zinc-50/50 border-zinc-100 opacity-50 select-none' 
          : assignmentStatus === 'approved' 
            ? 'bg-emerald-50/20 border-emerald-100 shadow-sm' 
            : 'bg-white border-zinc-100'
      }`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold ${
          !step3Active 
            ? 'bg-zinc-200 text-zinc-400' 
            : assignmentStatus === 'approved' 
              ? 'bg-emerald-500 text-white' 
              : 'bg-brand text-white'
        }`}>
          {!step3Active ? <Lock className="w-4 h-4" /> : assignmentStatus === 'approved' ? <CheckCircle2 className="w-5 h-5" /> : '3'}
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-zinc-800">Шаг 3: Рукописный конспект лекции</h4>
            <p className="text-xs text-zinc-400 mt-0.5">Загрузите PDF написанного от руки конспекта для проверки куратором.</p>
          </div>

          {step3Active && (
            <div className="space-y-4">
              
              {/* Idle Upload State */}
              {assignmentStatus === 'not_submitted' && !isSubmittingPdf && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border border-dashed border-zinc-200 rounded-xl p-6 text-center space-y-3 transition-colors ${
                    dragOver ? 'border-brand bg-brand-light/20' : 'bg-zinc-50/20'
                  }`}
                >
                  <div className="w-10 h-10 bg-zinc-50 border border-zinc-100 text-zinc-400 rounded-lg flex items-center justify-center mx-auto shadow-sm">
                    <Upload className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-700 block">Перетащите PDF сюда</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5 block">Размер файла до 20 МБ</span>
                  </div>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="homework-file-picker"
                  />
                  <label
                    htmlFor="homework-file-picker"
                    className="inline-block px-3 py-1.5 bg-white border border-zinc-200 text-[10px] font-bold text-zinc-600 rounded-lg cursor-pointer hover:bg-zinc-50 transition-colors shadow-sm"
                  >
                    Выбрать файл
                  </label>
                </div>
              )}

              {/* Progress Uploading State */}
              {isSubmittingPdf && (
                <div className="border border-zinc-100 rounded-xl p-4 bg-zinc-50/40 space-y-3 animate-pulse">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-brand flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      {pdfUploadProgress < 40 
                        ? 'Генерация S3 Presigned URL...' 
                        : pdfUploadProgress < 85 
                          ? 'Прямая выгрузка в MinIO S3...' 
                          : 'Антивирусный анализ ClamAV...'}
                    </span>
                    <span className="text-zinc-600 tabular-nums">{pdfUploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand rounded-full transition-all duration-300" style={{ width: `${pdfUploadProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Pending Verification / Review state */}
              {assignmentStatus === 'pending' && (
                <div className="border border-amber-100 rounded-xl p-4 bg-amber-50/20 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-600 text-xs font-bold">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                    <span>Конспект отправлен куратору</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    Имитация работы куратора: Запрос поступил в Telegram-бот куратора <strong>Алексея Иванова</strong>. Бот проверит Magic Bytes и ClamAV, после чего куратор выставит оценку через 5 секунд...
                  </p>
                  {uploadedFileName && (
                    <div className="inline-flex items-center space-x-1.5 text-[9px] bg-zinc-50 border border-zinc-100 text-zinc-600 px-2.5 py-1 rounded-md font-medium">
                      <FileText className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{uploadedFileName}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Approved Homework panel */}
              {assignmentStatus === 'approved' && (
                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-2.5 shadow-sm">
                    <div className="flex items-center space-x-2 text-emerald-700 text-xs font-black">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Конспект лекции одобрен куратором!</span>
                    </div>
                    {assignmentFeedback && (
                      <p className="text-xs text-zinc-600 italic bg-white border border-zinc-100/50 p-2.5 rounded-lg leading-relaxed">
                        &ldquo;{assignmentFeedback}&rdquo;
                      </p>
                    )}
                    <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-white border border-emerald-100 px-2 py-0.5 rounded-md">
                      Оценка: 100% (+300 XP)
                    </span>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
