'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLmsStore } from '../../store/useLmsStore';
import { Key, Mail, AlertTriangle, ShieldAlert, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';

export default function LoginPage() {
  const { login, isAuthenticated, lockoutTime } = useLmsStore();
  const router = useRouter();

  const [email, setEmail] = useState('student@example.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTime) {
      const updateTimer = () => {
        const remaining = Math.ceil((lockoutTime - Date.now()) / 1000);
        if (remaining <= 0) {
          setCountdown(0);
        } else {
          setCountdown(remaining);
          setTimeout(updateTimer, 1000);
        }
      };
      updateTimer();
    }
  }, [lockoutTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg('');

    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Ошибка входа');
      if (res.retryAfter) {
        setCountdown(res.retryAfter);
      }
    } else {
      router.push('/dashboard');
    }
  };

  const isLocked = countdown > 0;

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Decorative gradient glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bento-card p-8 relative z-10 space-y-6"
      >
        {/* Brand Header with Logo */}
        <div className="flex flex-col items-center text-center space-y-2 pb-2">
          <Logo size="lg" />
          <p className="text-xs font-semibold pt-1" style={{ color: 'var(--text-secondary)' }}>
            Вход в персональный кабинет студента
          </p>
        </div>

        {/* Lockout Warning Banner */}
        {isLocked && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 rounded-2xl flex items-start space-x-3 text-xs"
          >
            <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block">Слишком много попыток входа</span>
              <span className="block mt-1">Возможность входа заблокирована на {countdown} сек.</span>
            </div>
          </motion.div>
        )}

        {/* Regular error message */}
        {errorMsg && !isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-xl flex items-start space-x-2.5 text-xs font-semibold"
          >
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold block" style={{ color: 'var(--text-secondary)' }}>Email адрес</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                disabled={isLocked || loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-xs sm:text-sm border outline-none focus:border-brand transition-all disabled:opacity-50"
                style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold block" style={{ color: 'var(--text-secondary)' }}>Пароль</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                disabled={isLocked || loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-xs sm:text-sm border outline-none focus:border-brand transition-all disabled:opacity-50"
                style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLocked || loading}
            className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand/20 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Войти в личный кабинет</span>
            )}
          </button>
        </form>

        <p className="text-[11px] text-center" style={{ color: 'var(--text-tertiary)' }}>
          Демо-доступ: <strong style={{ color: 'var(--text-secondary)' }}>student@example.com / password</strong>
        </p>

      </motion.div>
    </div>
  );
}
