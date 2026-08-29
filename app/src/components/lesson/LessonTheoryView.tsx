'use client';

import React, { useState } from 'react';
import { useLmsStore } from '../../store/useLmsStore';
import {
  BookOpen,
  FileText,
  Download,
  Bookmark,
  Trash2,
  Play,
  HelpCircle,
  Send,
  Sparkles,
  Copy,
  Check,
  MessageCircleQuestion,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LessonTheoryViewProps {
  lesson: any;
  course: any;
  onSeekRequested: (seconds: number) => void;
}

export const LessonTheoryView: React.FC<LessonTheoryViewProps> = ({ lesson, course, onSeekRequested }) => {
  const { videoNotes, deleteVideoNote, addToast } = useLmsStore();
  const [copied, setCopied] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [questionSent, setQuestionSent] = useState(false);

  const lessonNotes = videoNotes.filter((n) => n.lesson_id === lesson.id);

  const handleCopyTheory = () => {
    navigator.clipboard.writeText(lesson.theory_content || '');
    setCopied(true);
    addToast('Конспект скопирован', 'Текст конспекта сохранен в буфер обмена.', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    setQuestionSent(true);
    setTimeout(() => {
      setQuestionSent(false);
      setQuestionText('');
      setQuestionModalOpen(false);
      addToast('Вопрос отправлен', 'Куратор ответит вам в личном кабинете в течение 15 минут.', 'success');
    }, 1000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* 1. Core Summary / Theory Content */}
      <div className="p-5 rounded-2xl border space-y-4" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-brand" />
            <h3 className="text-sm font-extrabold font-outfit" style={{ color: 'var(--text-primary)' }}>
              Опорный конспект и правила темы
            </h3>
          </div>

          <button
            onClick={handleCopyTheory}
            className="flex items-center space-x-1 text-xs font-bold text-zinc-500 hover:text-brand transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Скопировано' : 'Скопировать текст'}</span>
          </button>
        </div>

        {/* Formatted Content */}
        <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal" style={{ color: 'var(--text-primary)' }}>
          {lesson.theory_content || 'Теоретический конспект к данному уроку подготавливается преподавателем.'}
        </div>

        {/* Downloadable Reference PDF / Cheat Sheet */}
        <div className="pt-2 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center space-x-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <FileText className="w-4 h-4 text-brand" />
            <span>Шпаргалка к уроку (PDF, формулы и правила)</span>
          </div>

          <a
            href="#download"
            onClick={(e) => {
              e.preventDefault();
              addToast('Скачивание шпаргалки', 'Файл шпаргалки сохранен на устройство.', 'success');
            }}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand/10 text-brand hover:bg-brand/20 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Скачать материалы</span>
          </a>
        </div>
      </div>

      {/* 2. Personal Notes with Timestamps */}
      <div className="p-5 rounded-2xl border space-y-3" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bookmark className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-extrabold font-outfit" style={{ color: 'var(--text-primary)' }}>
              Мои заметки к лекции ({lessonNotes.length})
            </h3>
          </div>
          <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            Кликните на заметку для перехода к моменту в видео
          </span>
        </div>

        {lessonNotes.length === 0 ? (
          <div className="py-6 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
            У вас пока нет заметок к этому уроку. Нажмите кнопку «Заметка» в плеере во время просмотра.
          </div>
        ) : (
          <div className="space-y-2">
            {lessonNotes.map((note) => (
              <div
                key={note.id}
                className="flex items-start justify-between p-3 rounded-xl border group transition-all"
                style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}
              >
                <div
                  onClick={() => onSeekRequested(note.video_timestamp_seconds)}
                  className="space-y-1 min-w-0 flex-1 mr-3 cursor-pointer"
                >
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-brand/10 text-brand text-[10px] font-mono font-bold group-hover:bg-brand group-hover:text-white transition-colors">
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>{formatTime(note.video_timestamp_seconds)}</span>
                  </span>
                  <p className="text-xs leading-relaxed font-medium" style={{ color: 'var(--text-primary)' }}>
                    {note.note_text}
                  </p>
                </div>

                <button
                  onClick={() => deleteVideoNote(note.id)}
                  className="text-zinc-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                  title="Удалить заметку"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Ask Curator Question Block */}
      <div className="p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
        <div className="space-y-1">
          <h4 className="text-xs font-extrabold flex items-center space-x-1.5" style={{ color: 'var(--text-primary)' }}>
            <MessageCircleQuestion className="w-4 h-4 text-purple-500" />
            <span>Остались вопросы по теме?</span>
          </h4>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Куратор {course?.curator_name || 'преподаватель'} готов разобрать сложное место или правило.
          </p>
        </div>

        <button
          onClick={() => setQuestionModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 hover:border-brand transition-all cursor-pointer whitespace-nowrap shadow-sm"
        >
          Задать вопрос куратору
        </button>
      </div>

      {/* Question Modal */}
      <AnimatePresence>
        {questionModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuestionModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 rounded-2xl z-50 border shadow-2xl space-y-4"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-base font-extrabold font-outfit" style={{ color: 'var(--text-primary)' }}>
                  Вопрос по уроку: {lesson.title}
                </h3>
                <button
                  onClick={() => setQuestionModalOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSendQuestion} className="space-y-3">
                <textarea
                  rows={4}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Опишите, что именно вызвало затруднение (правило, формула, пример в видео)..."
                  className="w-full p-3 rounded-xl text-xs border outline-none focus:border-brand"
                  style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  autoFocus
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setQuestionModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={!questionText.trim() || questionSent}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-dark transition-all disabled:opacity-40 cursor-pointer flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{questionSent ? 'Отправка...' : 'Отправить'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
