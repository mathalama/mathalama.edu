# Архитектура Фронтенда MVP (v1): Bento UI и Интеграция с Монолитом

Этот документ описывает спецификацию фронтенд-приложения первой версии (MVP) образовательной платформы **MathalamaEdu**. 

Поскольку на старте проекта разработка ведется по принципу **Frontend-First**, фронтенд проектируется как полностью автономное приложение с возможностью мгновенного переключения в режим мокированных данных (Mock Mode). Это позволяет валидировать пользовательский опыт (UX) и верстать сложные интерактивные компоненты до того, как бэкенд-монолит будет полностью развернут.

---

## 1. Продуктовый подход: Frontend-First и Mock-слой

Для обеспечения непрерывной разработки фронтенд-команда не блокируется готовностью Go-монолита. Для этого в клиентском слое запросов реализуется прозрачный адаптер данных.

### 1.1. Схема переключения API / Mock:
```mermaid
graph TD
    Client[React / Next.js Component] --> Query[TanStack Query / Fetch]
    Query --> Service[API Client Service]
    Service --> Condition{NEXT_PUBLIC_API_MOCK == "true"}
    Condition -->|Да| MockAdapter[Mock Data Adapter / Local Storage]
    Condition -->|Нет| RealAPI[Go Monolith /api/v1/...]
    
    style Condition fill:#F59E0B,stroke:#78350F,stroke-width:2px,color:#fff
    style MockAdapter fill:#10B981,stroke:#065F46,stroke-width:2px,color:#fff
```

*   **Mock-данные:** Хранятся в виде локальных JSON-файлов в папке `/web/src/mocks/` и симулируют задержку сети (`500ms - 1000ms`), а также возвращают ошибки авторизации или превышения лимитов запросов (Rate Limit 429) для тестирования устойчивости интерфейса.
*   **Изоляция верстки:** Все интерактивные состояния (загрузка, ошибка сдачи теста, успешное прохождение урока, появление конспекта) верстаются и проверяются в первую очередь.

---

## 2. Архитектура Next.js (App Router) для MVP

Фронтенд располагается в папке `/web` в корневом каталоге монолита и строится на базе **Next.js (App Router)** с использованием TypeScript и TailwindCSS.

### 2.1. Структура каталогов (`/web`):
```
/web
├── public/                 # Статические ресурсы (иконки, шрифты)
├── src/
│   ├── app/                # Маршрутизация App Router (страницы и макеты)
│   │   ├── (auth)/         # Группа маршрутов аутентификации (без общего layout)
│   │   │   └── login/      # Страница входа в систему
│   │   ├── (dashboard)/    # Группа маршрутов кабинета (с общим сайдбаром)
│   │   │   ├── dashboard/  # Главный экран Bento-дашборда
│   │   │   ├── courses/    # Список курсов и прохождение уроков
│   │   │   └── profile/    # Настройки и GDPR-удаление
│   │   └── layout.tsx      # Глобальный макет (провайдеры тем, шрифты)
│   ├── components/         # Общие переиспользуемые UI-компоненты
│   │   ├── bento/          # Карточки Bento-сетки (Heatmap, Leaderboard, Player)
│   │   └── ui/             # Атомарные элементы (кнопки, инпуты, модальные окна)
│   ├── hooks/              # Пользовательские React-хуки
│   ├── mocks/              # Статические данные для симуляции бэкенда
│   ├── store/              # Глобальное состояние Zustand (сессии, тосты)
│   └── utils/              # Хелперы, валидаторы и API-клиент (Axios/Fetch wrapper)
├── tailwind.config.js      # Конфигурация дизайн-системы Tailwind
└── tsconfig.json           # Настройки TypeScript
```

---

## 3. Дизайн-код Bento UI (на основе макета)

Согласно утвержденному визуальному макету `student_dashboard_mockup.png`, интерфейс личного кабинета избавлен от визуального мусора и посторонних элементов. Он представляет собой премиальный, светлый, парящий Bento-интерфейс.

### 3.1. Цветовые Токены (Tailwind Config)
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: '#ffffff',       // Абсолютно чистый белый фон страницы
        surface: {
          DEFAULT: '#ffffff',        // Белый цвет Bento-карточек
          hover: '#fafafa',
        },
        border: '#e4e4e7',           // Тонкие изящные границы Zinc-100/200
        brand: {
          DEFAULT: '#2563eb',        // Глубокий благородный синий
          light: '#eff6ff',
          dark: '#1d4ed8',
        },
        success: {
          DEFAULT: '#10b981',        // Сочный изумрудный для активности и прогресса
          light: '#ecfdf5',
        },
        gray: {
          text: '#71717a',           // Мягкий серый для второстепенного текста
          dark: '#18181b',           // Глубокий темный для основных заголовков
        }
      },
      borderRadius: {
        'bento': '24px',             // Фирменное скругление углов Bento-панелей
        'bento-inner': '16px',       // Скругление внутренних элементов
      },
      boxShadow: {
        'bento': '0 10px 40px -10px rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.01)',
        'bento-hover': '0 20px 40px -12px rgba(0, 0, 0, 0.06)',
      }
    },
  },
}
```

### 3.2. Главные правила верстки интерфейса:
1.  **Эффект парения (Soft Shadow Elevation):** Все Bento-карточки имеют мягкую, едва заметную тень. При наведении карточка плавно приподнимается (`translate-y-[-2px]`) с увеличением размытия тени.
2.  **Обилие воздуха (Generous Padding):** Внутренние отступы карточек составляют не менее `24px` (`p-6`), а между карточками выдерживается зазор в `24px` (`gap-6`).
3.  **Идеальная адаптивность:** На мобильных устройствах Bento-сетка перестраивается в одну колонку, сохраняя пропорции и читаемость шрифтов.
4.  **Шрифты:** Используется современный геометрический гротеск (например, **Outfit** или **Inter** от Google Fonts).

---

## 4. Сетка Bento-Дашборда Студента (v1)

Центральным экраном является `/dashboard`, который собирает ключевую аналитику и прогресс обучения студента. В соответствии с дизайн-макетом, сетка состоит из четырех сбалансированных блоков:

```
+------------------------------------------+------------------------------------------+
|                                          |                                          |
|         1. Видеоплеер и теория           |         2. Календарь активности          |
|         (Интерактивный контент)          |          (GitHub-style Heatmap)          |
|                                          |                                          |
+------------------------------------------+------------------------------------------+
|                                          |                                          |
|         3. Лидерборд Студентов           |          4. Профиль, XP и Уровень        |
|          (Элемент геймификации)          |           (Ачивки и Статистика)          |
|                                          |                                          |
+------------------------------------------+------------------------------------------+
```

### 4.1. Разметка Bento-сетки на React + TailwindCSS
```tsx
// src/components/bento/BentoDashboardGrid.tsx
import React from 'react';
import { VideoPlayerCard } from './VideoPlayerCard';
import { ActivityHeatmapCard } from './ActivityHeatmapCard';
import { LeaderboardCard } from './LeaderboardCard';
import { ProfileStatsCard } from './ProfileStatsCard';

export const BentoDashboardGrid: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-8 bg-[#ffffff] min-h-screen">
      {/* Шапка дашборда */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-2 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 font-outfit">
            Привет, Иван! 👋
          </h1>
          <p className="text-zinc-500 mt-1">Рады видеть тебя снова. Давай продолжим обучение.</p>
        </div>
        <div className="flex items-center space-x-3 bg-zinc-50 p-2.5 rounded-2xl border border-zinc-100">
          <span className="text-sm font-medium text-zinc-600">Твой куратор:</span>
          <span className="text-sm font-bold text-brand">Алексей Иванов</span>
        </div>
      </div>

      {/* Адаптивная CSS Grid Bento-сетка */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* Блок 1: Интерактивный видеоплеер и конспект */}
        <div className="bg-white border border-zinc-200 rounded-bento p-6 md:p-8 shadow-bento hover:shadow-bento-hover transition-all duration-300">
          <VideoPlayerCard lessonId="lesson-2-uuid" videoId="99182a" />
        </div>

        {/* Блок 2: Календарь активности (Heatmap) */}
        <div className="bg-white border border-zinc-200 rounded-bento p-6 md:p-8 shadow-bento hover:shadow-bento-hover transition-all duration-300 flex flex-col justify-between">
          <ActivityHeatmapCard />
        </div>

        {/* Блок 3: Лидерборд студентов */}
        <div className="bg-white border border-zinc-200 rounded-bento p-6 md:p-8 shadow-bento hover:shadow-bento-hover transition-all duration-300">
          <LeaderboardCard />
        </div>

        {/* Блок 4: Профиль, XP и Ачивки */}
        <div className="bg-white border border-zinc-200 rounded-bento p-6 md:p-8 shadow-bento hover:shadow-bento-hover transition-all duration-300 flex flex-col justify-between">
          <ProfileStatsCard />
        </div>

      </div>
    </div>
  );
};
```

---

## 5. Детализация Интерактивных Компонентов

### 5.1. Календарь активности (GitHub-style Heatmap)
Компонент считывает массив активности по дням и отрисовывает компактную сетку, окрашивая ячейки в оттенки изумрудного в зависимости от интенсивности работы (просмотренные видео, сданные тесты, загруженные конспекты).

```tsx
// src/components/bento/ActivityHeatmapCard.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface HeatmapDay {
  date: string;
  activity_count: number;
  xp_earned: number;
}

export const ActivityHeatmapCard: React.FC = () => {
  // Запрос данных через React Query с поддержкой Mock-режима
  const { data, isLoading } = useQuery<{ days: HeatmapDay[]; streak: number }>({
    queryKey: ['studentActivityHeatmap'],
    queryFn: async () => {
      // Имитация fetch запроса к /api/v1/student/activity/heatmap
      const response = await fetch('/api/v1/student/activity/heatmap');
      return response.json();
    }
  });

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-zinc-100 hover:bg-zinc-200';
    if (count <= 2) return 'bg-emerald-100 hover:bg-emerald-200';
    if (count <= 4) return 'bg-emerald-300 hover:bg-emerald-400';
    return 'bg-emerald-500 hover:bg-emerald-600';
  };

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-zinc-50 rounded-bento-inner" />;
  }

  return (
    <div className="flex flex-col h-full justify-between space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 font-outfit">Календарь активности</h3>
          <p className="text-sm text-zinc-500">Твои успехи за последние 12 месяцев</p>
        </div>
        <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full font-bold">
          🔥 {data?.streak || 14} дней подряд!
        </span>
      </div>

      {/* SVG/HTML Сетка активности */}
      <div className="overflow-x-auto pb-2">
        <div className="flex space-x-1.5 min-w-[500px]">
          {/* Столбцы недель (упрощенная концепция для верстки) */}
          {Array.from({ length: 24 }).map((_, weekIndex) => (
            <div key={weekIndex} className="flex flex-col space-y-1.5">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const totalIndex = weekIndex * 7 + dayIndex;
                const dayData = data?.days?.[totalIndex] || { activity_count: 0 };
                return (
                  <div
                    key={dayIndex}
                    className={`w-3.5 h-3.5 rounded-sm transition-colors duration-200 cursor-pointer ${getIntensityClass(dayData.activity_count)}`}
                    title={dayData.date ? `${dayData.date}: ${dayData.activity_count} действий` : 'Нет активности'}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-100">
        <div className="flex items-center space-x-1">
          <span>Меньше</span>
          <div className="w-3 h-3 bg-zinc-100 rounded-sm"></div>
          <div className="w-3 h-3 bg-emerald-100 rounded-sm"></div>
          <div className="w-3 h-3 bg-emerald-300 rounded-sm"></div>
          <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
          <span>Больше</span>
        </div>
        <span className="text-zinc-500">Всего заработано: <strong className="text-zinc-700">4,250 XP</strong></span>
      </div>
    </div>
  );
};
```

### 5.2. Видеоплеер с Watch Tracker SDK (Progress Saving)
Компонент интегрирует видеоплеер (например, Vimeo или Kinoscope) и отсылает пинги прогресса на бэкенд раз в 15 секунд с использованием `debounced fetch`, защищая базу данных от спама дисковых операций.

```tsx
// src/components/bento/VideoPlayerCard.tsx
import React, { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  lessonId: string;
  videoId: string;
}

export const VideoPlayerCard: React.FC<VideoPlayerProps> = ({ lessonId, videoId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const lastPingTime = useRef<number>(0);

  // Симуляция отправки прогресса (в реальной сборке подключается SDK плеера)
  const sendProgressPing = async (seconds: number) => {
    try {
      await fetch(`/api/v1/student/lessons/${lessonId}/video/watch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watched_seconds: seconds })
      });
      console.log(`[Watch Tracker] Progress ping sent: ${seconds}s`);
    } catch (err) {
      console.error('Failed to send video progress:', err);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setWatchProgress((prev) => {
          const next = prev + 1;
          // Отправляем пинг каждые 15 секунд
          if (next - lastPingTime.current >= 15) {
            sendProgressPing(15);
            lastPingTime.current = next;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold text-zinc-900 font-outfit">Текущая видеолекция</h3>
        <span className="text-xs bg-brand-light text-brand px-3 py-1 rounded-full font-medium">
          Урок 2: Вычитание чисел
        </span>
      </div>

      {/* Плеер (Эмбед) */}
      <div className="relative aspect-video rounded-bento-inner overflow-hidden bg-zinc-900 border border-zinc-100 group shadow-inner">
        {/* В реальном коде тут iframe Vimeo/Kinoscope */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!isPlaying ? (
            <button
              onClick={() => setIsPlaying(true)}
              className="w-16 h-16 bg-white text-brand rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200"
            >
              <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          ) : (
            <div className="absolute bottom-4 right-4 bg-zinc-900/80 backdrop-blur-md text-white text-xs px-2.5 py-1.5 rounded-lg">
              Просмотрено: {Math.floor(watchProgress / 60)}м {watchProgress % 60}с
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-zinc-400">
        <span>Автосохранение прогресса активно</span>
        {isPlaying && <span className="text-emerald-500 animate-pulse">● Воспроизведение</span>}
      </div>
    </div>
  );
};
```

### 5.3. Загрузчик PDF-конспектов с использованием S3 Presigned URL
При сдаче домашнего задания (рукописного конспекта лекции) фронтенд выполняет двухэтапную загрузку для разгрузки бэкенда:
1.  **Получение ссылки:** Отправляет запрос на `POST /api/v1/student/lessons/{id}/submit` и получает `presigned_upload_url`.
2.  **Прямая загрузка в S3:** Выполняет классический `PUT` запрос с бинарным файлом (PDF) напрямую в MinIO S3.

```tsx
// src/components/bento/PdfSubmissionUploader.tsx
import React, { useState } from 'react';

export const PdfSubmissionUploader: React.FC<{ lessonId: string }> = ({ lessonId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setErrorMsg('Допускаются только файлы в формате PDF');
        return;
      }
      if (selectedFile.size > 20 * 1024 * 1024) {
        setErrorMsg('Размер файла превышает максимально допустимые 20 МБ');
        return;
      }
      setFile(selectedFile);
      setErrorMsg('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('loading');

    try {
      // Шаг 1: Запрашиваем Presigned URL у Go-монолита
      const tokenResponse = await fetch(`/api/v1/student/lessons/${lessonId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_name: file.name,
          student_notes: 'Загрузка рукописного конспекта студента.'
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Не удалось сгенерировать ссылку для загрузки');
      }

      const { presigned_upload_url } = await tokenResponse.json();

      // Шаг 2: Загружаем файл напрямую в MinIO S3
      const uploadResponse = await fetch(presigned_upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/pdf' },
        body: file
      });

      if (!uploadResponse.ok) {
        throw new Error('Сбой загрузки файла в облачное хранилище S3');
      }

      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || 'Ошибка загрузки. Попробуйте еще раз.');
    }
  };

  return (
    <div className="border border-dashed border-zinc-200 rounded-bento-inner p-6 text-center space-y-4">
      {status === 'success' ? (
        <div className="space-y-2 py-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
          <h4 className="font-bold text-zinc-900">Конспект успешно отправлен!</h4>
          <p className="text-xs text-zinc-500">Работа отправлена куратору в Telegram-бот на проверку.</p>
        </div>
      ) : (
        <>
          <div className="text-4xl text-zinc-300">📄</div>
          <div>
            <span className="text-sm font-semibold text-zinc-700 block">Загрузить конспект</span>
            <span className="text-xs text-zinc-400">PDF, максимум 20 МБ</span>
          </div>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="pdf-file-input"
          />
          <label
            htmlFor="pdf-file-input"
            className="inline-block px-4 py-2 border border-zinc-200 text-xs font-semibold text-zinc-600 rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors"
          >
            Выбрать файл
          </label>
          
          {file && (
            <div className="text-xs text-zinc-600 font-medium">
              Выбран: {file.name} ({Math.round(file.size / 1024 / 1024 * 100) / 100} MB)
            </div>
          )}

          {errorMsg && <div className="text-xs text-red-500 font-medium">{errorMsg}</div>}

          {file && status !== 'loading' && (
            <button
              onClick={handleUpload}
              className="w-full bg-brand hover:bg-brand-dark text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
            >
              Отправить на проверку
            </button>
          )}

          {status === 'loading' && (
            <div className="text-xs text-zinc-500 animate-pulse font-medium">Загрузка и антивирусное сканирование...</div>
          )}
        </>
      )}
    </div>
  );
};
```

---

## 6. Управление состоянием и Data Fetching

Для поддержания субсекундной скорости работы интерфейса и быстрого отклика используется связка двух легковесных решений:

### 6.1. Zustand (Глобальное состояние клиента)
Используется только для хранения сессии авторизации (`token`, `role`) и мгновенных системных уведомлений (toast-уведомлений), полностью заменяя тяжеловесный Redux.

```typescript
// src/store/useAuthStore.ts
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  role: 'student' | 'curator' | 'admin' | null;
  setSession: (token: string, role: 'student' | 'curator' | 'admin') => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  role: typeof window !== 'undefined' ? localStorage.getItem('role') as any : null,
  setSession: (token, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    set({ token, role });
  },
  clearSession: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    set({ token: null, role: null });
  }
}));
```

### 6.2. TanStack Query / React Query (Серверное состояние)
Отвечает за кэширование данных, полученных с бэкенда.
*   **Авто-рефетч:** При смене вкладок или возвращении фокуса в окно браузера TanStack Query незаметно обновляет лидерборд и календарь активности в фоновом режиме.
*   **Умная инвалидация:** При сдаче теста или успешной загрузке PDF-конспекта, фронтенд вызывает команду `queryClient.invalidateQueries(['lessons'])`, что мгновенно инициирует обновление статусов уроков и начисленного XP без перезагрузки всей страницы.

---

## 7. GDPR-Интерфейс: Удаление аккаунта в 1 клик

В рамках 100% соответствия стандарту конфиденциальности GDPR, в кабинете `/profile` реализуется кнопка удаления аккаунта с двухфазным механизмом:
1.  **Действие Студента:** Студент нажимает "Удалить профиль".
2.  **Запрос к монолиту:** Отправляется запрос `POST /api/v1/profile/delete`.
3.  **Состояние Soft Lock:** Фронтенд моментально стирает локальную сессию (`clearSession`), разлогинивает пользователя и перенаправляет на страницу входа с баннером: *"Ваш аккаунт деактивирован и запланирован к полному анонимизированному удалению через 14 дней. Вы можете восстановить его, обратившись в поддержку."*

---

## 8. Чек-лист готовности Фронтенда к интеграции с V1 Monolith

Перед переключением `NEXT_PUBLIC_API_MOCK` в положение `false`, фронтенд должен соответствовать следующим требованиям:

- [ ] Все страницы адаптированы под мобильные экраны (от `320px` до `1920px`).
- [ ] Отработана и протестирована двухфазная прямая загрузка PDF-файлов в MinIO S3 через подписанные URLs.
- [ ] Подключены дебаунсы на отправку видеопрогресса (пинги отправляются строго с шагом >= 15 секунд).
- [ ] Реализована корректная обработка HTTP статуса `429 Too Many Requests` (с выводом таймера обратного отсчета для повторной отправки формы).
- [ ] Кнопка GDPR-удаления аккаунта успешно инициирует очистку JWT токена на клиенте.
- [ ] Все цвета и тени Bento-карточек соответствуют премиальному минималистичному макету.
