'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Play,
  Trophy,
  Brain,
  Swords,
  Shield,
  BarChart3,
  Users,
  Flame,
  ArrowRight,
  CheckCircle,
  Star,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: <Play className="w-6 h-6" />,
      title: 'Интерактивные видеолекции',
      desc: 'Смотрите, ставьте на паузу и создавайте заметки с привязкой к таймкодам. Прогресс автосохраняется каждые 15 секунд.',
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'SM2 Повторение',
      desc: 'Алгоритм SuperMemo-2 подбирает карточки для повторения, подстраиваясь под вашу скорость обучения.',
      color: 'bg-purple-50 text-purple-600 border-purple-100',
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: 'Геймификация и XP',
      desc: 'Зарабатывайте очки опыта, повышайте уровень и открывайте достижения за активное обучение.',
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      icon: <Swords className="w-6 h-6" />,
      title: 'PvP Арена',
      desc: 'Соревнуйтесь с однокурсниками в реальном времени. Скорость ответов даёт бонусные очки.',
      color: 'bg-rose-50 text-rose-600 border-rose-100',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Content Dripping',
      desc: 'Последовательный доступ к урокам: следующий открывается только после сдачи предыдущего.',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Детальная аналитика',
      desc: 'Отслеживайте прогресс, XP, серию обучения и сравнивайте себя с когортой.',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
  ];

  const stats = [
    { value: '500+', label: 'Студентов', icon: <Users className="w-5 h-5" /> },
    { value: '98%', label: 'Довольны', icon: <Star className="w-5 h-5" /> },
    { value: '14', label: 'Средняя серия', icon: <Flame className="w-5 h-5" /> },
    { value: '25K+', label: 'Пройдено уроков', icon: <CheckCircle className="w-5 h-5" /> },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center text-white shadow-md shadow-brand/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight text-zinc-950 font-outfit">
              Mathalama<span className="text-brand">Edu</span>
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-zinc-500">
            <a href="#features" className="hover:text-zinc-900 transition-colors">Возможности</a>
            <a href="#stats" className="hover:text-zinc-900 transition-colors">Статистика</a>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="bg-brand hover:bg-brand-dark text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand/15 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Войти в систему
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-6">
        {/* Background gradients */}
        <div className="absolute top-20 -left-20 w-[500px] h-[500px] bg-brand-light rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 right-40 w-[300px] h-[300px] bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-center space-x-2 bg-brand-light text-brand px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Образовательная платформа нового поколения</span>
            </span>

            <h1 className="text-5xl md:text-7xl font-black text-zinc-950 font-outfit tracking-tight leading-tight mt-6">
              Учись с
              <span className="bg-gradient-to-r from-brand via-blue-500 to-indigo-600 bg-clip-text text-transparent"> удовольствием</span>
              , расти
              <span className="bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent"> каждый день</span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-500 font-medium max-w-2xl mx-auto mt-6 leading-relaxed">
              Интерактивные видеолекции, PvP-арена, система повторений SM2 и геймификация —
              всё, чтобы обучение стало привычкой, а не обязанностью.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <button
                onClick={() => router.push('/login')}
                className="bg-brand hover:bg-brand-dark text-white px-8 py-4 rounded-2xl text-base font-bold shadow-xl shadow-brand/20 transition-all hover:scale-105 active:scale-95 flex items-center space-x-2 cursor-pointer"
              >
                <span>Начать обучение бесплатно</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border border-zinc-200 text-zinc-700 px-8 py-4 rounded-2xl text-base font-bold hover:bg-zinc-50 transition-all cursor-pointer"
              >
                Узнать больше
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 px-6 border-y border-zinc-100 bg-zinc-50/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="text-center p-6 bg-white rounded-bento border border-zinc-100 shadow-bento"
              >
                <div className="w-10 h-10 mx-auto bg-brand-light text-brand rounded-xl flex items-center justify-center mb-3">
                  {stat.icon}
                </div>
                <div className="text-3xl font-black text-zinc-900 font-outfit">{stat.value}</div>
                <div className="text-xs font-semibold text-zinc-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-zinc-950 font-outfit tracking-tight">
              Всё для эффективного обучения
            </h2>
            <p className="text-zinc-500 font-medium mt-3 max-w-xl mx-auto">
              Современные инструменты, которые превращают рутину в увлекательный процесс
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bento-card p-6 md:p-8 space-y-4"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-zinc-900 font-outfit">{feature.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bento-card p-10 md:p-14 bg-gradient-to-br from-brand via-blue-600 to-indigo-700 border-none text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black font-outfit tracking-tight">
                Готовы начать обучение?
              </h2>
              <p className="text-blue-100 font-medium mt-3 max-w-md mx-auto">
                Присоединяйтесь к 500+ студентам, которые уже осваивают Go, математику и программирование.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="mt-8 bg-white text-brand px-8 py-4 rounded-2xl text-base font-bold shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Войти в MathalamaEdu →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-zinc-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-sm font-black text-zinc-400 font-outfit">MathalamaEdu</span>
          </div>
          <p className="text-xs text-zinc-400 font-medium">
            © 2026 MathalamaEdu. Все права защищены. Сделано в Казахстане.
          </p>
        </div>
      </footer>
    </div>
  );
}
