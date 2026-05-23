export interface TestQuestion {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
}

export interface LessonComponent {
  video_watched: boolean;
  test: {
    required: boolean;
    passed: boolean;
    score: number;
    questions: TestQuestion[];
  };
  assignment: {
    required: boolean;
    status: 'not_submitted' | 'upload_pending' | 'pending' | 'approved' | 'rejected';
    file_url: string | null;
    feedback?: string;
  };
}

export interface Lesson {
  id: string;
  title: string;
  status: 'locked' | 'unlocked' | 'completed';
  video_provider: 'vimeo' | 'kinoscope';
  video_id: string;
  theory_content: string;
  components: LessonComponent;
}

export interface Module {
  module_id: string;
  module_title: string;
  lessons: Lesson[];
}

export interface LeaderboardEntry {
  student_id: string;
  student_name: string;
  xp_score: number;
  rank: number;
  isCurrentUser?: boolean;
}

export interface ActivityDay {
  date: string;
  activity_count: number;
  xp_earned: number;
}

export interface VideoNote {
  id: string;
  lesson_id: string;
  video_timestamp_seconds: number;
  note_text: string;
  created_at: string;
}

export interface SpacedRepetitionCard {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface SpacedRepetitionState {
  question_id: string;
  repetitions: number;
  interval_days: number;
  easiness_factor: number;
  next_review_date: string; // ISO date string: YYYY-MM-DD
}


// Initial Data structures to bootstrap our LocalStorage DB if empty
const INITIAL_COURSES = [
  {
    id: "go-course-uuid",
    title: "Основы Go (Golang) для начинающих",
    description: "Изучаем основы языка, слайсы, структуры и создание REST API.",
    cohort_name: "Поток — Весна 2026",
    curator_name: "Алексей Иванов"
  }
];

const INITIAL_MODULES: Module[] = [
  {
    module_id: "m1-uuid",
    module_title: "Модуль 1: Введение и Основы Языка",
    lessons: [
      {
        id: "lesson-1-uuid",
        title: "Урок 1. Переменные, типы данных и ветвления",
        status: "completed",
        video_provider: "kinoscope",
        video_id: "771829",
        theory_content: "### Переменные и константы в Go\n\nВ Go переменные объявляются с помощью ключевого слова `var` или краткого объявления `:=`.\n\n```go\npackage main\n\nimport \"fmt\"\n\nfunc main() {\n    name := \"Mathalama\"\n    fmt.Println(name)\n}\n```\n\n### Ветвления\nИспользуется конструкция `if-else` без круглых скобок вокруг условий.",
        components: {
          video_watched: true,
          test: {
            required: true,
            passed: true,
            score: 100,
            questions: [
              {
                id: "q1",
                text: "Какое ключевое слово используется для объявления переменной в Go?",
                options: ["let", "var", "def", "create"],
                correctOptionIndex: 1
              }
            ]
          },
          assignment: {
            required: true,
            status: "approved",
            file_url: "https://s3.mathalama.edu/submissions/homework-1.pdf",
            feedback: "Отличный конспект! Код оформлен чисто, типы разобраны идеально. Переходи к следующему уроку."
          }
        }
      },
      {
        id: "lesson-2-uuid",
        title: "Урок 2. Структуры, массивы и слайсы",
        status: "unlocked",
        video_provider: "vimeo",
        video_id: "99182a",
        theory_content: "### Слайсы (Slices) в Go\n\nСлайсы представляют собой динамические обертки над массивами. Слайс имеет длину и емкость.\n\n```go\n// Создание слайса\nslice := []int{1, 2, 3}\n\n// Добавление элементов\nslice = append(slice, 4)\n```\n\n### Структуры (Structs)\nПозволяют группировать данные различных типов:\n```go\ntype Student struct {\n    Name string\n    XP   int\n}\n```",
        components: {
          video_watched: false,
          test: {
            required: true,
            passed: false,
            score: 0,
            questions: [
              {
                id: "q2-1",
                text: "Какой встроенной функцией увеличивают слайсы в Go?",
                options: ["push()", "add()", "append()", "insert()"],
                correctOptionIndex: 2
              },
              {
                id: "q2-2",
                text: "Как получить емкость (capacity) слайса?",
                options: ["len()", "cap()", "capacity()", "size()"],
                correctOptionIndex: 1
              }
            ]
          },
          assignment: {
            required: true,
            status: "not_submitted",
            file_url: null
          }
        }
      },
      {
        id: "lesson-3-uuid",
        title: "Урок 3. Конкурентность: Горутины и Каналы",
        status: "locked",
        video_provider: "kinoscope",
        video_id: "882739",
        theory_content: "### Конкурентность в Go\n\nGo реализует модель акторов CSP с помощью горутин и каналов.\n\n```go\n// Запуск функции в отдельной горутине\ngo performTask()\n\n// Канал для передачи данных\nch := make(chan string)\nch <- \"ping\" // отправка\nmsg := <-ch  // получение\n```",
        components: {
          video_watched: false,
          test: {
            required: true,
            passed: false,
            score: 0,
            questions: [
              {
                id: "q3-1",
                text: "Какое ключевое слово запускает горутину?",
                options: ["routine", "run", "go", "async"],
                correctOptionIndex: 2
              }
            ]
          },
          assignment: {
            required: true,
            status: "not_submitted",
            file_url: null
          }
        }
      }
    ]
  }
];

const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { student_id: "stud-1", student_name: "Мария Сидорова", xp_score: 2850, rank: 1 },
  { student_id: "stud-2", student_name: "Александр Петров", xp_score: 2450, rank: 2 },
  { student_id: "stud-3", student_name: "Елена Кузнецова", xp_score: 2100, rank: 3 },
  { student_id: "current-student", student_name: "Иван Смирнов", xp_score: 1200, rank: 4, isCurrentUser: true },
  { student_id: "stud-4", student_name: "Дамир Ахметов", xp_score: 950, rank: 5 },
  { student_id: "stud-5", student_name: "София Морозова", xp_score: 800, rank: 6 }
];

const generateHeatmapDays = (): ActivityDay[] => {
  const days: ActivityDay[] = [];
  const today = new Date();
  // Generate days for past 24 weeks (168 days)
  for (let i = 167; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    // Simulate higher activity on weekdays, zero on some days
    let count = 0;
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const rand = Math.random();
      count = rand > 0.7 ? 5 : rand > 0.4 ? 3 : rand > 0.1 ? 1 : 0;
    } else {
      count = Math.random() > 0.85 ? 2 : 0;
    }
    
    // Set fixed high activity on Lesson 1 completion day (say 5 days ago)
    if (i === 5) {
      count = 5;
    }

    days.push({
      date: dateString,
      activity_count: count,
      xp_earned: count * 50
    });
  }
  return days;
};

// Initial Data for Video Notes
const INITIAL_VIDEO_NOTES: VideoNote[] = [
  {
    id: 'note-1',
    lesson_id: 'lesson-1-uuid',
    video_timestamp_seconds: 42,
    note_text: 'Краткое объявление := автоматически определяет тип переменной на лету.',
    created_at: new Date().toISOString()
  }
];

// Spaced Repetition static bank of questions (SuperMemo-2)
export const SPACED_REPETITION_POOL: SpacedRepetitionCard[] = [
  {
    id: "sr-1",
    question: "Найдите первый замечательный предел: lim (x -> 0) sin(x) / x",
    options: ["0", "1", "бесконечность", "не существует"],
    correctOptionIndex: 1,
    explanation: "Первый замечательный предел утверждает, что предел отношения синуса малого угла к самому углу равен 1 при стремлении аргумента к 0."
  },
  {
    id: "sr-2",
    question: "Чему равны длина и емкость слайса после: s := make([]int, 3, 5)?",
    options: ["len = 3, cap = 3", "len = 5, cap = 5", "len = 3, cap = 5", "len = 5, cap = 3"],
    correctOptionIndex: 2,
    explanation: "Встроенная функция make([]T, len, cap) инициализирует слайс с длиной 3 (разрешенный диапазон обращений) и резервной емкостью 5."
  },
  {
    id: "sr-3",
    question: "Что произойдет при попытке записи (отправки) в закрытый (closed) канал в Go?",
    options: ["Блокировка текущей горутины", "Возбуждение паники времени выполнения (panic)", "Запись будет проигнорирована", "Функция вернет false"],
    correctOptionIndex: 1,
    explanation: "Попытка записи в уже закрытый канал в Go является критической ошибкой и вызывает моментальную панику (panic)."
  },
  {
    id: "sr-4",
    question: "Чему равен определенный интеграл от x^2 на промежутке [0, 3]?",
    options: ["3", "6", "9", "27"],
    correctOptionIndex: 2,
    explanation: "Первообразная функции x^2 равна x^3 / 3. Вычисляем по Ньютону-Лейбницу: 3^3/3 - 0^3/3 = 27/3 = 9."
  },
  {
    id: "sr-5",
    question: "Какой паттерн concurrency используется для объединения результатов работы нескольких каналов в один?",
    options: ["Generator", "Fan-In", "Fan-Out", "Pipeline"],
    correctOptionIndex: 1,
    explanation: "Паттерн Fan-In (веерное сведение) считывает данные из нескольких входных каналов и мультиплексирует их в один результирующий канал."
  }
];

const INITIAL_SPACED_REPETITION_STATES: SpacedRepetitionState[] = [
  {
    question_id: "sr-1",
    repetitions: 0,
    interval_days: 0,
    easiness_factor: 2.5,
    next_review_date: new Date().toISOString().split('T')[0]
  },
  {
    question_id: "sr-2",
    repetitions: 0,
    interval_days: 0,
    easiness_factor: 2.5,
    next_review_date: new Date().toISOString().split('T')[0]
  },
  {
    question_id: "sr-3",
    repetitions: 0,
    interval_days: 0,
    easiness_factor: 2.5,
    next_review_date: new Date().toISOString().split('T')[0]
  },
  {
    question_id: "sr-4",
    repetitions: 0,
    interval_days: 0,
    easiness_factor: 2.5,
    next_review_date: new Date().toISOString().split('T')[0]
  },
  {
    question_id: "sr-5",
    repetitions: 0,
    interval_days: 0,
    easiness_factor: 2.5,
    next_review_date: new Date().toISOString().split('T')[0]
  }
];

// LocalStorage Helper
export const getFromStorage = <T>(key: string, initialValue: T): T => {
  if (typeof window === 'undefined') return initialValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.error('LocalStorage read error:', error);
    return initialValue;
  }
};

export const setToStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('LocalStorage write error:', error);
  }
};

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  xp_score: number;
  streak: number;
  presenceStatus: 'online' | 'offline' | 'watching_video' | 'doing_quiz';
  presenceContext: string;
  achievements: string[];
  chatHistory: { senderId: string; text: string; timestamp: string }[];
}

export interface BattleParticipant {
  friendId: string;
  name: string;
  avatar: string;
  score: number;
  answers: boolean[];
  speedBonusTotal: number;
  isCurrentUser?: boolean;
}

// ── NEW: Notifications ──
export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'achievement' | 'social';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon?: string;
}

// ── NEW: Achievements ──
export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'learning' | 'social' | 'speed' | 'streak' | 'mastery';
  icon: string;
  unlockCondition: string;
  unlocked: boolean;
  progress?: number;     // 0-100
  progressLabel?: string; // e.g. "2/5 уроков"
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  unlockedAt?: string;
}

// ── NEW: Certificates ──
export interface Certificate {
  id: string;
  courseTitle: string;
  studentName: string;
  issueDate: string;
  verificationCode: string;
  grade: string;
  totalXP: number;
  completionPercent: number;
}

// ── NEW: Weekly XP data for analytics ──
export interface WeeklyXpEntry {
  day: string;
  xp: number;
  minutes: number;
}

const INITIAL_FRIENDS: Friend[] = [
  {
    id: "friend-1",
    name: "Мария Сидорова",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    xp_score: 2850,
    streak: 18,
    presenceStatus: "doing_quiz",
    presenceContext: "Проходит тест по структурам Go",
    achievements: ["first_quiz", "streak_10", "video_expert"],
    chatHistory: [
      { senderId: "friend-1", text: "Привет! Как успехи со слайсами?", timestamp: new Date(Date.now() - 3600000).toISOString() },
      { senderId: "current-student", text: "Привет! Разобрался, append() — мощь!", timestamp: new Date(Date.now() - 3000000).toISOString() },
      { senderId: "friend-1", text: "Классно, давай догоняй меня в лидерборде!", timestamp: new Date(Date.now() - 2400000).toISOString() }
    ]
  },
  {
    id: "friend-2",
    name: "Александр Петров",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    xp_score: 2450,
    streak: 12,
    presenceStatus: "watching_video",
    presenceContext: "Смотрит Урок 3. Конкурентность",
    achievements: ["video_expert", "perfect_quiz"],
    chatHistory: []
  },
  {
    id: "friend-3",
    name: "Елена Кузнецова",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    xp_score: 2100,
    streak: 8,
    presenceStatus: "offline",
    presenceContext: "Вне сети (10 мин назад)",
    achievements: ["perfect_quiz"],
    chatHistory: []
  },
  {
    id: "friend-4",
    name: "Дамир Ахметов",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    xp_score: 950,
    streak: 5,
    presenceStatus: "online",
    presenceContext: "Изучает теорию Урока 2",
    achievements: ["first_quiz"],
    chatHistory: []
  },
  {
    id: "friend-5",
    name: "София Морозова",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    xp_score: 800,
    streak: 3,
    presenceStatus: "offline",
    presenceContext: "Вне сети (2 ч назад)",
    achievements: [],
    chatHistory: []
  }
];

// ── NEW: Initial Notifications ──
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'success',
    title: 'Домашняя работа проверена!',
    message: 'Куратор Алексей Иванов одобрил ваш конспект по Уроку 1. Получено +300 XP!',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    read: false,
    icon: ''
  },
  {
    id: 'notif-2',
    type: 'achievement',
    title: 'Новое достижение: Марафонец!',
    message: 'Вы занимались 14 дней подряд! Бейдж «Марафонец» разблокирован.',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    read: false,
    icon: ''
  },
  {
    id: 'notif-3',
    type: 'info',
    title: 'Урок 2 разблокирован',
    message: 'Вы прошли все шаги Урока 1. Новый урок «Структуры и слайсы» доступен!',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    icon: ''
  },
  {
    id: 'notif-4',
    type: 'social',
    title: 'Мария обогнала вас!',
    message: 'Мария Сидорова набрала 2850 XP и поднялась на 1-е место в рейтинге вашего потока.',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: true,
    icon: ''
  },
  {
    id: 'notif-5',
    type: 'info',
    title: 'Напоминание: Ежедневная разминка',
    message: 'Пройдите 3 карточки повторения SM2, чтобы не потерять серию. Осталось 4 часа!',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    read: true,
    icon: ''
  },
  {
    id: 'notif-6',
    type: 'success',
    title: 'Тест по Уроку 1 сдан!',
    message: 'Результат: 100%. Отличный результат! Шаг «Конспект» разблокирован.',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true,
    icon: ''
  },
  {
    id: 'notif-7',
    type: 'social',
    title: 'Дамир отправил сообщение',
    message: '«Привет! Давай устроим батл на Арене?»',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    read: true,
    icon: ''
  },
  {
    id: 'notif-8',
    type: 'warning',
    title: 'Дедлайн приближается!',
    message: 'До сдачи конспекта по Уроку 2 осталось 3 дня. Не пропустите!',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    read: true,
    icon: ''
  },
  {
    id: 'notif-9',
    type: 'achievement',
    title: 'Достижение: Гофер-Новичок',
    message: 'Вы впервые вошли в систему MathalamaEdu. Добро пожаловать!',
    timestamp: new Date(Date.now() - 604800000).toISOString(),
    read: true,
    icon: ''
  },
  {
    id: 'notif-10',
    type: 'info',
    title: 'Добро пожаловать в MathalamaEdu!',
    message: 'Ваш аккаунт создан. Начните с первого урока курса «Основы Go».',
    timestamp: new Date(Date.now() - 1209600000).toISOString(),
    read: true,
    icon: ''
  }
];

// ── NEW: Initial Achievements (16 badges) ──
const INITIAL_ACHIEVEMENTS: Achievement[] = [
  // Learning
  { id: 'ach-gopher', title: 'Гофер-Новичок', description: 'Первый вход в систему MathalamaEdu', category: 'learning', icon: '', unlockCondition: 'Войти в систему', unlocked: true, rarity: 'common', xpReward: 10, unlockedAt: new Date(Date.now() - 1209600000).toISOString() },
  { id: 'ach-first-video', title: 'Первый Просмотр', description: 'Посмотреть свою первую видеолекцию', category: 'learning', icon: '', unlockCondition: 'Завершить 1 видео', unlocked: true, rarity: 'common', xpReward: 25, unlockedAt: new Date(Date.now() - 604800000).toISOString() },
  { id: 'ach-test-ace', title: 'Гроза Тестов', description: 'Сдать тест на 100% с первой попытки', category: 'learning', icon: '', unlockCondition: 'Тест на 100%', unlocked: true, rarity: 'rare', xpReward: 100, unlockedAt: new Date(Date.now() - 432000000).toISOString() },
  { id: 'ach-note-master', title: 'Конспект-Мастер', description: 'Сдать 1 домашнюю работу и получить одобрение куратора', category: 'learning', icon: '', unlockCondition: 'ДЗ одобрено', unlocked: true, rarity: 'rare', xpReward: 150, unlockedAt: new Date(Date.now() - 345600000).toISOString() },
  // Streak
  { id: 'ach-streak-7', title: 'Недельный Страйк', description: 'Заниматься 7 дней подряд без перерыва', category: 'streak', icon: '', unlockCondition: '7 дней подряд', unlocked: true, rarity: 'common', xpReward: 50, unlockedAt: new Date(Date.now() - 604800000).toISOString() },
  { id: 'ach-streak-14', title: 'Марафонец', description: 'Непрерывная серия обучения 14 дней', category: 'streak', icon: '', unlockCondition: '14 дней подряд', unlocked: true, rarity: 'rare', xpReward: 150, unlockedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'ach-streak-30', title: 'Железная Воля', description: 'Удержать серию обучения 30 дней', category: 'streak', icon: '', unlockCondition: '30 дней подряд', unlocked: false, rarity: 'epic', xpReward: 500, progress: 47, progressLabel: '14/30 дней' },
  { id: 'ach-streak-100', title: 'Легенда Дисциплины', description: '100 дней непрерывного обучения', category: 'streak', icon: '', unlockCondition: '100 дней подряд', unlocked: false, rarity: 'legendary', xpReward: 2000, progress: 14, progressLabel: '14/100 дней' },
  // Social
  { id: 'ach-first-battle', title: 'Первый Батл', description: 'Принять участие в соревновании на Арене', category: 'social', icon: '', unlockCondition: 'Завершить 1 батл', unlocked: false, rarity: 'common', xpReward: 30, progress: 0, progressLabel: '0/1 батл' },
  { id: 'ach-battle-champ', title: 'Чемпион Арены', description: 'Выиграть 5 баттлов на Арене', category: 'social', icon: '', unlockCondition: 'Победить 5 раз', unlocked: false, rarity: 'epic', xpReward: 300, progress: 0, progressLabel: '0/5 побед' },
  { id: 'ach-team-player', title: 'Командный Игрок', description: 'Отправить 10 сообщений однокурсникам', category: 'social', icon: '', unlockCondition: '10 сообщений', unlocked: false, rarity: 'common', xpReward: 25, progress: 30, progressLabel: '3/10 сообщений' },
  { id: 'ach-popular', title: 'Душа Потока', description: 'Добавить 5 друзей в свой список', category: 'social', icon: '', unlockCondition: '5 друзей', unlocked: true, rarity: 'rare', xpReward: 75, unlockedAt: new Date(Date.now() - 259200000).toISOString() },
  // Speed
  { id: 'ach-speedster', title: 'Спринтер', description: 'Ответить на вопрос в батле менее чем за 3 секунды', category: 'speed', icon: '', unlockCondition: 'Ответ < 3 сек', unlocked: false, rarity: 'rare', xpReward: 100, progress: 0, progressLabel: 'Не достигнуто' },
  { id: 'ach-night-owl', title: 'Ночная Сова', description: 'Заниматься после 23:00', category: 'speed', icon: '', unlockCondition: 'Активность после 23:00', unlocked: false, rarity: 'common', xpReward: 20, progress: 0, progressLabel: 'Не достигнуто' },
  // Mastery
  { id: 'ach-course-complete', title: 'Выпускник', description: 'Завершить весь курс на 100%', category: 'mastery', icon: '', unlockCondition: 'Курс пройден', unlocked: false, rarity: 'epic', xpReward: 1000, progress: 33, progressLabel: '1/3 уроков' },
  { id: 'ach-100-notes', title: '100 Заметок', description: 'Создать 100 закладок к видеолекциям', category: 'mastery', icon: '', unlockCondition: '100 заметок', unlocked: false, rarity: 'legendary', xpReward: 500, progress: 1, progressLabel: '1/100 заметок' },
];

// ── NEW: Initial Certificate ──
const INITIAL_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-preview',
    courseTitle: 'Основы Go (Golang) для начинающих',
    studentName: 'Иван Смирнов',
    issueDate: '',
    verificationCode: 'MATH-2026-GO-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    grade: 'Не завершено',
    totalXP: 0,
    completionPercent: 33,
  }
];

// ── NEW: Weekly XP Analytics ──
const generateWeeklyXp = (): WeeklyXpEntry[] => {
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  return days.map((day) => ({
    day,
    xp: Math.floor(Math.random() * 350) + 50,
    minutes: Math.floor(Math.random() * 45) + 10
  }));
};

// Initializer function
export const initializeMockDB = () => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('mathalama_courses')) {
    setToStorage('mathalama_courses', INITIAL_COURSES);
  }
  if (!localStorage.getItem('mathalama_modules')) {
    setToStorage('mathalama_modules', INITIAL_MODULES);
  }
  if (!localStorage.getItem('mathalama_leaderboard')) {
    setToStorage('mathalama_leaderboard', INITIAL_LEADERBOARD);
  }
  if (!localStorage.getItem('mathalama_heatmap')) {
    setToStorage('mathalama_heatmap', generateHeatmapDays());
  }
  if (!localStorage.getItem('mathalama_streak')) {
    setToStorage('mathalama_streak', 14);
  }
  if (!localStorage.getItem('mathalama_video_notes')) {
    setToStorage('mathalama_video_notes', INITIAL_VIDEO_NOTES);
  }
  if (!localStorage.getItem('mathalama_spaced_repetition_states')) {
    setToStorage('mathalama_spaced_repetition_states', INITIAL_SPACED_REPETITION_STATES);
  }
  if (!localStorage.getItem('mathalama_friends')) {
    setToStorage('mathalama_friends', INITIAL_FRIENDS);
  }
  if (!localStorage.getItem('mathalama_notifications')) {
    setToStorage('mathalama_notifications', INITIAL_NOTIFICATIONS);
  }
  if (!localStorage.getItem('mathalama_achievements')) {
    setToStorage('mathalama_achievements', INITIAL_ACHIEVEMENTS);
  }
  if (!localStorage.getItem('mathalama_certificates')) {
    setToStorage('mathalama_certificates', INITIAL_CERTIFICATES);
  }
  if (!localStorage.getItem('mathalama_weekly_xp')) {
    setToStorage('mathalama_weekly_xp', generateWeeklyXp());
  }
  if (!localStorage.getItem('mathalama_theme')) {
    setToStorage('mathalama_theme', 'light');
  }
};
