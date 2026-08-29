'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileCard } from '@/components/bento/ProfileCard';
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
  Trash2, 
  RefreshCw, 
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
        className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer select-none"
        style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}
      >
        <Calendar className="w-4 h-4 text-brand flex-shrink-0" />
        <span className="w-full text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{displayValue()}</span>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div 
            className="absolute left-0 mt-2 w-72 border rounded-2xl p-4 shadow-2xl z-40 space-y-3.5"
            style={{ top: '100%', background: 'var(--card-bg)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <button 
                type="button"
                onClick={prevMonthAction} 
                className="p-1 px-2.5 rounded-lg text-xs font-extrabold transition-colors cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                style={{ color: 'var(--text-secondary)' }}
              >
                &larr;
              </button>
              
              <div className="flex items-center space-x-1">
                <select 
                  value={viewMonth} 
                  onChange={(e) => setViewMonth(parseInt(e.target.value))}
                  className="bg-transparent border-none outline-none cursor-pointer font-extrabold text-xs p-1 rounded"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {MONTHS_RU.map((m, idx) => <option key={idx} value={idx} style={{ background: 'var(--card-bg)' }}>{m}</option>)}
                </select>
                
                <select 
                  value={viewYear} 
                  onChange={(e) => setViewYear(parseInt(e.target.value))}
                  className="bg-transparent border-none outline-none cursor-pointer font-extrabold text-xs p-1 rounded"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {YEARS.map(y => <option key={y} value={y} style={{ background: 'var(--card-bg)' }}>{y}</option>)}
                </select>
              </div>

              <button 
                type="button"
                onClick={nextMonthAction} 
                className="p-1 px-2.5 rounded-lg text-xs font-extrabold transition-colors cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                style={{ color: 'var(--text-secondary)' }}
              >
                &rarr;
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {DAYS_RU.map((d, i) => (
                <span 
                  key={i} 
                  className={`text-[10px] font-black uppercase tracking-wider ${
                    i === 5 || i === 6 ? 'text-rose-500' : ''
                  }`}
                  style={{ color: i === 5 || i === 6 ? undefined : 'var(--text-tertiary)' }}
                >
                  {d}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {days.map((item, idx) => {
                const selected = isSelected(item.day, item.month, item.year);
                const today = isToday(item.day, item.month, item.year);
                
                let dayStyle = 'hover:bg-zinc-100 dark:hover:bg-zinc-800';
                if (!item.isCurrentMonth) {
                  dayStyle = 'opacity-30';
                }
                if (today) {
                  dayStyle = 'border border-brand text-brand font-extrabold';
                }
                if (selected) {
                  dayStyle = 'bg-brand text-white font-extrabold shadow-sm';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDay(item.day, item.month, item.year)}
                    className={`h-7 w-7 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer mx-auto ${dayStyle}`}
                    style={!selected && !today ? { color: 'var(--text-primary)' } : undefined}
                  >
                    {item.day}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={handleClear}
                className="text-[10px] font-black text-rose-500 hover:opacity-80 px-2.5 py-1.5 rounded-lg cursor-pointer"
              >
                Очистить
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-black px-2.5 py-1.5 rounded-lg cursor-pointer"
                style={{ color: 'var(--text-secondary)' }}
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
    <>
      <div className="flex flex-col min-h-[calc(100vh-2rem)] p-6 md:p-8 space-y-6 max-w-6xl mx-auto w-full">
        
        {/* Header Section */}
        <div className="border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-outfit" style={{ color: 'var(--text-primary)' }}>
            Профиль студента
          </h1>
          <p className="text-xs sm:text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
            Управление личной информацией и академическими данными.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          
          {/* Main User Info Bento */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Editable Personal Info */}
            <div className="bento-card space-y-6">
              <h3 className="text-base font-extrabold font-outfit border-b pb-3" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                Личные данные
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* ФИО студента */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-secondary)' }}>ФИО студента</span>
                  <div className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl border focus-within:border-brand transition-all" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
                    <User className="w-4 h-4 text-brand flex-shrink-0" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs font-bold bg-transparent border-none outline-none focus:ring-0 p-0"
                      style={{ color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-secondary)' }}>Email адрес</span>
                  <div className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl border focus-within:border-brand transition-all" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
                    <Mail className="w-4 h-4 text-brand flex-shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs font-bold bg-transparent border-none outline-none focus:ring-0 p-0"
                      style={{ color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                {/* Номер */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-secondary)' }}>Номер телефона</span>
                  <div className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl border focus-within:border-brand transition-all" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
                    <Phone className="w-4 h-4 text-brand flex-shrink-0" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+7 (777) 123-45-67"
                      className="w-full text-xs font-bold bg-transparent border-none outline-none focus:ring-0 p-0"
                      style={{ color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                {/* Пол */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-secondary)' }}>Пол</span>
                  <div className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl border focus-within:border-brand transition-all" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
                    <Smile className="w-4 h-4 text-brand flex-shrink-0" />
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full text-xs font-bold bg-transparent border-none outline-none focus:ring-0 p-0 cursor-pointer"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <option value="male" style={{ background: 'var(--card-bg)' }}>Мужской</option>
                      <option value="female" style={{ background: 'var(--card-bg)' }}>Женский</option>
                      <option value="not_specified" style={{ background: 'var(--card-bg)' }}>Не указан</option>
                    </select>
                  </div>
                </div>

                {/* День рождения */}
                <div className="space-y-1.5 relative">
                  <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-secondary)' }}>День рождения</span>
                  <CustomDatePicker value={birthday} onChange={setBirthday} />
                </div>

                {/* Язык интерфейса */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-secondary)' }}>Язык интерфейса</span>
                  <div className="flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl border focus-within:border-brand transition-all" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
                    <Globe className="w-4 h-4 text-brand flex-shrink-0" />
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full text-xs font-bold bg-transparent border-none outline-none focus:ring-0 p-0 cursor-pointer"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <option value="ru" style={{ background: 'var(--card-bg)' }}>Русский</option>
                      <option value="kz" style={{ background: 'var(--card-bg)' }}>Қазақша</option>
                      <option value="en" style={{ background: 'var(--card-bg)' }}>English</option>
                    </select>
                  </div>
                </div>

                {/* О себе */}
                <div className="space-y-1.5 md:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-secondary)' }}>О себе</span>
                  <div className="flex items-start space-x-2.5 p-3 rounded-xl border focus-within:border-brand transition-all" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
                    <FileText className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                    <textarea
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      rows={3}
                      className="w-full text-xs font-medium bg-transparent border-none outline-none focus:ring-0 p-0 resize-none"
                      style={{ color: 'var(--text-primary)' }}
                      placeholder="Расскажите о ваших учебных целях..."
                    />
                  </div>
                </div>

              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSave}
                  disabled={!name.trim() || !email.trim()}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-brand hover:bg-brand-dark disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Сохранить изменения</span>
                </button>
              </div>
            </div>

            {/* 2. Academic Info */}
            <div className="bento-card space-y-4">
              <h3 className="text-base font-extrabold font-outfit border-b pb-3" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                Учебные данные
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-secondary)' }}>Куратор</span>
                  <div className="flex items-center space-x-2.5 p-3 rounded-xl border" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
                    <GraduationCap className="w-5 h-5 text-brand" />
                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Алексей Иванов</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-secondary)' }}>Учебная группа</span>
                  <div className="flex items-center space-x-2.5 p-3 rounded-xl border" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
                    <Users className="w-5 h-5 text-zinc-400" />
                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Поток — 2026</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar Area: Privacy / GDPR */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bento-card p-6">
              <ProfileCard />
            </div>

            <div className="bento-card space-y-4 border-rose-500/20 bg-rose-500/5">
              <h3 className="text-xs font-black text-rose-500 font-outfit uppercase tracking-wider flex items-center space-x-1.5">
                <Shield className="w-4 h-4" />
                <span>Приватность и безопасность</span>
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Вы можете в любой момент запросить деактивацию аккаунта и полное удаление персональных данных.
              </p>
              <button
                onClick={() => setShowGdprModal(true)}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
              >
                <Trash2 className="w-4 h-4" />
                <span>Удалить профиль (GDPR)</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* GDPR TWO-PHASE MODAL */}
      <AnimatePresence>
        {showGdprModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeactivating && setShowGdprModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="border rounded-2xl p-6 max-w-md w-full shadow-2xl relative z-10 space-y-4"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
            >
              {deactivatedDate ? (
                <div className="space-y-4 text-center py-4">
                  <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-lg font-black font-outfit" style={{ color: 'var(--text-primary)' }}>Аккаунт деактивирован</h4>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      Ваши данные будут полностью удалены из системы: <br />
                      <strong className="font-bold" style={{ color: 'var(--text-primary)' }}>{new Date(deactivatedDate).toLocaleDateString('ru-RU')}</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-2 text-rose-500">
                    <ShieldAlert className="w-6 h-6" />
                    <h4 className="text-lg font-black font-outfit" style={{ color: 'var(--text-primary)' }}>Удаление профиля (GDPR)</h4>
                  </div>
                  
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Вы собираетесь воспользоваться <strong>Правом на забвение</strong>. Это действие временно заморозит ваш аккаунт и безвозвратно удалит всю историю обучения через 14 дней.
                  </p>

                  <label className="flex items-start space-x-3 p-3 rounded-xl cursor-pointer transition-all border" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
                    <input
                      type="checkbox"
                      checked={gdprChecked}
                      onChange={(e) => setGdprChecked(e.target.checked)}
                      disabled={isDeactivating}
                      className="mt-0.5 rounded text-rose-500 focus:ring-rose-500"
                    />
                    <span className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      Я подтверждаю удаление моих личных данных, истории уроков и файлов конспектов.
                    </span>
                  </label>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      onClick={() => setShowGdprModal(false)}
                      disabled={isDeactivating}
                      className="px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Отмена
                    </button>
                    <button
                      onClick={handleGdprDelete}
                      disabled={!gdprChecked || isDeactivating}
                      className="flex items-center space-x-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
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
    </>
  );
}
