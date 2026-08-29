'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CourseraCertificate } from '@/components/certificate/CourseraCertificate';
import { useLmsStore } from '@/store/useLmsStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Download,
  Share2,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  UserCheck,
  Check,
  Copy,
  Eye,
  X,
  FileCheck
} from 'lucide-react';

export default function CertificatesPage() {
  const { courses, modules, certificates, addToast, studentName } = useLmsStore();
  const [previewCertModal, setPreviewCertModal] = useState<any | null>(null);
  const [shareModalCert, setShareModalCert] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Compute status for all courses
  const courseStatuses = courses.map((course) => {
    const courseModules = modules.filter((m) => m.course_id === course.id);
    const allLessons = courseModules.flatMap((m) => m.lessons);
    const totalLessons = allLessons.length;
    const completedLessons = allLessons.filter((l) => l.status === 'completed').length;
    const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const firstUnlockedLesson = allLessons.find((l) => l.status === 'unlocked') || allLessons[0];

    // Check if there is an uploaded certificate from the mentor for this course
    const uploadedCert = certificates.find((c) => c.course_id === course.id);

    return {
      course,
      totalLessons,
      completedLessons,
      percent,
      firstUnlockedLesson,
      uploadedCert
    };
  });

  // Issued by curator vs in progress
  const issuedList = courseStatuses.filter((item): item is typeof item & { uploadedCert: NonNullable<typeof item.uploadedCert> } => 
    Boolean(item.uploadedCert && item.uploadedCert.status === 'issued')
  );
  const inProgressList = courseStatuses.filter((item) => !item.uploadedCert || item.uploadedCert.status !== 'issued');

  const handleDownload = (cert: any) => {
    addToast('Загрузка начата', `Файл "${cert.file_name}" скачивается.`, 'success');
  };

  const handleCopyLink = (code: string) => {
    navigator.clipboard.writeText(`https://mathalama.edu/verify/${code}`);
    setCopiedLink(true);
    addToast('Ссылка скопирована', 'Ссылка на сертификат скопирована.', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <>
      <div className="flex flex-col min-h-[calc(100vh-2rem)] p-6 md:p-8 space-y-8 max-w-6xl mx-auto w-full">
        
        {/* Header */}
        <div className="border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center space-x-2 text-brand font-bold text-xs uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Сертификаты</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-outfit" style={{ color: 'var(--text-primary)' }}>
            Сертификаты об обучении
          </h1>
          <p className="text-xs sm:text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
            Здесь хранятся ваши сертификаты, выданные куратором после прохождения курсов.
          </p>
        </div>

        {/* Section 1: Issued Certificates (Uploaded by Mentors) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black font-outfit flex items-center space-x-2" style={{ color: 'var(--text-primary)' }}>
              <FileCheck className="w-5 h-5 text-emerald-500" />
              <span>Выданные сертификаты ({issuedList.length})</span>
            </h2>
          </div>

          {issuedList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {issuedList.map(({ course, uploadedCert }) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bento-card p-6 flex flex-col justify-between space-y-5 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent"
                >
                  <div className="space-y-4">
                    {/* Header Badge */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Курс завершён</span>
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {uploadedCert.verification_code}
                      </span>
                    </div>

                    {/* Course Title & Curator */}
                    <div>
                      <h3 className="text-lg font-black font-outfit" style={{ color: 'var(--text-primary)' }}>
                        {course.title}
                      </h3>
                      <div className="flex items-center space-x-1.5 text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                        <UserCheck className="w-3.5 h-3.5 text-brand" />
                        <span>Куратор: <strong className="font-semibold" style={{ color: 'var(--text-primary)' }}>{uploadedCert.curator_name}</strong></span>
                      </div>
                    </div>

                    {/* Curator Comment */}
                    {uploadedCert.curator_comment && (
                      <div className="p-3.5 rounded-xl border text-xs leading-relaxed" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                          Комментарий куратора
                        </span>
                        <p className="text-zinc-700 dark:text-zinc-300">
                          {uploadedCert.curator_comment}
                        </p>
                      </div>
                    )}

                    {/* File Attachment Card */}
                    <div className="p-3.5 rounded-2xl border flex items-center justify-between" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                            {uploadedCert.file_name}
                          </div>
                          <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                            PDF • {uploadedCert.file_size} • Выдан {uploadedCert.issue_date}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                    <button
                      onClick={() => handleDownload(uploadedCert)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Скачать PDF</span>
                    </button>

                    <button
                      onClick={() => setPreviewCertModal(uploadedCert)}
                      className="p-2.5 rounded-xl border hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      title="Предпросмотр информации о сертификате"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setShareModalCert(uploadedCert)}
                      className="p-2.5 rounded-xl border hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                      title="Поделиться ссылкой"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bento-card p-6 text-center space-y-2">
              <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Пока нет выданных сертификатов. Пройдите курс до конца, и куратор загрузит ваш сертификат.
              </p>
            </div>
          )}
        </div>

        {/* Section 2: In-Progress Courses */}
        {inProgressList.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-black font-outfit flex items-center space-x-2" style={{ color: 'var(--text-primary)' }}>
              <Clock className="w-4 h-4 text-brand" />
              <span>В процессе обучения ({inProgressList.length})</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inProgressList.map(({ course, totalLessons, completedLessons, percent, firstUnlockedLesson }) => (
                <div
                  key={course.id}
                  className="bento-card p-6 flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand/10 text-brand">
                        Прогресс {percent}%
                      </span>
                      <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                        {completedLessons} из {totalLessons} уроков
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black font-outfit" style={{ color: 'var(--text-primary)' }}>
                        {course.title}
                      </h3>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        Куратор: <strong className="font-semibold" style={{ color: 'var(--text-primary)' }}>{course.curator_name}</strong>
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <div
                          className="h-full bg-brand rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                        После завершения всех уроков куратор проверит ваши работы и прикрепит файл сертификата.
                      </p>
                    </div>
                  </div>

                  {/* Direct Link to continue course */}
                  <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                    <Link
                      href={`/courses/${course.id}/lessons/${firstUnlockedLesson?.id || 'lesson-1-uuid'}`}
                      className="w-full flex items-center justify-center space-x-2 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                    >
                      <span>Продолжить обучение</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* CERTIFICATE INFO MODAL */}
      <AnimatePresence>
        {previewCertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewCertModal(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-4xl p-6 rounded-3xl border shadow-2xl space-y-5"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-brand" />
                  <span className="text-sm font-black font-outfit" style={{ color: 'var(--text-primary)' }}>
                    {previewCertModal.file_name}
                  </span>
                </div>
                <button
                  onClick={() => setPreviewCertModal(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Document Info Body - Beautiful certificate preview */}
              <div className="w-full overflow-x-auto py-2 scrollbar-thin">
                <div className="min-w-[680px] p-2">
                  <CourseraCertificate
                    data={{
                      id: previewCertModal.id,
                      courseTitle: previewCertModal.course_title,
                      studentName: studentName || 'Иван Смирнов',
                      issueDate: previewCertModal.issue_date,
                      verificationCode: previewCertModal.verification_code,
                      instructorName: previewCertModal.curator_name,
                      instructorTitle: 'Академический куратор курса'
                    }}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={() => setPreviewCertModal(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Закрыть
                </button>
                <button
                  onClick={() => {
                    handleDownload(previewCertModal);
                    setPreviewCertModal(null);
                  }}
                  className="flex items-center space-x-1.5 px-5 py-2 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Скачать PDF</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SHARE MODAL */}
      <AnimatePresence>
        {shareModalCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShareModalCert(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="border rounded-2xl p-6 max-w-md w-full shadow-2xl relative z-10 space-y-4"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-base font-extrabold font-outfit" style={{ color: 'var(--text-primary)' }}>
                  Поделиться сертификатом
                </h3>
                <button
                  onClick={() => setShareModalCert(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Ссылка для подтверждения прохождения курса:
              </p>

              <div className="flex items-center space-x-2 p-2.5 rounded-xl border" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
                <span className="text-xs font-mono truncate flex-1" style={{ color: 'var(--text-primary)' }}>
                  https://mathalama.edu/verify/{shareModalCert.verification_code}
                </span>
                <button
                  onClick={() => handleCopyLink(shareModalCert.verification_code)}
                  className="px-3 py-1.5 bg-brand text-white rounded-lg text-xs font-bold hover:bg-brand-dark transition-all cursor-pointer flex items-center space-x-1"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Скопировано' : 'Копировать'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
