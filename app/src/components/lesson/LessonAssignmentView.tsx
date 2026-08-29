'use client';

import React, { useState } from 'react';
import { useLmsStore } from '../../store/useLmsStore';
import {
  FileText,
  Upload,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCheck,
  Send,
  UserCheck,
  Sparkles,
  Paperclip,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';

interface LessonAssignmentViewProps {
  lesson: any;
  course: any;
}

export const LessonAssignmentView: React.FC<LessonAssignmentViewProps> = ({ lesson, course }) => {
  const { submitPdf, isSubmittingPdf, pdfUploadProgress, addToast } = useLmsStore();
  const assignment = lesson.components?.assignment || { required: true, status: 'not_submitted', file_url: null };

  const [submissionType, setSubmissionType] = useState<'file' | 'text'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [isSubmittingText, setIsSubmittingText] = useState(false);

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    await submitPdf(lesson.id, selectedFile.name);
    setSelectedFile(null);
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textAnswer.trim()) return;
    setIsSubmittingText(true);
    // Simulate submit
    await submitPdf(lesson.id, 'text-submission.pdf');
    setIsSubmittingText(false);
    setTextAnswer('');
  };

  const isApproved = assignment.status === 'approved';
  const isPending = assignment.status === 'pending';

  return (
    <div className="space-y-6">
      {/* 1. Requirements & Task Guidelines */}
      <div className="p-5 rounded-2xl border space-y-4" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <div className="flex items-center space-x-2 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
          <FileText className="w-4 h-4 text-brand" />
          <h3 className="text-sm font-extrabold font-outfit" style={{ color: 'var(--text-primary)' }}>
            Практическое задание и конспект
          </h3>
        </div>

        <div className="space-y-2 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <p className="font-semibold text-zinc-900 dark:text-white">
            Требования к выполнению задания:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>Запишите ключевые формулы, правила или схемы из видеолекции.</li>
            <li>Решите практическое упражнение или переведите текст (в зависимости от предмета).</li>
            <li>Прикрепите фото тетради / скан / PDF или введите решение текстом.</li>
          </ul>
        </div>
      </div>

      {/* 2. Submission Status & Feedback */}
      {isApproved ? (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-300 font-extrabold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <span>Работа проверена и зачтена куратором!</span>
          </div>

          {assignment.feedback && (
            <div className="p-3.5 bg-white/80 dark:bg-zinc-900/80 rounded-xl border border-emerald-500/20 space-y-1.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Комментарий преподавателя ({course?.curator_name || 'Куратор'}):</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                «{assignment.feedback}»
              </p>
            </div>
          )}

          {assignment.file_url && (
            <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 pt-1">
              <span className="flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5" />
                <span>Отправленный файл: homework.pdf</span>
              </span>
              <a
                href={assignment.file_url}
                target="_blank"
                rel="noreferrer"
                className="font-bold underline hover:opacity-80"
              >
                Просмотреть
              </a>
            </div>
          )}
        </div>
      ) : isPending ? (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-300 font-extrabold text-sm">
            <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 animate-pulse" />
            <span>Работа находится на проверке у преподавателя</span>
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Обычно проверка занимает от 15 минут до 2 часов. Как только куратор проверит работу, вы получите уведомление и доступ к следующему уроку.
          </p>
        </div>
      ) : (
        /* Submission Area */
        <div className="p-5 rounded-2xl border space-y-4" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          {/* Submission Mode Switcher */}
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
            <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              Способ сдачи:
            </span>

            <div className="flex rounded-xl p-0.5 border" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={() => setSubmissionType('file')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  submissionType === 'file'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Загрузить файл / фото
              </button>
              <button
                type="button"
                onClick={() => setSubmissionType('text')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  submissionType === 'text'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Ввести текст / ответ
              </button>
            </div>
          </div>

          {submissionType === 'file' ? (
            /* File Upload Mode */
            <div className="space-y-4">
              <div
                className="border-2 border-dashed rounded-2xl p-8 text-center space-y-3 transition-colors hover:border-brand/50 cursor-pointer"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-hover)' }}
                onClick={() => document.getElementById('lesson-file-input')?.click()}
              >
                <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold block" style={{ color: 'var(--text-primary)' }}>
                    Нажмите для выбора файла или перетащите сюда
                  </span>
                  <span className="text-[11px] block mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    PDF, фото тетради (PNG, JPG), Word docx — до 25 МБ
                  </span>
                </div>

                <input
                  type="file"
                  id="lesson-file-input"
                  accept="application/pdf,image/*,.docx,.doc,.txt"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                  }}
                  className="hidden"
                />
              </div>

              {selectedFile && (
                <div className="p-3 rounded-xl border flex items-center justify-between text-xs font-bold" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center space-x-2 truncate">
                    <FileCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="truncate" style={{ color: 'var(--text-primary)' }}>{selectedFile.name}</span>
                    <span className="text-zinc-400 font-mono text-[10px]">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-zinc-400 hover:text-rose-500 cursor-pointer ml-2"
                  >
                    ✕
                  </button>
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
                    <span>Отправка файла куратору на проверку...</span>
                  </div>
                </div>
              )}

              {selectedFile && !isSubmittingPdf && (
                <button
                  type="button"
                  onClick={handleFileUpload}
                  className="w-full py-3 rounded-xl text-xs font-extrabold bg-brand text-white hover:bg-brand-dark transition-all cursor-pointer shadow-md flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Отправить задание преподавателю</span>
                </button>
              )}
            </div>
          ) : (
            /* Text Answer Mode */
            <form onSubmit={handleTextSubmit} className="space-y-3">
              <textarea
                rows={6}
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Введите ваше решение, перевод, формулы или конспект темы..."
                className="w-full p-3.5 rounded-xl text-xs border outline-none focus:border-brand"
                style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />

              <button
                type="submit"
                disabled={!textAnswer.trim() || isSubmittingText}
                className="w-full py-3 rounded-xl text-xs font-extrabold bg-brand text-white hover:bg-brand-dark transition-all disabled:opacity-40 cursor-pointer shadow-md flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmittingText ? 'Отправка...' : 'Отправить конспект на проверку'}</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
