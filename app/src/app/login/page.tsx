'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLmsStore } from '../../store/useLmsStore';
import { Sparkles, Key, Mail, AlertTriangle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="flex min-h-screen items-center justify-center bg-[#ffffff] relative overflow-hidden px-4">
      {/* Decorative premium gradients */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-brand-light rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-emerald-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white border border-zinc-150 p-8 rounded-bento shadow-bento relative z-10"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-950 font-outfit tracking-tight">Mathalama<span className="text-brand">Edu</span></h1>
            <p className="text-xs text-zinc-400 font-semibold mt-1">Панель авторизации студента</p>
          </div>
        </div>

        {/* Lockout Warning Banner */}
        {isLocked && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl flex items-start space-x-3"
          >
            <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-extrabold block">Превышен лимит запросов (429)</span>
              <span className="block mt-1">Слишком много неудачных попыток входа. Возможность входа заблокирована на {countdown} сек.</span>
            </div>
          </motion.div>
        )}

        {/* Regular error message */}
        {errorMsg && !isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-3.5 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl flex items-start space-x-2.5 text-xs font-semibold"
          >
            <AlertTriangle className="w-4.5 h-4.5 text-amber-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 tracking-wide block">Email адрес</label>
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
                className="w-full pl-10 pr-4 py-3 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-brand focus:bg-white transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 tracking-wide block">Пароль</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Key className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                disabled={isLocked || loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-brand focus:bg-white transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLocked || loading}
            className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand/10 transition-all active:scale-98 disabled:opacity-50 disabled:scale-100 flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Войти в систему</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
          <p className="text-[10px] text-zinc-400 font-semibold leading-normal">
            Используйте демонстрационные данные для входа:<br/>
            <strong className="text-zinc-600 block mt-1 font-bold">Email: student@example.com &nbsp;&bull;&nbsp; Пароль: password</strong>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
