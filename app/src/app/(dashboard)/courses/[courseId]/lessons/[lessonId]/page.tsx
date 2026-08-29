'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { VideoPlayer } from '@/components/bento/VideoPlayer';
import { LessonTheoryView } from '@/components/lesson/LessonTheoryView';
import { LessonQuizView } from '@/components/lesson/LessonQuizView';
import { LessonAssignmentView } from '@/components/lesson/LessonAssignmentView';
import { useLmsStore } from '@/store/useLmsStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  HelpCircle,
  FileText,
  CheckCircle2,
  Lock,
  Sparkles,
  Clock,
  Maximize2,
  ChevronDown
} from 'lucide-react';

export default function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const resolvedParams = use(params);
  const { courses, modules, selectLesson } = useLmsStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'theory' | 'quiz' | 'assignment'>('theory');
  const [externalSeek, setExternalSeek] = useState<number | null>(null);

  // Find course and lessons
  const course = courses.find((c) => c.id === resolvedParams.courseId);
  let currentLesson: any = null;
  let currentModule: any = null;
  let lessonIndex = -1;
  const allLessons: any[] = [];

  modules
    .filter((mod) => mod.course_id === resolvedParams.courseId)
    .forEach((mod) => {
      mod.lessons.forEach((les) => {
        allLessons.push({ ...les, moduleTitle: mod.module_title, moduleId: mod.module_id });
        if (les.id === resolvedParams.lessonId) {
          currentLesson = les;
          currentModule = mod;
          lessonIndex = allLessons.length - 1;
        }
      });
    });

  // Select this lesson on load
  React.useEffect(() => {
    selectLesson(resolvedParams.lessonId);
  }, [resolvedParams.lessonId, selectLesson]);

  if (!currentLesson) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-zinc-500 font-medium">Урок не найден</p>
      </div>
    );
  }

  const prevLesson = lessonIndex > 0 ? allLessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < allLessons.length - 1 ? allLessons[lessonIndex + 1] : null;

  // Step Statuses
  const videoWatched = !!currentLesson.components?.video_watched;
  const testPassed = !!currentLesson.components?.test?.passed;
  const assignmentStatus = currentLesson.components?.assignment?.status || 'not_submitted';

  let completedSteps = 0;
  if (videoWatched) completedSteps += 1;
  if (testPassed) completedSteps += 1;
  if (assignmentStatus === 'approved') completedSteps += 1;

  const handleSeekFromTheory = (seconds: number) => {
    setExternalSeek(seconds);
    setActiveTab('theory');
  };

  const navigateToLesson = (lesson: any) => {
    if (lesson.status === 'locked') return;
    selectLesson(lesson.id);
    router.push(`/courses/${resolvedParams.courseId}/lessons/${lesson.id}`);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-2rem)] p-4 sm:p-6 lg:p-7 space-y-4 w-full">
        
        {/* Top Control & Breadcrumb Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="space-y-1 min-w-0">
            {/* Breadcrumbs */}
            <div className="flex items-center space-x-2 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              <button onClick={() => router.push('/courses')} className="hover:text-brand transition-colors cursor-pointer">
                Мои курсы
              </button>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <button onClick={() => router.push(`/courses/${resolvedParams.courseId}`)} className="hover:text-brand transition-colors cursor-pointer truncate max-w-[220px]">
                {course?.title || 'Курс'}
              </button>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate max-w-[280px] font-bold" style={{ color: 'var(--text-primary)' }}>{currentLesson.title}</span>
            </div>

            <div className="flex items-center space-x-2.5 pt-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand/10 text-brand">
                {currentModule?.module_title || 'Модуль'}
              </span>
              <h1 className="text-lg sm:text-xl font-black font-outfit truncate" style={{ color: 'var(--text-primary)' }}>
                {currentLesson.title}
              </h1>
            </div>
          </div>

          {/* Stepper Tabs Selector */}
          <div className="flex items-center rounded-2xl p-1 border gap-1 self-start md:self-center overflow-x-auto max-w-full flex-shrink-0" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
            <button
              onClick={() => setActiveTab('theory')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'theory'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/50 dark:border-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-brand" />
              <span>1. Теория & Лекция</span>
              {videoWatched && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'quiz'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/50 dark:border-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>2. Проверочный тест</span>
              {testPassed && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
            </button>

            <button
              onClick={() => setActiveTab('assignment')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'assignment'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/50 dark:border-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-purple-500" />
              <span>3. Практика / ДЗ</span>
              {assignmentStatus === 'approved' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
            </button>
          </div>
        </div>

        {/* Full-Height Main Studio Workspace (Grid 12 cols, filling entire screen height) */}
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-5 min-h-[580px]">
          
          {/* Left Studio Column (Video Player + Media Details) - Takes 7 spans */}
          <div className="xl:col-span-7 flex flex-col justify-between space-y-4">
            <div className="bento-card p-4 sm:p-5 flex-1 flex flex-col justify-between">
              <VideoPlayer
                lessonId={currentLesson.id}
                externalSeek={externalSeek}
              />
            </div>
          </div>

          {/* Right Studio Column (Active Tab Hub with Independent Scroll) - Takes 5 spans */}
          <div className="xl:col-span-5 flex flex-col">
            <div className="bento-card p-4 sm:p-5 flex-1 flex flex-col overflow-y-auto max-h-[calc(100vh-210px)] scrollbar-thin">
              <AnimatePresence mode="wait">
                {activeTab === 'theory' && (
                  <motion.div
                    key="theory"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1"
                  >
                    <LessonTheoryView
                      lesson={currentLesson}
                      course={course}
                      onSeekRequested={handleSeekFromTheory}
                    />
                  </motion.div>
                )}

                {activeTab === 'quiz' && (
                  <motion.div
                    key="quiz"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1"
                  >
                    <LessonQuizView
                      lesson={currentLesson}
                      onQuizCompleted={() => setActiveTab('assignment')}
                    />
                  </motion.div>
                )}

                {activeTab === 'assignment' && (
                  <motion.div
                    key="assignment"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1"
                  >
                    <LessonAssignmentView
                      lesson={currentLesson}
                      course={course}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* Bottom Sticky-Style Navigation Bar */}
        <div className="flex items-center justify-between pt-3 border-t mt-auto" style={{ borderColor: 'var(--border)' }}>
          {prevLesson ? (
            <button
              onClick={() => navigateToLesson(prevLesson)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Предыдущий: {prevLesson.title}</span>
              <span className="sm:hidden">Назад</span>
            </button>
          ) : <div />}

          <div className="hidden md:flex items-center space-x-2 text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
            <span>Выполнено {completedSteps} из 3 этапов</span>
          </div>

          {nextLesson ? (
            <button
              onClick={() => navigateToLesson(nextLesson)}
              disabled={nextLesson.status === 'locked'}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                nextLesson.status === 'locked'
                  ? 'opacity-40 border'
                  : 'bg-brand text-white hover:bg-brand-dark shadow-md'
              }`}
              style={nextLesson.status === 'locked' ? { borderColor: 'var(--border)', color: 'var(--text-secondary)' } : undefined}
            >
              {nextLesson.status === 'locked' && <Lock className="w-3.5 h-3.5 mr-1" />}
              <span className="hidden sm:inline">Следующий: {nextLesson.title}</span>
              <span className="sm:hidden">Далее</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => router.push(`/courses/${resolvedParams.courseId}`)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-md"
            >
              <span>Завершить модуль</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
  );
}
