'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
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
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
        enabled ? 'bg-brand' : 'bg-zinc-300'
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
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-8 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit" style={{ color: 'var(--text-primary)' }}>
            Настройки
          </h1>
          <p className="text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
            Управление предпочтениями и конфигурацией
          </p>
        </div>

        {/* Appearance */}
        <div className="bento-card p-6 space-y-5">
          <div className="flex items-center space-x-2">
            {theme === 'light' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-400" />}
            <h3 className="text-lg font-bold font-outfit" style={{ color: 'var(--text-primary)' }}>Внешний вид</h3>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Тёмная тема</p>
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Переключить между светлым и тёмным оформлением</p>
            </div>
            <Toggle enabled={theme === 'dark'} onChange={toggleTheme} />
          </div>
        </div>

        {/* Language */}
        <div className="bento-card p-6 space-y-5">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-brand" />
            <h3 className="text-lg font-bold font-outfit" style={{ color: 'var(--text-primary)' }}>Язык интерфейса</h3>
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
                className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                  language === lang.code
                    ? 'border-brand bg-brand-light ring-1 ring-brand/20'
                    : ''
                }`}
                style={language !== lang.code ? { borderColor: 'var(--border)' } : undefined}
              >
                <span className="text-sm font-bold block mb-1" style={{ color: 'var(--text-tertiary)' }}>{lang.flag}</span>
                <span className={`text-xs font-bold mt-1 block ${language === lang.code ? 'text-brand' : ''}`} style={language !== lang.code ? { color: 'var(--text-secondary)' } : undefined}>
                  {lang.label}
                </span>
              </button>
            ))}
          </div>
          <p className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
            * Переключение языка доступно после интеграции с бэкендом (v2)
          </p>
        </div>

        {/* Notifications */}
        <div className="bento-card p-6 space-y-5">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-brand" />
            <h3 className="text-lg font-bold font-outfit" style={{ color: 'var(--text-primary)' }}>Уведомления</h3>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Email уведомления', desc: 'Оповещения о проверке ДЗ и новых уроках', enabled: emailNotifs, toggle: () => setEmailNotifs(!emailNotifs) },
              { label: 'Push-уведомления', desc: 'Уведомления в браузере', enabled: pushNotifs, toggle: () => setPushNotifs(!pushNotifs) },
              { label: 'Telegram-бот', desc: 'Получать оповещения через Telegram', enabled: telegramNotifs, toggle: () => setTelegramNotifs(!telegramNotifs) },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{item.desc}</p>
                </div>
                <Toggle enabled={item.enabled} onChange={item.toggle} />
              </div>
            ))}
          </div>

          {/* Telegram QR mock */}
          {telegramNotifs && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-2xl text-center space-y-3"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-center space-x-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Привязка Telegram</span>
              </div>
              <div className="w-32 h-32 mx-auto rounded-xl flex items-center justify-center" style={{ background: 'var(--border)' }}>
                <Smartphone className="w-12 h-12" style={{ color: 'var(--text-secondary)' }} />
              </div>
              <p className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Отсканируйте QR-код в боте @MathalamaEduBot (мок)
              </p>
            </motion.div>
          )}
        </div>

        {/* Password */}
        <div className="bento-card p-6 space-y-5">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-brand" />
            <h3 className="text-lg font-bold font-outfit" style={{ color: 'var(--text-primary)' }}>Безопасность</h3>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold block" style={{ color: 'var(--text-secondary)' }}>Текущий пароль</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-brand transition-all"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold block" style={{ color: 'var(--text-secondary)' }}>Новый пароль</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-brand transition-all"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <button
            onClick={handlePasswordSave}
            disabled={!oldPassword || newPassword.length < 6}
            className="w-full bg-brand hover:bg-brand-dark text-white py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center space-x-2"
          >
            {passwordSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Пароль обновлён!</span>
              </>
            ) : (
              <span>Сменить пароль</span>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
