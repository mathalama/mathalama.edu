import { create } from 'zustand';
import {
  initializeMockDB,
  getFromStorage,
  setToStorage,
  Module,
  LeaderboardEntry,
  ActivityDay,
  Lesson,
  VideoNote,
  SpacedRepetitionCard,
  SpacedRepetitionState,
  SPACED_REPETITION_POOL,
  Friend,
  BattleParticipant,
  Notification,
  Certificate,
  WeeklyXpEntry
} from '../mocks/db';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface LmsState {
  // Auth
  token: string | null;
  role: 'student' | 'curator' | 'admin' | null;
  studentName: string;
  studentEmail: string;
  studentTelegram: string;
  studentPhone: string;
  studentGender: string;
  studentBirthday: string;
  studentLanguage: string;
  studentAbout: string;
  studentSubscribeStatus: string;
  isAuthenticated: boolean;
  loginAttempts: number;
  lockoutTime: number | null;

  // LMS Data
  courses: any[];
  modules: Module[];
  leaderboard: LeaderboardEntry[];
  heatmap: ActivityDay[];
  streak: number;
  selectedLessonId: string | null;
  
  // Video Notes
  videoNotes: VideoNote[];
  
  // Spaced Repetition (SM2)
  spacedRepetitionStates: SpacedRepetitionState[];
  activeSessionQueue: string[]; // List of questionIds in current active retry queue
  
  // Social Features State
  friends: Friend[];
  activeBattle: {
    lobbyCode: string;
    participants: BattleParticipant[];
    currentQuestionIndex: number;
    status: 'lobby' | 'countdown' | 'battle' | 'podium';
    timer: number;
    playerSpeedBonusSeconds: number;
  } | null;

  // New Features State
  theme: 'light' | 'dark';
  notifications: Notification[];
  certificates: Certificate[];
  weeklyXp: WeeklyXpEntry[];

  // UI States
  toasts: Toast[];
  isSubmittingPdf: boolean;
  pdfUploadProgress: number;

  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; retryAfter?: number }>;
  logout: () => void;
  addToast: (title: string, message: string, type: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  selectLesson: (id: string | null) => void;
  watchVideo: (lessonId: string) => void;
  submitTest: (lessonId: string, score: number) => void;
  submitPdf: (lessonId: string, fileName: string) => Promise<void>;
  deleteProfile: () => Promise<string>;
  resetDatabase: () => void;
  updateProfile: (
    name: string,
    email: string,
    phone: string,
    gender: string,
    birthday: string,
    language: string,
    about: string,
    subscribeStatus: string
  ) => void;
  
  // Advanced Features Actions
  addVideoNote: (lessonId: string, timestampSeconds: number, text: string) => void;
  deleteVideoNote: (noteId: string) => void;
  submitReviewAnswer: (questionId: string, chosenOptionIndex: number) => { isCorrect: boolean; explanation: string; nextReviewInDays: number; xpEarned: number };
  
  // Social Actions
  sendMessageToFriend: (friendId: string, text: string) => void;
  simulateLivePresence: () => void;
  createBattleLobby: () => void;
  submitBattleAnswer: (chosenOptionIndex: number) => { isCorrect: boolean; pointsEarned: number; speedBonus: number };
  simulateBattleTurn: () => void;
  leaveBattle: () => void;

  // New Feature Actions
  toggleTheme: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

// Bootstrap initial databases in local storage
if (typeof window !== 'undefined') {
  initializeMockDB();
}

export const useLmsStore = create<LmsState>((set, get) => ({
  // Initial state loaded from LocalStorage or DB
  token: getFromStorage<string | null>('mathalama_token', null),
  role: getFromStorage<'student' | 'curator' | 'admin' | null>('mathalama_role', null),
  studentName: getFromStorage<string>('mathalama_student_name', 'Иван Смирнов'),
  studentEmail: getFromStorage<string>('mathalama_student_email', 'student@example.com'),
  studentTelegram: getFromStorage<string>('mathalama_student_telegram', '@student_go'),
  studentPhone: getFromStorage<string>('mathalama_student_phone', '+7 (777) 123-45-67'),
  studentGender: getFromStorage<string>('mathalama_student_gender', 'male'),
  studentBirthday: getFromStorage<string>('mathalama_student_birthday', '2002-05-15'),
  studentLanguage: getFromStorage<string>('mathalama_student_language', 'ru'),
  studentAbout: getFromStorage<string>('mathalama_student_about', 'Изучаю программирование и математику.'),
  studentSubscribeStatus: getFromStorage<string>('mathalama_student_subscribe_status', 'all'),
  isAuthenticated: !!getFromStorage<string | null>('mathalama_token', null),
  loginAttempts: 0,
  lockoutTime: null,

  courses: getFromStorage<any[]>('mathalama_courses', []),
  modules: getFromStorage<Module[]>('mathalama_modules', []),
  leaderboard: getFromStorage<LeaderboardEntry[]>('mathalama_leaderboard', []),
  heatmap: getFromStorage<ActivityDay[]>('mathalama_heatmap', []),
  streak: getFromStorage<number>('mathalama_streak', 14),
  selectedLessonId: 'lesson-2-uuid', // Default active lesson is Lesson 2

  videoNotes: getFromStorage<VideoNote[]>('mathalama_video_notes', []),
  spacedRepetitionStates: getFromStorage<SpacedRepetitionState[]>('mathalama_spaced_repetition_states', []),
  activeSessionQueue: [],
  
  friends: getFromStorage<Friend[]>('mathalama_friends', []),
  activeBattle: null,

  // New Features
  theme: getFromStorage<'light' | 'dark'>('mathalama_theme', 'light'),
  notifications: getFromStorage<Notification[]>('mathalama_notifications', []),
  certificates: getFromStorage<Certificate[]>('mathalama_certificates', []),
  weeklyXp: getFromStorage<WeeklyXpEntry[]>('mathalama_weekly_xp', []),

  toasts: [],
  isSubmittingPdf: false,
  pdfUploadProgress: 0,

  addToast: (title, message, type) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      toasts: [...state.toasts, { id, title, message, type }]
    }));
    // Auto-remove after 4 seconds
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  },

  login: async (email, password) => {
    const now = Date.now();
    const lockout = get().lockoutTime;
    
    // Check if locked out
    if (lockout && now < lockout) {
      const retryAfter = Math.ceil((lockout - now) / 1000);
      return { success: false, error: 'Too many requests. Please try again later.', retryAfter };
    }

    // Reset lockout if time has passed
    if (lockout && now >= lockout) {
      set({ lockoutTime: null, loginAttempts: 0 });
    }

    // 1. Emulate global rate-limiting (token bucket policy)
    // If more than 5 attempts, lockout for 30 seconds
    const attempts = get().loginAttempts + 1;
    set({ loginAttempts: attempts });

    if (attempts >= 5) {
      const lockDuration = 30 * 1000; // 30 seconds
      set({ lockoutTime: now + lockDuration });
      return { success: false, error: 'RATE_LIMIT_EXCEEDED: Too many login attempts. Locked out for 30s.', retryAfter: 30 };
    }

    // 2. Validate Credentials
    // Allow student@example.com / password
    if (email === 'student@example.com' && password === 'password') {
      const fakeToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjdXJyZW50LXN0dWRlbnQiLCJuYW1lIjoiSXZhbiIsImNvaG9ydCI6IkdvcGhlcnMtMjAyNiIsInJvbGUiOiJzdHVkZW50In0.signature';
      setToStorage('mathalama_token', fakeToken);
      setToStorage('mathalama_role', 'student');
      
      set({
        token: fakeToken,
        role: 'student',
        isAuthenticated: true,
        loginAttempts: 0,
        lockoutTime: null
      });

      get().addToast('Успешный вход!', 'Добро пожаловать в личный кабинет MathalamaEdu.', 'success');
      return { success: true };
    }

    return { success: false, error: 'Неверный логин или пароль. Попробуйте student@example.com / password' };
  },

  logout: () => {
    setToStorage('mathalama_token', null);
    setToStorage('mathalama_role', null);
    set({
      token: null,
      role: null,
      isAuthenticated: false
    });
    get().addToast('Выход из системы', 'Вы успешно вышли из своего аккаунта.', 'info');
  },

  selectLesson: (id) => {
    set({ selectedLessonId: id });
  },

  watchVideo: (lessonId) => {
    const modules = [...get().modules];
    let xpEarned = 0;
    let title = '';

    modules.forEach((mod) => {
      mod.lessons.forEach((les) => {
        if (les.id === lessonId) {
          title = les.title;
          if (!les.components.video_watched) {
            les.components.video_watched = true;
            xpEarned = 50; // Earn 50 XP for watching video
          }
        }
      });
    });

    if (xpEarned > 0) {
      // Save changes to storage
      setToStorage('mathalama_modules', modules);
      
      // Update XP in leaderboard and heatmap
      const leaderboard = get().leaderboard.map((student) => {
        if (student.isCurrentUser) {
          const newXP = student.xp_score + xpEarned;
          return { ...student, xp_score: newXP };
        }
        return student;
      }).sort((a, b) => b.xp_score - a.xp_score);
      // Re-calculate ranks
      leaderboard.forEach((st, idx) => { st.rank = idx + 1; });
      setToStorage('mathalama_leaderboard', leaderboard);

      // Log activity to heatmap
      const todayString = new Date().toISOString().split('T')[0];
      const heatmap = get().heatmap.map((day) => {
        if (day.date === todayString) {
          return {
            ...day,
            activity_count: day.activity_count + 1,
            xp_earned: day.xp_earned + xpEarned
          };
        }
        return day;
      });
      setToStorage('mathalama_heatmap', heatmap);

      set({
        modules,
        leaderboard,
        heatmap
      });

      get().addToast(
        'Прогресс видео сохранен',
        `Вы посмотрели видеолекцию "${title}" и заработали +${xpEarned} XP!`,
        'success'
      );
    }
  },

  submitTest: (lessonId, score) => {
    const modules = [...get().modules];
    let xpEarned = 0;
    let passed = score >= 70;
    let title = '';

    modules.forEach((mod) => {
      mod.lessons.forEach((les) => {
        if (les.id === lessonId) {
          title = les.title;
          const prevPassed = les.components.test.passed;
          les.components.test.passed = passed;
          les.components.test.score = score;

          if (passed && !prevPassed) {
            xpEarned = 150; // Earn 150 XP for passing test first time
          }
        }
      });
    });

    setToStorage('mathalama_modules', modules);

    if (xpEarned > 0) {
      const leaderboard = get().leaderboard.map((student) => {
        if (student.isCurrentUser) {
          return { ...student, xp_score: student.xp_score + xpEarned };
        }
        return student;
      }).sort((a, b) => b.xp_score - a.xp_score);
      leaderboard.forEach((st, idx) => { st.rank = idx + 1; });
      setToStorage('mathalama_leaderboard', leaderboard);

      const todayString = new Date().toISOString().split('T')[0];
      const heatmap = get().heatmap.map((day) => {
        if (day.date === todayString) {
          return {
            ...day,
            activity_count: day.activity_count + 1,
            xp_earned: day.xp_earned + xpEarned
          };
        }
        return day;
      });
      setToStorage('mathalama_heatmap', heatmap);

      set({ leaderboard, heatmap });
    }

    set({ modules });

    if (passed) {
      get().addToast(
        'Тест сдан!',
        `Результат: ${score}%. Заработано +${xpEarned || 0} XP. Шаг 3 (Конспект) разблокирован!`,
        'success'
      );
    } else {
      get().addToast(
        'Тест не пройден',
        `Ваш балл: ${score}%. Требуется минимум 70% правильных ответов. Попробуйте еще раз!`,
        'error'
      );
    }
  },

  submitPdf: async (lessonId, fileName) => {
    set({ isSubmittingPdf: true, pdfUploadProgress: 10 });
    
    // Simulate S3 presigned upload loading states
    await new Promise(resolve => setTimeout(resolve, 800));
    set({ pdfUploadProgress: 45 });
    
    // ClamAV simulated scan
    await new Promise(resolve => setTimeout(resolve, 1000));
    set({ pdfUploadProgress: 90 });
    
    await new Promise(resolve => setTimeout(resolve, 600));
    set({ isSubmittingPdf: false, pdfUploadProgress: 100 });

    const modules = [...get().modules];
    let title = '';

    modules.forEach((mod) => {
      mod.lessons.forEach((les) => {
        if (les.id === lessonId) {
          title = les.title;
          les.components.assignment.status = 'pending';
          les.components.assignment.file_url = `https://s3.mathalama.edu/submissions/2026/05/${fileName}`;
          les.components.assignment.feedback = undefined;
        }
      });
    });

    setToStorage('mathalama_modules', modules);
    set({ modules });

    get().addToast(
      'Файл успешно загружен',
      'Конспект сохранен в MinIO S3 и отправлен куратору в Telegram.',
      'success'
    );

    // Simulate curator reviewing the work in Telegram after 6 seconds!
    setTimeout(() => {
      const updatedModules = [...get().modules];
      let unlockedNext = false;
      let nextLessonTitle = '';

      updatedModules.forEach((mod) => {
        mod.lessons.forEach((les, idx) => {
          if (les.id === lessonId) {
            les.components.assignment.status = 'approved';
            les.components.assignment.feedback = 'Превосходная работа! Все формулы записаны правильно, конспект содержит детальный разбор кода. Следующий урок разблокирован!';
            les.status = 'completed';

            // Unlock next lesson in content dripping
            const nextLes = mod.lessons[idx + 1];
            if (nextLes) {
              nextLes.status = 'unlocked';
              unlockedNext = true;
              nextLessonTitle = nextLes.title;
            }
          }
        });
      });

      // Award XP for approved homework
      const xpBonus = 300; // Large XP award for homework
      const leaderboard = get().leaderboard.map((student) => {
        if (student.isCurrentUser) {
          return { ...student, xp_score: student.xp_score + xpBonus };
        }
        return student;
      }).sort((a, b) => b.xp_score - a.xp_score);
      leaderboard.forEach((st, idx) => { st.rank = idx + 1; });
      setToStorage('mathalama_leaderboard', leaderboard);

      const todayString = new Date().toISOString().split('T')[0];
      const heatmap = get().heatmap.map((day) => {
        if (day.date === todayString) {
          return {
            ...day,
            activity_count: day.activity_count + 1,
            xp_earned: day.xp_earned + xpBonus
          };
        }
        return day;
      });
      setToStorage('mathalama_heatmap', heatmap);

      setToStorage('mathalama_modules', updatedModules);

      set({
        modules: updatedModules,
        leaderboard,
        heatmap
      });

      get().addToast(
        'Домашняя работа проверена!',
        `Куратор одобрил ваш конспект по лекции "${title}". Получено +${xpBonus} XP!`,
        'success'
      );

      if (unlockedNext) {
        get().addToast(
          'Доступен новый урок',
          `Разблокирован урок: "${nextLessonTitle}"`,
          'info'
        );
      }
    }, 6000);
  },

  deleteProfile: async () => {
    // Simulates GDPR soft-lock deactivation
    return new Promise((resolve) => {
      setTimeout(() => {
        setToStorage('mathalama_token', null);
        setToStorage('mathalama_role', null);
        
        // Remove student from Leaderboard (anonymization)
        const leaderboard = get().leaderboard.filter(st => !st.isCurrentUser);
        setToStorage('mathalama_leaderboard', leaderboard);

        set({
          token: null,
          role: null,
          isAuthenticated: false,
          leaderboard
        });

        resolve('2026-06-06T21:58:00Z');
      }, 1500);
    });
  },

  resetDatabase: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('mathalama_courses');
    localStorage.removeItem('mathalama_modules');
    localStorage.removeItem('mathalama_leaderboard');
    localStorage.removeItem('mathalama_heatmap');
    localStorage.removeItem('mathalama_streak');
    localStorage.removeItem('mathalama_video_notes');
    localStorage.removeItem('mathalama_spaced_repetition_states');
    localStorage.removeItem('mathalama_friends');
    localStorage.removeItem('mathalama_notifications');
    localStorage.removeItem('mathalama_certificates');
    localStorage.removeItem('mathalama_weekly_xp');
    localStorage.removeItem('mathalama_student_name');
    localStorage.removeItem('mathalama_student_email');
    localStorage.removeItem('mathalama_student_telegram');
    localStorage.removeItem('mathalama_student_phone');
    localStorage.removeItem('mathalama_student_gender');
    localStorage.removeItem('mathalama_student_birthday');
    localStorage.removeItem('mathalama_student_language');
    localStorage.removeItem('mathalama_student_about');
    localStorage.removeItem('mathalama_student_subscribe_status');
    initializeMockDB();
    
    set({
      courses: getFromStorage<any[]>('mathalama_courses', []),
      modules: getFromStorage<Module[]>('mathalama_modules', []),
      leaderboard: getFromStorage<LeaderboardEntry[]>('mathalama_leaderboard', []),
      heatmap: getFromStorage<ActivityDay[]>('mathalama_heatmap', []),
      streak: getFromStorage<number>('mathalama_streak', 14),
      selectedLessonId: 'lesson-2-uuid',
      videoNotes: getFromStorage<VideoNote[]>('mathalama_video_notes', []),
      spacedRepetitionStates: getFromStorage<SpacedRepetitionState[]>('mathalama_spaced_repetition_states', []),
      activeSessionQueue: [],
      friends: getFromStorage<Friend[]>('mathalama_friends', []),
      activeBattle: null,
      notifications: getFromStorage<Notification[]>('mathalama_notifications', []),
      certificates: getFromStorage<Certificate[]>('mathalama_certificates', []),
      weeklyXp: getFromStorage<WeeklyXpEntry[]>('mathalama_weekly_xp', []),
      studentName: 'Иван Смирнов',
      studentEmail: 'student@example.com',
      studentTelegram: '@student_go',
      studentPhone: '+7 (777) 123-45-67',
      studentGender: 'male',
      studentBirthday: '2002-05-15',
      studentLanguage: 'ru',
      studentAbout: 'Изучаю программирование и математику.',
      studentSubscribeStatus: 'all',
    });

    get().addToast('База данных сброшена', 'Все данные возвращены к исходному mock-состоянию.', 'info');
  },

  updateProfile: (name, email, telegram) => {
    setToStorage('mathalama_student_name', name);
    setToStorage('mathalama_student_email', email);
    setToStorage('mathalama_student_telegram', telegram);
    set({
      studentName: name,
      studentEmail: email,
      studentTelegram: telegram
    });
    get().addToast('Профиль сохранен', 'Личные данные успешно обновлены.', 'success');
  },

  addVideoNote: (lessonId, timestampSeconds, text) => {
    const id = Math.random().toString(36).substring(7);
    const newNote: VideoNote = {
      id,
      lesson_id: lessonId,
      video_timestamp_seconds: timestampSeconds,
      note_text: text,
      created_at: new Date().toISOString()
    };
    const notes = [...get().videoNotes, newNote].sort((a, b) => a.video_timestamp_seconds - b.video_timestamp_seconds);
    setToStorage('mathalama_video_notes', notes);

    // Award +10 XP for writing notes
    const xpEarned = 10;
    const leaderboard = get().leaderboard.map((student) => {
      if (student.isCurrentUser) {
        return { ...student, xp_score: student.xp_score + xpEarned };
      }
      return student;
    }).sort((a, b) => b.xp_score - a.xp_score);
    leaderboard.forEach((st, idx) => { st.rank = idx + 1; });
    setToStorage('mathalama_leaderboard', leaderboard);

    const todayString = new Date().toISOString().split('T')[0];
    const heatmap = get().heatmap.map((day) => {
      if (day.date === todayString) {
        return {
          ...day,
          activity_count: day.activity_count + 1,
          xp_earned: day.xp_earned + xpEarned
        };
      }
      return day;
    });
    setToStorage('mathalama_heatmap', heatmap);

    set({ videoNotes: notes, leaderboard, heatmap });
    get().addToast('Заметка сохранена', 'Вы добавили конспект лекции с таймкодом (+10 XP)!', 'success');
  },

  deleteVideoNote: (noteId) => {
    const notes = get().videoNotes.filter(n => n.id !== noteId);
    setToStorage('mathalama_video_notes', notes);
    set({ videoNotes: notes });
    get().addToast('Заметка удалена', 'Вы удалили закладку из своего конспекта.', 'info');
  },

  submitReviewAnswer: (questionId, chosenOptionIndex) => {
    const poolItem = SPACED_REPETITION_POOL.find(q => q.id === questionId);
    if (!poolItem) return { isCorrect: false, explanation: '', nextReviewInDays: 0, xpEarned: 0 };

    const isCorrect = chosenOptionIndex === poolItem.correctOptionIndex;
    const states = [...get().spacedRepetitionStates];
    const stateIndex = states.findIndex(s => s.question_id === questionId);
    
    // Default initial parameters if state not found
    let state: SpacedRepetitionState = stateIndex !== -1 ? states[stateIndex] : {
      question_id: questionId,
      repetitions: 0,
      interval_days: 0,
      easiness_factor: 2.5,
      next_review_date: new Date().toISOString().split('T')[0]
    };

    let quality = 1;
    let xpEarned = 0;
    let inSessionRetry = get().activeSessionQueue.includes(questionId);

    if (isCorrect) {
      quality = inSessionRetry ? 3 : 5;
      xpEarned = inSessionRetry ? 5 : 15;
    } else {
      quality = 1;
      xpEarned = 0;
    }

    // SuperMemo-2 (SM2) Algorithm
    let ef = state.easiness_factor;
    let reps = state.repetitions;
    let interval = 1;

    if (quality < 3) {
      // Forgotten/wrong answer
      reps = 0;
      interval = 1;
      
      // Only penalize EF once per session, not on inside retries
      if (!inSessionRetry) {
        ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)); // ef - 0.54
      }
      if (ef < 1.3) ef = 1.3;
      ef = Math.round(ef * 100) / 100;

      // Update state
      state.repetitions = reps;
      state.interval_days = interval;
      state.easiness_factor = ef;
      // Scheduled for today (immediate retry in current active session)
      state.next_review_date = new Date().toISOString().split('T')[0];

      // Add to session queue
      if (!inSessionRetry) {
        set(prev => ({ activeSessionQueue: [...prev.activeSessionQueue, questionId] }));
      }
    } else {
      // Correct answer (quality >= 3)
      if (reps === 0) {
        interval = 1;
      } else if (reps === 1) {
        interval = 6;
      } else {
        interval = Math.round(state.interval_days * ef);
      }

      reps = reps + 1;
      ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      if (ef < 1.3) ef = 1.3;
      ef = Math.round(ef * 100) / 100;

      // Update state
      state.repetitions = reps;
      state.interval_days = interval;
      state.easiness_factor = ef;
      
      // Scheduled for FUTURE
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + interval);
      state.next_review_date = nextDate.toISOString().split('T')[0];

      // Remove from session queue
      set(prev => ({ activeSessionQueue: prev.activeSessionQueue.filter(id => id !== questionId) }));
    }

    // Save state back to DB
    if (stateIndex !== -1) {
      states[stateIndex] = state;
    } else {
      states.push(state);
    }
    setToStorage('mathalama_spaced_repetition_states', states);

    // Update global state & leaderboard if XP earned
    if (xpEarned > 0) {
      const leaderboard = get().leaderboard.map((student) => {
        if (student.isCurrentUser) {
          return { ...student, xp_score: student.xp_score + xpEarned };
        }
        return student;
      }).sort((a, b) => b.xp_score - a.xp_score);
      leaderboard.forEach((st, idx) => { st.rank = idx + 1; });
      setToStorage('mathalama_leaderboard', leaderboard);

      const todayString = new Date().toISOString().split('T')[0];
      const heatmap = get().heatmap.map((day) => {
        if (day.date === todayString) {
          return {
            ...day,
            activity_count: day.activity_count + 1,
            xp_earned: day.xp_earned + xpEarned
          };
        }
        return day;
      });
      setToStorage('mathalama_heatmap', heatmap);

      set({ spacedRepetitionStates: states, leaderboard, heatmap });
    } else {
      set({ spacedRepetitionStates: states });
    }

    return {
      isCorrect,
      explanation: poolItem.explanation,
      nextReviewInDays: isCorrect ? interval : 0,
      xpEarned
    };
  },

  sendMessageToFriend: (friendId, text) => {
    const friends = [...get().friends];
    const friendIdx = friends.findIndex(f => f.id === friendId);
    if (friendIdx === -1) return;

    const newMsg = { senderId: "current-student", text, timestamp: new Date().toISOString() };
    const updatedHistory = [...friends[friendIdx].chatHistory, newMsg];
    
    friends[friendIdx] = {
      ...friends[friendIdx],
      chatHistory: updatedHistory
    };

    set({ friends });
    setToStorage('mathalama_friends', friends);

    // Dynamic mock auto-reply after 1.5 seconds
    setTimeout(() => {
      const liveFriends = [...get().friends];
      const liveIdx = liveFriends.findIndex(f => f.id === friendId);
      if (liveIdx === -1) return;

      const replies = [
        "Ого, круто! Давай продолжай!",
        "Я как раз застряла на 3-м вопросе, поможешь потом?",
        "Тоже сейчас учу тему слайсов в Go, очень интересно!",
        "Ха-ха, прикольно. Ладно, я пойду дальше видео смотреть.",
        "Удачи! Давай батл устроим на Арене?"
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const replyMsg = { senderId: friendId, text: randomReply, timestamp: new Date().toISOString() };

      liveFriends[liveIdx] = {
        ...liveFriends[liveIdx],
        chatHistory: [...liveFriends[liveIdx].chatHistory, replyMsg]
      };

      set({ friends: liveFriends });
      setToStorage('mathalama_friends', liveFriends);
      get().addToast(`Сообщение от ${liveFriends[liveIdx].name}`, randomReply, 'info');
    }, 1500);
  },

  simulateLivePresence: () => {
    const friends = [...get().friends];
    if (friends.length === 0) return;
    const randomIndex = Math.floor(Math.random() * friends.length);
    const statuses: ('online' | 'offline' | 'watching_video' | 'doing_quiz')[] = [
      'online', 'offline', 'watching_video', 'doing_quiz'
    ];
    const contexts = {
      online: "Изучает теорию Урока 1",
      offline: "Вне сети (5 мин назад)",
      watching_video: "Смотрит Урок 2. Структуры и слайсы",
      doing_quiz: "Проходит тест Урока 2"
    };
    const randStatus = statuses[Math.floor(Math.random() * statuses.length)];
    friends[randomIndex] = {
      ...friends[randomIndex],
      presenceStatus: randStatus,
      presenceContext: contexts[randStatus]
    };
    setToStorage('mathalama_friends', friends);
    set({ friends });
  },

  createBattleLobby: () => {
    const code = `BATTLE-${Math.floor(100 + Math.random() * 900)}`;
    const friends = get().friends;
    
    // Assemble lobby with user + 7 AI friends
    const participants: BattleParticipant[] = [
      {
        friendId: "current-student",
        name: "Иван Смирнов (Вы)",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        score: 0,
        answers: [],
        speedBonusTotal: 0,
        isCurrentUser: true
      },
      ...friends.slice(0, 5).map(f => ({
        friendId: f.id,
        name: f.name,
        avatar: f.avatar,
        score: 0,
        answers: [],
        speedBonusTotal: 0
      }))
    ];

    set({
      activeBattle: {
        lobbyCode: code,
        participants,
        currentQuestionIndex: 0,
        status: 'lobby',
        timer: 15,
        playerSpeedBonusSeconds: 0
      }
    });

    get().addToast('Создано лобби соревнований', `Участники подключаются к комнате ${code}...`, 'success');
  },

  submitBattleAnswer: (chosenOptionIndex) => {
    const battle = get().activeBattle;
    if (!battle || battle.status !== 'battle') return { isCorrect: false, pointsEarned: 0, speedBonus: 0 };

    const poolItem = SPACED_REPETITION_POOL[battle.currentQuestionIndex];
    const isCorrect = chosenOptionIndex === poolItem.correctOptionIndex;

    const points = isCorrect ? 100 : 0;
    const speedBonus = isCorrect ? Math.round(battle.timer * 6) : 0;
    const totalPoints = points + speedBonus;

    const updatedParticipants = battle.participants.map(p => {
      if (p.isCurrentUser) {
        return {
          ...p,
          score: p.score + totalPoints,
          speedBonusTotal: p.speedBonusTotal + speedBonus,
          answers: [...p.answers, isCorrect]
        };
      }
      return p;
    });

    set({
      activeBattle: {
        ...battle,
        participants: updatedParticipants
      }
    });

    // Trigger AI round calculations
    get().simulateBattleTurn();

    return { isCorrect, pointsEarned: points, speedBonus };
  },

  simulateBattleTurn: () => {
    const battle = get().activeBattle;
    if (!battle) return;

    const nextIdx = battle.currentQuestionIndex + 1;

    // Simulate other AI participants
    const updatedParticipants = battle.participants.map(p => {
      if (p.isCurrentUser) return p;

      // AI correct answer probability (75%)
      const botCorrect = Math.random() > 0.25;
      const points = botCorrect ? 100 : 0;
      const randomSpeed = botCorrect ? Math.floor(Math.random() * 15) : 0;
      const speedBonus = botCorrect ? randomSpeed * 6 : 0;

      return {
        ...p,
        score: p.score + points + speedBonus,
        speedBonusTotal: p.speedBonusTotal + speedBonus,
        answers: [...p.answers, botCorrect]
      };
    });

    // Sort dynamically by score descending
    const sortedParticipants = [...updatedParticipants].sort((a, b) => b.score - a.score);

    if (nextIdx < 5) {
      set({
        activeBattle: {
          ...battle,
          currentQuestionIndex: nextIdx,
          participants: sortedParticipants,
          timer: 15
        }
      });
    } else {
      // Podium Finish!
      set({
        activeBattle: {
          ...battle,
          participants: sortedParticipants,
          status: 'podium'
        }
      });

      // Find player finish position
      const playerRank = sortedParticipants.findIndex(p => p.isCurrentUser) + 1;
      let xpPrize = 20;
      let medalToast = 'Вы приняли участие в батле! +20 XP';
      if (playerRank === 1) {
        xpPrize = 100;
        medalToast = '1-е Место на Арене! Вы царь горы! +100 XP!';
      } else if (playerRank === 2) {
        xpPrize = 75;
        medalToast = '2-е Место на Арене! Прекрасная скорость! +75 XP!';
      } else if (playerRank === 3) {
        xpPrize = 50;
        medalToast = '3-е Место на Арене! Бронзовый призер! +50 XP!';
      }

      get().addToast('Соревнование завершено', medalToast, 'success');

      // Update student overall profile XP score & heatmap activity
      const leaderboard = get().leaderboard.map(student => {
        if (student.isCurrentUser) {
          return { ...student, xp_score: student.xp_score + xpPrize };
        }
        return student;
      }).sort((a, b) => b.xp_score - a.xp_score);
      leaderboard.forEach((st, idx) => { st.rank = idx + 1; });
      setToStorage('mathalama_leaderboard', leaderboard);

      const todayString = new Date().toISOString().split('T')[0];
      const heatmap = get().heatmap.map(day => {
        if (day.date === todayString) {
          return {
            ...day,
            activity_count: day.activity_count + 1,
            xp_earned: day.xp_earned + xpPrize
          };
        }
        return day;
      });
      setToStorage('mathalama_heatmap', heatmap);

      set({ leaderboard, heatmap });
    }
  },

  leaveBattle: () => {
    set({ activeBattle: null });
  },

  // ── New Feature Actions ──
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    setToStorage('mathalama_theme', newTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
    set({ theme: newTheme });
  },

  markNotificationRead: (id) => {
    const notifications = get().notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    setToStorage('mathalama_notifications', notifications);
    set({ notifications });
  },

  markAllNotificationsRead: () => {
    const notifications = get().notifications.map(n => ({ ...n, read: true }));
    setToStorage('mathalama_notifications', notifications);
    set({ notifications });
    get().addToast('Уведомления', 'Все уведомления отмечены как прочитанные.', 'info');
  },
}));
