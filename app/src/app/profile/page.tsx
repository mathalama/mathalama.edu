'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { useLmsStore } from '@/store/useLmsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, ShieldAlert, RefreshCw, Trash2, Calendar, FileText, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const { studentName, deleteProfile, resetDatabase, logout } = useLmsStore();
  const router = useRouter();

  const [showGdprModal, setShowGdprModal] = useState(false);
  const [gdprChecked, setGdprChecked] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivatedDate, setDeactivatedDate] = useState<string | null>(null);

  const handleResetDB = () => {
    if (confirm('Сбросить базу данных к исходному состоянию? Все заработанные XP и загруженные конспекты будут сброшены.')) {
      resetDatabase();
    }
  };

  const handleGdprDelete = async () => {
    if (!gdprChecked) return;
    setIsDeactivating(true);

    try {
      const deletionScheduledDate = await deleteProfile();
      setDeactivatedDate(deletionScheduledDate);
      
      // Delay redirect to login to show the success deactivation screen
      setTimeout(() => {
        setIsDeactivating(false);
        setShowGdprModal(false);
        router.push('/login');
      }, 4000);
    } catch (error) {
      console.error(error);
      setIsDeactivating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-8">
        
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 font-outfit">Профиль студента</h1>
          <p className="text-sm text-zinc-400 mt-1 font-medium">Управление учетной записью, правами GDPR и системными настройками.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Main User Info Bento */}
          <div className="lg:col-span-2 bento-card space-y-6">
            <h3 className="text-lg font-black text-zinc-900 font-outfit border-b border-zinc-50 pb-3">Личные данные</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">ФИО студента</span>
                <div className="flex items-center space-x-2.5 p-3.5 bg-zinc-50/50 border border-zinc-100 rounded-xl">
                  <User className="w-5 h-5 text-zinc-400" />
                  <span className="text-xs font-bold text-zinc-800">{studentName}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Email адрес</span>
                <div className="flex items-center space-x-2.5 p-3.5 bg-zinc-50/50 border border-zinc-100 rounded-xl">
                  <Mail className="w-5 h-5 text-zinc-400" />
                  <span className="text-xs font-bold text-zinc-800">student@example.com</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Роль в системе</span>
                <div className="flex items-center space-x-2.5 p-3.5 bg-zinc-50/50 border border-zinc-100 rounded-xl">
                  <Shield className="w-5 h-5 text-brand" />
                  <span className="text-xs font-bold text-zinc-800">Студент</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Группа (когорта)</span>
                <div className="flex items-center space-x-2.5 p-3.5 bg-zinc-50/50 border border-zinc-100 rounded-xl">
                  <Calendar className="w-5 h-5 text-zinc-400" />
                  <span className="text-xs font-bold text-zinc-800">Поток — Весна 2026</span>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Actions / Reset DB */}
          <div className="lg:col-span-1 flex flex-col gap-6 md:gap-8">
            {/* Developer Testing Console */}
            <div className="bento-card space-y-4">
              <h3 className="text-sm font-black text-zinc-900 font-outfit uppercase tracking-wider text-zinc-400">Инструменты отладки</h3>
              <p className="text-[10px] text-zinc-500 leading-normal">
                Поскольку фронтенд работает на Mock-базе данных в LocalStorage, вы можете сбросить весь прогресс (XP, пройденные тесты и статус сдачи видео) к стартовым параметрам одной кнопкой.
              </p>
              <button
                onClick={handleResetDB}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Сбросить Mock БД в исходное состояние</span>
              </button>
            </div>

            {/* GDPR Terminate Account */}
            <div className="bento-card space-y-4 border-rose-100/50 bg-rose-50/5">
              <h3 className="text-sm font-black text-rose-500 font-outfit uppercase tracking-wider">Приватность и GDPR</h3>
              <p className="text-[10px] text-zinc-500 leading-normal">
                Право на забвение в 1 клик. Ваша учетная запись будет временно деактивирована, а все персональные данные и загруженные файлы PDF удалены навсегда по истечении 14-дневного срока.
              </p>
              <button
                onClick={() => setShowGdprModal(true)}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-rose-200"
              >
                <Trash2 className="w-4 h-4" />
                <span>Стереть мои данные (Право на забвение)</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* GDPR TWO-PHASE MODAL */}
      <AnimatePresence>
        {showGdprModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeactivating && setShowGdprModal(false)}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-lg bg-white border border-zinc-150 p-6 md:p-8 rounded-bento shadow-2xl relative z-10 space-y-6"
            >
              
              {!deactivatedDate ? (
                // Phase 1 & 2 Warning Form
                <>
                  <div className="flex items-center space-x-3 text-rose-500">
                    <ShieldAlert className="w-8 h-8" />
                    <div>
                      <h4 className="text-lg font-black text-zinc-950 font-outfit">Запрос на удаление аккаунта (GDPR)</h4>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">В соответствии с Общим регламентом по защите данных</p>
                    </div>
                  </div>

                  <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 space-y-3.5 text-xs text-rose-900 leading-relaxed">
                    <span className="font-extrabold block">Двухфазный конвейер анонимизации:</span>
                    
                    <div className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Фаза 1 (Soft Lock)</strong>: Учетная запись деактивируется прямо сейчас. Ваши JWT-токены аннулируются, доступ блокируется на 14 дней. В течение этого срока вы можете восстановить доступ через службу поддержки.</span>
                    </div>

                    <div className="flex items-start space-x-2">
                      <FileText className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Фаза 2 (Hard Delete)</strong>: Через 14 дней все ваши рукописные конспекты будут <strong>физически удалены из хранилища MinIO S3</strong>, а email, ФИО и логины в СУБД будут подвергнуты необратимому SHA-256 хэшированию.</span>
                    </div>
                  </div>

                  {/* GDPR confirmation check */}
                  <div className="flex items-start space-x-3 p-1">
                    <input
                      type="checkbox"
                      id="gdpr-agree"
                      disabled={isDeactivating}
                      checked={gdprChecked}
                      onChange={(e) => setGdprChecked(e.target.checked)}
                      className="w-4.5 h-4.5 text-brand rounded border-zinc-300 focus:ring-brand mt-0.5 cursor-pointer"
                    />
                    <label htmlFor="gdpr-agree" className="text-xs text-zinc-500 font-medium select-none cursor-pointer">
                      Я подтверждаю, что ознакомился с двухфазным конвейером анонимизации и хочу деактивировать свой профиль прямо сейчас.
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2 border-t border-zinc-100">
                    <button
                      disabled={isDeactivating}
                      onClick={() => setShowGdprModal(false)}
                      className="px-4 py-2.5 border border-zinc-200 text-xs font-bold text-zinc-600 rounded-xl hover:bg-zinc-50 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      Отмена
                    </button>
                    <button
                      disabled={!gdprChecked || isDeactivating}
                      onClick={handleGdprDelete}
                      className="px-5 py-2.5 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 disabled:opacity-40 disabled:hover:bg-rose-600 transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-rose-200"
                    >
                      {isDeactivating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Деактивация аккаунта...</span>
                        </>
                      ) : (
                        <span>Подтвердить удаление</span>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                // Soft Lock Scheduled Success Screen
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6 space-y-4"
                >
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-zinc-950 font-outfit">Аккаунт успешно деактивирован</h4>
                    <p className="text-xs text-zinc-400 font-semibold mt-1">Инициирована Фаза 1 GDPR (Soft Lock)</p>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-150 p-4 rounded-2xl max-w-sm mx-auto text-xs text-zinc-500 space-y-1.5 leading-relaxed">
                    <span className="block font-bold text-zinc-700">Окончательное удаление запланировано на:</span>
                    <strong className="block text-zinc-800 text-sm font-extrabold tabular-nums">06.06.2026, 21:58</strong>
                    <span className="block mt-1 text-[10px]">Воркеры очистят S3 и анонимизируют СУБД. Выход из системы...</span>
                  </div>
                </motion.div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
