'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLmsStore } from '../../store/useLmsStore';
import {
  LayoutDashboard,
  BookOpen,
  User,
  LogOut,
  Flame,
  Sparkles,
  Trophy,
  BarChart3,
  Bell,
  Settings,
  Award,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { Logo } from './Logo';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isAuthenticated, logout, streak, leaderboard, notifications, theme, toggleTheme } = useLmsStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const currentUser = leaderboard.find((u) => u.isCurrentUser);
  const totalXP = currentUser?.xp_score || 1200;
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Protect route
  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [isMounted, isAuthenticated, router]);

  // Show loading spinner until mounted to avoid hydration mismatch
  if (!isMounted || !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold animate-pulse" style={{ color: 'var(--text-secondary)' }}>Проверка авторизации...</span>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Дашборд', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Мои Курсы', path: '/courses', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'Аналитика', path: '/analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'Уведомления', path: '/notifications', icon: <Bell className="w-5 h-5" />, badge: unreadCount },
    { name: 'Сертификаты', path: '/certificates', icon: <Award className="w-5 h-5" /> },
    { name: 'Профиль', path: '/profile', icon: <User className="w-5 h-5" /> },
    { name: 'Настройки', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-between">
          <Logo size="md" />
          {/* Mobile close */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-lg cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => {
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold relative transition-all cursor-pointer ${
                  isActive ? 'text-brand' : 'hover:opacity-80'
                }`}
                style={{ color: isActive ? undefined : 'var(--text-secondary)' }}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActiveBg"
                    className="absolute inset-0 bg-brand-light/60 border border-brand/10 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <div className="flex items-center space-x-3.5 relative z-10">
                  <span className={isActive ? 'text-brand' : ''} style={{ color: isActive ? undefined : 'var(--text-tertiary)' }}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </div>
                {item.badge && item.badge > 0 && (
                  <span className="relative z-10 w-5 h-5 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Theme + Logout */}
      <div className="space-y-2 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center space-x-3.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer hover:opacity-80"
          style={{ color: 'var(--text-secondary)' }}
        >
          {theme === 'light' ? <Moon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} /> : <Sun className="w-5 h-5 text-amber-500" />}
          <span>{theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}</span>
        </button>

        <button
          onClick={() => {
            logout();
            router.push('/login');
          }}
          className="w-full flex items-center space-x-3.5 px-4 py-2.5 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50/50 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5 text-rose-400" />
          <span>Выйти</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen" style={{ background: 'var(--background)' }}>
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4" style={{ background: 'var(--sidebar-bg)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-xl cursor-pointer" style={{ color: 'var(--text-primary)' }}>
          <Menu className="w-6 h-6" />
        </button>
        <Logo size="sm" />
        <div className="relative">
          <button onClick={() => setBellOpen(!bellOpen)} className="p-2 rounded-xl cursor-pointer" style={{ color: 'var(--text-primary)' }}>
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="fixed left-0 top-0 h-full w-72 z-50 p-6 md:hidden overflow-y-auto"
              style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)' }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col justify-between p-6 flex-shrink-0" style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)' }}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-x-hidden min-h-screen">
        {children}
      </main>
    </div>
  );
};
