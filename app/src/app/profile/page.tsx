'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { useLmsStore } from '@/store/useLmsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Globe, 
  FileText, 
  Bell, 
  Shield, 
  RefreshCw, 
  Trash2, 
  Save, 
  Smile, 
  ShieldAlert,
  GraduationCap,
  Users
} from 'lucide-react';

// Custom Premium Styled DatePicker Component
function CustomDatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const parsedDate = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(isNaN(parsedDate.getTime()) ? new Date().getFullYear() : parsedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(isNaN(parsedDate.getTime()) ? new Date().getMonth() : parsedDate.getMonth());

  useEffect(() => {
    if (value && isOpen) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value, isOpen]);

  const handleSelectDay = (day: number, month: number, year: number) => {
    const formattedMonth = (month + 1).toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    onChange(`${year}-${formattedMonth}-${formattedDay}`);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const displayValue = () => {
    if (!value) return 'Не указан';
    const d = new Date(value);
    if (isNaN(d.getTime())) return 'Не указан';
    const dd = d.getDate().toString().padStart(2, '0');
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  };

  const MONTHS_RU = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  const DAYS_RU = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

  const currentYear = new Date().getFullYear();
  const YEARS = Array.from({ length: currentYear - 1950 + 2 }, (_, i) => currentYear - i);

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => {
    const day = new Date(y, m, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  
  const days = [];
  
  const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
  const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false
    });
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      month: viewMonth,
      year: viewYear,
      isCurrentMonth: true
    });
  }
  
  const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
  let nextDaysCount = 1;
  while (days.length < 42) {
    days.push({
      day: nextDaysCount++,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false
    });
  }

  const prevMonthAction = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonthAction = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const isSelected = (d: number, m: number, y: number) => {
    if (!value) return false;
    const sel = new Date(value);
    return !isNaN(sel.getTime()) && sel.getDate() === d && sel.getMonth() === m && sel.getFullYear() === y;
  };

  const isToday = (d: number, m: number, y: number) => {
    const today = new Date();
    return today.getDate() === d && today.getMonth() === m && today.getFullYear() === y;
  };

  return (
    <>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 px-3 py-2 bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl transition-all cursor-pointer select-none"
      >
        <Calendar className="w-4 h-4 text-zinc-400 flex-shrink-0" />
        <span className="w-full text-xs font-bold text-zinc-800">{displayValue()}</span>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div 
            className="absolute left-0 mt-2 w-72 bg-white border border-zinc-150 rounded-2xl p-4 shadow-xl z-40 space-y-3.5"
            style={{ top: '100%' }}
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <button 
                type="button"
                onClick={prevMonthAction} 
                className="p-1 px-2.5 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-850 text-xs font-extrabold rounded-lg transition-colors cursor-pointer"
              >
                &larr;
              </button>
              
              <div className="flex items-center space-x-1">
                <select 
                  value={viewMonth} 
                  onChange={(e) => setViewMonth(parseInt(e.target.value))}
                  className="bg-transparent border-none outline-none cursor-pointer hover:text-brand font-extrabold text-xs p-1 rounded focus:ring-0 text-zinc-700"
                >
                  {MONTHS_RU.map((m, idx) => <option key={idx} value={idx}>{m}</option>)}
                </select>
                
                <select 
                  value={viewYear} 
                  onChange={(e) => setViewYear(parseInt(e.target.value))}
                  className="bg-transparent border-none outline-none cursor-pointer hover:text-brand font-extrabold text-xs p-1 rounded focus:ring-0 text-zinc-700"
                >
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <button 
                type="button"
                onClick={nextMonthAction} 
                className="p-1 px-2.5 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-850 text-xs font-extrabold rounded-lg transition-colors cursor-pointer"
              >
                &rarr;
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {DAYS_RU.map((d, i) => (
                <span 
                  key={i} 
                  className={`text-[10px] font-black uppercase tracking-wider ${
                    i === 5 || i === 6 ? 'text-rose-500' : 'text-zinc-400'
                  }`}
                >
                  {d}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {days.map((item, idx) => {
                const selected = isSelected(item.day, item.month, item.year);
                const today = isToday(item.day, item.month, item.year);
                
                let dayStyle = 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900';
                if (!item.isCurrentMonth) {
                  dayStyle = 'text-zinc-350 hover:bg-zinc-50';
                }
                if (today) {
                  dayStyle = 'border border-brand text-brand hover:bg-brand-light/30 font-extrabold';
                }
                if (selected) {
                  dayStyle = 'bg-brand text-white hover:bg-brand font-extrabold shadow-sm';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDay(item.day, item.month, item.year)}
                    className={`h-7 w-7 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer mx-auto ${dayStyle}`}
                  >
                    {item.day}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={handleClear}
                className="text-[10px] font-black text-rose-500 hover:text-rose-605 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
              >
                Очистить
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-black text-zinc-500 hover:text-zinc-700 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 transition-all cursor-pointer"
              >
                Закрыть
              </button>
            </div>

          </div>
        </>
      )}
    </>
  );
}

export default function ProfilePage() {
  const { 
    studentName, 
    studentEmail, 
    studentPhone,
    studentGender,
    studentBirthday,
    studentLanguage,
    studentAbout,
    studentSubscribeStatus,
    updateProfile, 
    deleteProfile, 
    resetDatabase, 
    logout 
  } = useLmsStore();
  const router = useRouter();

  // Local form states
  const [name, setName] = useState(studentName);
  const [email, setEmail] = useState(studentEmail);
  const [phone, setPhone] = useState(studentPhone);
  const [gender, setGender] = useState(studentGender);
  const [birthday, setBirthday] = useState(studentBirthday);
  const [language, setLanguage] = useState(studentLanguage);
  const [about, setAbout] = useState(studentAbout);
  const [subscribeStatus, setSubscribeStatus] = useState(studentSubscribeStatus);

  const [showGdprModal, setShowGdprModal] = useState(false);
  const [gdprChecked, setGdprChecked] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivatedDate, setDeactivatedDate] = useState<string | null>(null);

  // Sync state with store updates (e.g. database resets)
  useEffect(() => {
    setName(studentName);
    setEmail(studentEmail);
    setPhone(studentPhone);
    setGender(studentGender);
    setBirthday(studentBirthday);
    setLanguage(studentLanguage);
    setAbout(studentAbout);
    setSubscribeStatus(studentSubscribeStatus);
  }, [
    studentName, 
    studentEmail, 
    studentPhone,
    studentGender,
    studentBirthday,
    studentLanguage,
    studentAbout,
    studentSubscribeStatus
  ]);

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

  const handleSave = () => {
    updateProfile(name, email, phone, gender, birthday, language, about, subscribeStatus);
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-8 w-full">
        
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 font-outfit">Профиль студента</h1>
          <p className="text-sm text-zinc-400 mt-1 font-medium">Управление личной информацией и академическими данными.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Main User Info Bento */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Editable Personal Info */}
            <div className="bento-card space-y-6">
              <h3 className="text-lg font-black text-zinc-900 font-outfit border-b border-zinc-50 pb-3">Личные данные</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* ФИО студента */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">ФИО студента</span>
                  <div className="flex items-center space-x-2.5 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus-within:border-brand focus-within:bg-white transition-all">
                    <User className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs font-bold text-zinc-800 bg-transparent border-none outline-none focus:ring-0 p-0"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Email адрес</span>
                  <div className="flex items-center space-x-2.5 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus-within:border-brand focus-within:bg-white transition-all">
                    <Mail className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs font-bold text-zinc-800 bg-transparent border-none outline-none focus:ring-0 p-0"
                    />
                  </div>
                </div>

                {/* Номер */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Номер телефона</span>
                  <div className="flex items-center space-x-2.5 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus-within:border-brand focus-within:bg-white transition-all">
                    <Phone className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+7 (777) 123-45-67"
                      className="w-full text-xs font-bold text-zinc-800 bg-transparent border-none outline-none focus:ring-0 p-0"
                    />
                  </div>
                </div>

                {/* Пол */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Пол</span>
                  <div className="flex items-center space-x-2.5 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus-within:border-brand focus-within:bg-white transition-all">
                    <Smile className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full text-xs font-bold text-zinc-800 bg-transparent border-none outline-none focus:ring-0 p-0 cursor-pointer"
                    >
                      <option value="male">Мужской</option>
                      <option value="female">Женский</option>
                      <option value="not_specified">Не указан</option>
                    </select>
                  </div>
                </div>

                {/* День рождения */}
                <div className="space-y-1.5 relative">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">День рождения</span>
                  <CustomDatePicker value={birthday} onChange={setBirthday} />
                </div>

                {/* Язык интерфейса */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Язык интерфейса</span>
                  <div className="flex items-center space-x-2.5 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus-within:border-brand focus-within:bg-white transition-all">
                    <Globe className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full text-xs font-bold text-zinc-800 bg-transparent border-none outline-none focus:ring-0 p-0 cursor-pointer"
                    >
                      <option value="ru">Русский</option>
                      <option value="kz">Қазақша</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>

                {/* Статус подписки (рассылка) */}
                <div className="space-y-1.5 md:col-span-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Статус подписки (рассылки)</span>
                  <div className="flex items-center space-x-2.5 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus-within:border-brand focus-within:bg-white transition-all">
                    <Bell className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    <select
                      value={subscribeStatus}
                      onChange={(e) => setSubscribeStatus(e.target.value)}
                      className="w-full text-xs font-bold text-zinc-800 bg-transparent border-none outline-none focus:ring-0 p-0 cursor-pointer"
                    >
                      <option value="all">Все сообщения</option>
                      <option value="notifications">Только уведомления (без рассылок)</option>
                      <option value="none">Ничего из этого</option>
                    </select>
                  </div>
                </div>

                {/* О себе */}
                <div className="space-y-1.5 md:col-span-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">О себе</span>
                  <div className="flex items-start space-x-2.5 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus-within:border-brand focus-within:bg-white transition-all">
                    <FileText className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-1" />
                    <textarea
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      rows={3}
                      className="w-full text-xs font-bold text-zinc-800 bg-transparent border-none outline-none focus:ring-0 p-0 resize-none"
                      placeholder="Расскажите о себе..."
                    />
                  </div>
                </div>

              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSave}
                  disabled={!name.trim() || !email.trim()}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-brand hover:bg-brand-dark disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Сохранить изменения</span>
                </button>
              </div>
            </div>

            {/* 2. Read-only Academic Info */}
            <div className="bento-card space-y-6">
              <h3 className="text-lg font-black text-zinc-900 font-outfit border-b border-zinc-50 pb-3">Системные / Академические данные</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Куратор */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Куратор</span>
                  <div className="flex items-center space-x-2.5 p-3.5 bg-zinc-50/50 border border-zinc-100 rounded-xl opacity-80">
                    <GraduationCap className="w-5 h-5 text-brand" />
                    <span className="text-xs font-bold text-zinc-650">Алексей Иванов</span>
                  </div>
                </div>

                {/* Группа */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Группа</span>
                  <div className="flex items-center space-x-2.5 p-3.5 bg-zinc-50/50 border border-zinc-100 rounded-xl opacity-80">
                    <Users className="w-5 h-5 text-zinc-400" />
                    <span className="text-xs font-bold text-zinc-650">Информатика-1</span>
                  </div>
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
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white border border-zinc-150 rounded-bento p-6 max-w-md w-full shadow-bento-large relative z-10 space-y-4"
            >
              {deactivatedDate ? (
                <div className="space-y-4 text-center py-4">
                  <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-lg font-black text-zinc-900 font-outfit">Аккаунт деактивирован</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Ваши данные будут полностью удалены из системы: <br />
                      <strong className="text-zinc-800 font-bold">{new Date(deactivatedDate).toLocaleDateString('ru-RU')}</strong>.
                    </p>
                  </div>
                  <p className="text-[10px] text-rose-500 font-bold bg-rose-50/50 p-2.5 rounded-xl border border-rose-100/50">
                    Сейчас вы будете перенаправлены на страницу входа.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-2 text-rose-500">
                    <ShieldAlert className="w-6 h-6" />
                    <h4 className="text-lg font-black font-outfit text-zinc-900">Удаление профиля (GDPR)</h4>
                  </div>
                  
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Вы собираетесь воспользоваться <strong>Правом на забвение</strong>. Это действие временно заморозит ваш аккаунт и безвозвратно удалит всю историю обучения через 14 дней.
                  </p>

                  <label className="flex items-start space-x-3 p-3 bg-zinc-50 border border-zinc-100 rounded-xl cursor-pointer hover:bg-zinc-100/40 transition-all select-none">
                    <input
                      type="checkbox"
                      checked={gdprChecked}
                      onChange={(e) => setGdprChecked(e.target.checked)}
                      disabled={isDeactivating}
                      className="mt-0.5 rounded border-zinc-350 text-rose-500 focus:ring-rose-500"
                    />
                    <span className="text-[10px] font-bold text-zinc-550 leading-relaxed">
                      Я подтверждаю удаление моих личных данных, оценок за тесты и файлов конспектов.
                    </span>
                  </label>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      onClick={() => setShowGdprModal(false)}
                      disabled={isDeactivating}
                      className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-600 rounded-xl transition-colors cursor-pointer"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={handleGdprDelete}
                      disabled={!gdprChecked || isDeactivating}
                      className="flex items-center space-x-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-rose-200"
                    >
                      {isDeactivating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      <span>Стереть данные</span>
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
