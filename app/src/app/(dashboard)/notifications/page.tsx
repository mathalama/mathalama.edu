'use client';

import React from 'react';
import { useLmsStore } from '@/store/useLmsStore';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Circle, CheckCircle, AlertTriangle, MessageSquare, Info } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useLmsStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatRelativeTime = (timestamp: string) => {
    const now = Date.now();
    const diff = now - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes} мин назад`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч назад`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} д назад`;
    return new Date(timestamp).toLocaleDateString('ru-RU');
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success': return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'warning': return 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400';
      case 'social': return 'border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400';
      default: return 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case 'social': return <MessageSquare className="w-5 h-5 text-indigo-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-2rem)] p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-outfit" style={{ color: 'var(--text-primary)' }}>
              Уведомления
            </h1>
            <p className="text-xs sm:text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
              {unreadCount > 0 ? `${unreadCount} непрочитанных сообщений` : 'Все уведомления прочитаны'}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              <CheckCheck className="w-4 h-4" />
              <span>Прочитать всё</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-3 flex-1"
        >
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              variants={itemVariants}
              onClick={() => !notif.read && markNotificationRead(notif.id)}
              className={`bento-card p-4 flex items-start space-x-4 cursor-pointer transition-all ${
                !notif.read ? 'ring-1 ring-brand/30 border-brand/30' : ''
              }`}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${getTypeStyles(notif.type)}`}>
                {getNotificationIcon(notif.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-extrabold font-outfit truncate" style={{ color: 'var(--text-primary)' }}>
                    {notif.title}
                  </h4>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                      {formatRelativeTime(notif.timestamp)}
                    </span>
                    {!notif.read && (
                      <Circle className="w-2 h-2 fill-brand text-brand flex-shrink-0" />
                    )}
                  </div>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {notif.message}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {notifications.length === 0 && (
          <div className="text-center py-20 space-y-3">
            <Bell className="w-12 h-12 mx-auto" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              У вас пока нет уведомлений
            </p>
          </div>
        )}
      </div>
  );
}
