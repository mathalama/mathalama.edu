'use client';

import React from 'react';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { useLmsStore } from '@/store/useLmsStore';
import { motion } from 'framer-motion';
import { Award, Download, Share2, Lock, Sparkles } from 'lucide-react';

export default function CertificatesPage() {
  const { certificates, modules } = useLmsStore();

  // Calculate actual course progress
  let totalLessons = 0;
  let completedLessons = 0;
  modules.forEach((mod) => {
    mod.lessons.forEach((les) => {
      totalLessons++;
      if (les.status === 'completed') completedLessons++;
    });
  });
  const completionPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isComplete = completionPercent >= 100;

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-8 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit" style={{ color: 'var(--text-primary)' }}>
            Сертификаты
          </h1>
          <p className="text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
            Подтверждения вашего обучения и профессионального развития
          </p>
        </div>

        {certificates.map((cert) => (
          <div key={cert.id} className="space-y-6">
            {/* Certificate Visual */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative overflow-hidden rounded-bento border ${
                isComplete
                  ? 'border-amber-200 shadow-lg shadow-amber-100/50'
                  : 'border-zinc-200 opacity-80'
              }`}
            >
              {/* Certificate Design */}
              <div className={`p-8 md:p-14 text-center relative ${
                isComplete
                  ? 'bg-gradient-to-br from-amber-50 via-white to-amber-50/50'
                  : ''
              }`} style={!isComplete ? { background: 'var(--surface)' } : undefined}>

                {/* Decorative elements */}
                {isComplete && (
                  <>
                    <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-amber-300/30 rounded-tl-bento" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-amber-300/30 rounded-br-bento" />
                  </>
                )}

                {/* Lock overlay for incomplete */}
                {!isComplete && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="text-center space-y-3 p-6 rounded-2xl backdrop-blur-sm" style={{ background: 'var(--surface)' }}>
                      <Lock className="w-10 h-10 mx-auto" style={{ color: 'var(--text-tertiary)' }} />
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        Курс ещё не завершён
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Осталось {totalLessons - completedLessons} из {totalLessons} уроков
                      </p>
                    </div>
                  </div>
                )}

                <div className={`space-y-6 ${!isComplete ? 'blur-sm opacity-60 pointer-events-none' : ''}`}>
                  {/* Top badge */}
                  <div className="flex items-center justify-center space-x-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-[0.2em]">
                      Сертификат об обучении
                    </span>
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>

                  {/* Platform name */}
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black font-outfit text-zinc-900">
                      Mathalama<span className="text-brand">Edu</span>
                    </h2>
                  </div>

                  {/* Divider */}
                  <div className="w-24 h-0.5 bg-amber-300 mx-auto rounded-full" />

                  {/* Content */}
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                      Настоящим подтверждается, что
                    </p>
                    <h3 className="text-3xl md:text-4xl font-black text-zinc-900 font-outfit">
                      {cert.studentName}
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                      успешно завершил(а) курс
                    </p>
                    <h4 className="text-xl font-bold text-brand font-outfit">
                      «{cert.courseTitle}»
                    </h4>
                  </div>

                  {/* Details */}
                  <div className="flex items-center justify-center space-x-8 text-xs text-zinc-500">
                    <div>
                      <span className="block font-bold text-zinc-700">Дата выдачи</span>
                      <span>{isComplete ? new Date().toLocaleDateString('ru-RU') : '—'}</span>
                    </div>
                    <div>
                      <span className="block font-bold text-zinc-700">Код верификации</span>
                      <span className="font-mono text-[10px]">{cert.verificationCode}</span>
                    </div>
                  </div>

                  {/* Seal */}
                  <div className="flex items-center justify-center pt-4">
                    <div className="w-20 h-20 border-2 border-amber-300 rounded-full flex items-center justify-center">
                      <Award className="w-10 h-10 text-amber-500" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Progress or Actions */}
            {isComplete ? (
              <div className="flex items-center justify-center gap-4">
                <button className="flex items-center space-x-2 px-6 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm">
                  <Download className="w-4 h-4" />
                  <span>Скачать PDF</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://mathalama.edu/verify/${cert.verificationCode}`);
                  }}
                  className="flex items-center space-x-2 px-6 py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer hover:opacity-80"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  <Share2 className="w-4 h-4" />
                  <span>Поделиться</span>
                </button>
              </div>
            ) : (
              <div className="bento-card p-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Прогресс к сертификату</span>
                  <span className="font-bold text-brand">{completionPercent}%</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-brand to-indigo-500 rounded-full"
                  />
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Завершите все {totalLessons} уроков курса, чтобы получить сертификат с QR-кодом верификации.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
