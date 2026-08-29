'use client';

import React, { useState } from 'react';
import { useLmsStore } from '@/store/useLmsStore';
import { motion } from 'framer-motion';
import { Settings, Sun, Moon, Globe, Bell, MessageCircle, Lock, Check, Smartphone } from 'lucide-react';

export default function SettingsPage() {
  const { theme, toggleTheme } = useLmsStore();

  const [language, setLanguage] = useState('ru');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [telegramNotifs, setTelegramNotifs] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handlePasswordSave = () => {
    if (oldPassword && newPassword.length >= 6) {
      setPasswordSaved(true);
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordSaved(false), 3000);
    }
  };

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
        enabled ? 'bg-brand' : 'bg-zinc-300 dark:bg-zinc-700'
      }`}
    >
      <motion.div
        animate={{ x: enabled ? 22 : 2 }}
        transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-2rem)] p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-outfit" style={{ color: 'var(--text-primary)' }}>
            Настройки
          </h1>
          <p className="text-xs sm:text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
            Управление параметрами интерфейса, темой и уведомлениями.
          </p>
        </div>

        <div className="space-y-6 flex-1">
          {/* Appearance */}
          <div className="bento-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              <h3 className="text-sm sm:text-base font-extrabold font-outfit" style={{ color: 'var(--text-primary)' }}>Оформление и тема</h3>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
              <div>
                <p className="text-xs sm:text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Тёмная тема</p>
                <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Комфортный режим для вечерних занятий</p>
              </div>
              <Toggle enabled={theme === 'dark'} onChange={toggleTheme} />
            </div>
          </div>

          {/* Language */}
          <div className="bento-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <Globe className="w-4 h-4 text-brand" />
              <h3 className="text-sm sm:text-base font-extrabold font-outfit" style={{ color: 'var(--text-primary)' }}>Язык платформы</h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { code: 'ru', label: 'Русский', flag: 'RU' },
                { code: 'kz', label: 'Қазақша', flag: 'KZ' },
                { code: 'en', label: 'English', flag: 'EN' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                    language === lang.code
                      ? 'border-brand bg-brand/10 text-brand ring-1 ring-brand/30 font-bold'
                      : 'hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                  style={{
                    background: language === lang.code ? undefined : 'var(--surface-hover)',
                    borderColor: language === lang.code ? undefined : 'var(--border)'
                  }}
                >
                  <span className="text-xs font-black block mb-0.5" style={{ color: language === lang.code ? undefined : 'var(--text-tertiary)' }}>{lang.flag}</span>
                  <span className="text-xs block" style={{ color: language === lang.code ? undefined : 'var(--text-primary)' }}>
                    {lang.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bento-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <Bell className="w-4 h-4 text-brand" />
              <h3 className="text-sm sm:text-base font-extrabold font-outfit" style={{ color: 'var(--text-primary)' }}>Каналы уведомлений</h3>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Email уведомления', desc: 'Оповещения о проверке домашних заданий куратором', enabled: emailNotifs, toggle: () => setEmailNotifs(!emailNotifs) },
                { label: 'Push-уведомления', desc: 'Всплывающие напоминания о дедлайнах', enabled: pushNotifs, toggle: () => setPushNotifs(!pushNotifs) },
                { label: 'Telegram-бот', desc: 'Получать мгновенные оповещения в Telegram', enabled: telegramNotifs, toggle: () => setTelegramNotifs(!telegramNotifs) },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
                  <div>
                    <p className="text-xs sm:text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                  </div>
                  <Toggle enabled={item.enabled} onChange={item.toggle} />
                </div>
              ))}
            </div>
          </div>

          {/* Password */}
          <div className="bento-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <Lock className="w-4 h-4 text-brand" />
              <h3 className="text-sm sm:text-base font-extrabold font-outfit" style={{ color: 'var(--text-primary)' }}>Безопасность и пароль</h3>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-secondary)' }}>Текущий пароль</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none focus:border-brand transition-all"
                  style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-secondary)' }}>Новый пароль</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none focus:border-brand transition-all"
                  style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <button
              onClick={handlePasswordSave}
              disabled={!oldPassword || newPassword.length < 6}
              className="w-full bg-brand hover:bg-brand-dark text-white py-3 rounded-xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center space-x-2 shadow-md"
            >
              {passwordSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Пароль успешно обновлён!</span>
                </>
              ) : (
                <span>Сохранить новый пароль</span>
              )}
            </button>
          </div>
        </div>
      </div>
  );
}
