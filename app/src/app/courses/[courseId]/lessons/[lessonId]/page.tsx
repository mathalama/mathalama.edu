'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { VideoPlayer } from '@/components/bento/VideoPlayer';
import { useLmsStore } from '@/store/useLmsStore';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  CheckCircle,
  XCircle,
  Upload,
  Clock,
  Loader2,
} from 'lucide-react';

export default function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const resolvedParams = use(params);
  const { courses, modules, submitTest, submitPdf, isSubmittingPdf, pdfUploadProgress, selectLesson } = useLmsStore();
  const router = useRouter();

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Find course and lessons
  const course = courses.find((c) => c.id === resolvedParams.courseId);
  let currentLesson: any = null;
  let currentModule: any = null;
  let lessonIndex = -1;
  let allLessons: any[] = [];

  modules
    .filter((mod) => mod.course_id === resolvedParams.courseId)
    .forEach((mod) => {
      mod.lessons.forEach((les, idx) => {
        allLessons.push({ ...les, moduleTitle: mod.module_title });
        if (les.id === resolvedParams.lessonId) {
          currentLesson = les;
          currentModule = mod;
          lessonIndex = allLessons.length - 1;
        }
      });
    });

  if (!currentLesson) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-zinc-500 font-medium">Урок не найден</p>
        </div>
      </DashboardLayout>
    );
  }

  const prevLesson = lessonIndex > 0 ? allLessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < allLessons.length - 1 ? allLessons[lessonIndex + 1] : null;

  const handleTestSubmit = () => {
    const questions = currentLesson.components.test.questions;
    let correct = 0;
    questions.forEach((q: any) => {
      if (selectedAnswers[q.id] === q.correctOptionIndex) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    submitTest(currentLesson.id, score);
    setTestSubmitted(true);
  };

  const handlePdfUpload = async () => {
    if (!pdfFile) return;
    await submitPdf(currentLesson.id, pdfFile.name);
    setPdfFile(null);
  };

  const navigateToLesson = (lesson: any) => {
    if (lesson.status === 'locked') return;
    selectLesson(lesson.id);
    router.push(`/courses/${resolvedParams.courseId}/lessons/${lesson.id}`);
  };

  // Select this lesson on load
  React.useEffect(() => {
    selectLesson(resolvedParams.lessonId);
  }, [resolvedParams.lessonId, selectLesson]);

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-8 w-full">

        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
          <button onClick={() => router.push('/courses')} className="hover:text-brand transition-colors cursor-pointer">
            Мои Курсы
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button onClick={() => router.push(`/courses/${resolvedParams.courseId}`)} className="hover:text-brand transition-colors cursor-pointer text-left">
            {course?.title || 'Курс'}
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span style={{ color: 'var(--text-primary)' }}>{currentLesson.title}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-outfit" style={{ color: 'var(--text-primary)' }}>
              {currentLesson.title}
            </h1>
            <p className="text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
              {currentModule?.module_title}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {currentLesson.status === 'completed' && (
              <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full font-bold flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Пройден</span>
              </span>
            )}
          </div>
        </div>

        {/* Video Player (full width) */}
        <div className="bento-card">
          <VideoPlayer lessonId={currentLesson.id} />
        </div>



        {/* Test Section */}
        {currentLesson.components.test.required && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bento-card space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-outfit" style={{ color: 'var(--text-primary)' }}>
                Тестирование по уроку
              </h3>
              {currentLesson.components.test.passed && (
                <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full font-bold">
                  ✓ Тест сдан ({currentLesson.components.test.score}%)
                </span>
              )}
            </div>

            {currentLesson.components.test.questions.map((q: any, qIdx: number) => (
              <div key={q.id} className="p-4 rounded-2xl border space-y-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {qIdx + 1}. {q.text}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt: string, oIdx: number) => {
                    const isSelected = selectedAnswers[q.id] === oIdx;
                    const isCorrect = testSubmitted && oIdx === q.correctOptionIndex;
                    const isWrong = testSubmitted && isSelected && oIdx !== q.correctOptionIndex;

                    return (
                      <button
                        key={oIdx}
                        onClick={() => {
                          if (!testSubmitted) {
                            setSelectedAnswers((prev) => ({ ...prev, [q.id]: oIdx }));
                          }
                        }}
                        disabled={testSubmitted}
                        className={`text-left px-4 py-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : isWrong
                              ? 'bg-rose-50 border-rose-200 text-rose-800'
                              : isSelected
                                ? 'border-brand bg-brand-light text-brand'
                                : 'hover:border-zinc-300'
                        }`}
                        style={!isCorrect && !isWrong && !isSelected ? { borderColor: 'var(--border)', color: 'var(--text-secondary)' } : undefined}
                      >
                        <span className="flex items-center space-x-2">
                          {isCorrect && <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                          {isWrong && <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                          <span>{opt}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {!testSubmitted && !currentLesson.components.test.passed && (
              <button
                onClick={handleTestSubmit}
                disabled={Object.keys(selectedAnswers).length < currentLesson.components.test.questions.length}
                className="w-full bg-brand hover:bg-brand-dark text-white py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 cursor-pointer shadow-sm"
              >
                Отправить ответы
              </button>
            )}
          </motion.div>
        )}

        {/* PDF Assignment Section */}
        {currentLesson.components.assignment.required && currentLesson.components.test.passed && (
          <div className="bento-card space-y-4">
            <h3 className="text-lg font-bold font-outfit" style={{ color: 'var(--text-primary)' }}>
              Домашнее задание — Конспект
            </h3>

            {currentLesson.components.assignment.status === 'approved' ? (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-2">
                <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm">
                  <CheckCircle className="w-5 h-5" />
                  <span>Конспект одобрен куратором!</span>
                </div>
                {currentLesson.components.assignment.feedback && (
                  <p className="text-xs text-emerald-600 leading-relaxed">
                    «{currentLesson.components.assignment.feedback}»
                  </p>
                )}
              </div>
            ) : currentLesson.components.assignment.status === 'pending' ? (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-bold text-amber-700">На проверке у куратора...</span>
              </div>
            ) : (
              <div className="border border-dashed rounded-2xl p-6 text-center space-y-4" style={{ borderColor: 'var(--border)' }}>
                <div className="text-4xl" style={{ color: 'var(--text-tertiary)' }}>PDF</div>
                <div>
                  <span className="text-sm font-semibold block" style={{ color: 'var(--text-primary)' }}>Загрузить конспект</span>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>PDF, максимум 20 МБ</span>
                </div>

                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setPdfFile(e.target.files[0]);
                  }}
                  className="hidden"
                  id="pdf-upload-lesson"
                />
                <label
                  htmlFor="pdf-upload-lesson"
                  className="inline-block px-4 py-2 border text-xs font-semibold rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  Выбрать файл
                </label>

                {pdfFile && (
                  <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Выбран: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}

                {isSubmittingPdf && (
                  <div className="space-y-2">
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pdfUploadProgress}%` }}
                        className="h-full bg-brand rounded-full"
                      />
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Загрузка и антивирусное сканирование...</span>
                    </div>
                  </div>
                )}

                {pdfFile && !isSubmittingPdf && (
                  <button
                    onClick={handlePdfUpload}
                    className="w-full bg-brand hover:bg-brand-dark text-white py-3 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Отправить на проверку</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Lesson Navigation */}
        <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          {prevLesson ? (
            <button
              onClick={() => navigateToLesson(prevLesson)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{prevLesson.title}</span>
              <span className="sm:hidden">Назад</span>
            </button>
          ) : <div />}

          {nextLesson ? (
            <button
              onClick={() => navigateToLesson(nextLesson)}
              disabled={nextLesson.status === 'locked'}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                nextLesson.status === 'locked'
                  ? 'opacity-40'
                  : 'bg-brand text-white hover:bg-brand-dark shadow-sm'
              }`}
              style={nextLesson.status === 'locked' ? { borderColor: 'var(--border)', color: 'var(--text-tertiary)', border: '1px solid var(--border)' } : undefined}
            >
              <span className="hidden sm:inline">{nextLesson.title}</span>
              <span className="sm:hidden">Далее</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : <div />}
        </div>

      </div>
    </DashboardLayout>
  );
}
