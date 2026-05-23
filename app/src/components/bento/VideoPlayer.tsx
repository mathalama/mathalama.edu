import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLmsStore } from '../../store/useLmsStore';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Maximize, 
  Settings, 
  CloudLightning, 
  Bookmark, 
  Trash2, 
  Keyboard, 
  Plus 
} from 'lucide-react';

interface VideoPlayerProps {
  lessonId: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ lessonId }) => {
  const { 
    modules, 
    watchVideo, 
    videoNotes, 
    addVideoNote, 
    deleteVideoNote 
  } = useLmsStore();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // in seconds
  const [volume, setVolume] = useState(80);
  const [isSaving, setIsSaving] = useState(false);
  
  // Note creation modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [modalSec, setModalSec] = useState(0);
  const modalInputRef = useRef<HTMLTextAreaElement>(null);
  
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Find current lesson title and video details
  let lessonTitle = 'Загрузка...';
  let videoId = '';
  let isVideoWatched = false;

  modules.forEach((mod) => {
    mod.lessons.forEach((les) => {
      if (les.id === lessonId) {
        lessonTitle = les.title;
        videoId = les.video_id;
        isVideoWatched = les.components.video_watched;
      }
    });
  });

  const duration = 240; // Simulated video length: 4 minutes (240s)

  // Hotkey listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPlaying(false); // Pause video
        setModalSec(progress);
        setIsModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [progress]);

  // Focus modal textarea on open
  useEffect(() => {
    if (isModalOpen && modalInputRef.current) {
      setTimeout(() => {
        modalInputRef.current?.focus();
      }, 100);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          const next = prev + 1;
          
          // Send progress ping every 15 seconds
          if (next > 0 && next % 15 === 0) {
            setIsSaving(true);
            watchVideo(lessonId);
            setTimeout(() => {
              setIsSaving(false);
            }, 1500);
          }
          
          return next;
        });
      }, 1000);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, lessonId, watchVideo]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setProgress(0);
    setIsPlaying(false);
  };

  const handleSeek = (seconds: number) => {
    setProgress(seconds);
    setIsPlaying(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    addVideoNote(lessonId, modalSec, noteText);
    setNoteText('');
    setIsModalOpen(false);
    setIsPlaying(true); // Resume playing
  };

  // Filter notes belonging to the current lesson
  const currentNotes = videoNotes.filter((note) => note.lesson_id === lessonId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
        <div>
          <span className="text-[10px] bg-brand-light text-brand px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
            Видеолекция
          </span>
          <h3 className="text-xl font-bold text-zinc-900 font-outfit mt-1.5 truncate max-w-[320px] sm:max-w-md">
            {lessonTitle}
          </h3>
        </div>
        
        {isVideoWatched && (
          <span className="self-start sm:self-center text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold">
            ✓ Просмотрено
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Video Player (Bento Card component 1) */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <div className="relative aspect-video rounded-bento-inner overflow-hidden bg-zinc-950 border border-zinc-100 group shadow-inner">
            {/* Fake Video Screen */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent flex flex-col items-center justify-center">
              {/* Centered play/pause button (large) */}
              <button
                onClick={togglePlay}
                className="w-16 h-16 bg-white/95 text-brand rounded-full flex items-center justify-center shadow-2xl hover:scale-105 hover:bg-white active:scale-95 transition-transform duration-200 z-10 cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-current text-brand" />
                ) : (
                  <Play className="w-7 h-7 fill-current text-brand translate-x-[2px]" />
                )}
              </button>
              
              <div className="absolute top-4 left-4 text-xs font-bold text-zinc-400 bg-zinc-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg">
                Kinoscope ID: {videoId || 'kino-992a'}
              </div>

              <div className="absolute bottom-16 right-4 hidden md:flex items-center space-x-1.5 text-[10px] text-zinc-300 bg-zinc-900/60 backdrop-blur-md px-2.5 py-1 rounded-md">
                <Keyboard className="w-3.5 h-3.5" />
                <span>Cmd + K для быстрой заметки</span>
              </div>
            </div>

            {/* Video Control Bar */}
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex flex-col space-y-3 opacity-90 group-hover:opacity-100 transition-opacity">
              
              {/* Timeline */}
              <div className="flex items-center space-x-3">
                <span className="text-[10px] text-zinc-300 font-bold tabular-nums">
                  {formatTime(progress)}
                </span>
                <div 
                  className="flex-1 h-1.5 bg-white/20 rounded-full relative cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percent = clickX / rect.width;
                    handleSeek(Math.floor(percent * duration));
                  }}
                >
                  <div 
                    className="h-full bg-brand rounded-full relative" 
                    style={{ width: `${(progress / duration) * 100}%` }}
                  >
                    <div className="w-3 h-3 bg-white rounded-full absolute -right-1.5 -top-0.75 shadow-md scale-0 group-hover:scale-100 transition-transform"></div>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-300 font-bold tabular-nums">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-white">
                  <button onClick={togglePlay} className="hover:text-brand cursor-pointer">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button onClick={handleReset} className="hover:text-brand cursor-pointer" title="Сбросить прогресс">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  
                  <div className="flex items-center space-x-1.5 group/volume">
                    <Volume2 className="w-4 h-4 text-zinc-300 hover:text-white" />
                    <div className="w-12 h-1 bg-white/30 rounded-full overflow-hidden cursor-pointer">
                      <div className="h-full bg-white rounded-full" style={{ width: `${volume}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-zinc-300">
                  <Settings className="w-4 h-4 hover:text-white cursor-pointer" />
                  <Maximize className="w-4 h-4 hover:text-white cursor-pointer" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CloudLightning className="w-3.5 h-3.5 text-zinc-400" />
              <span>Пик-фильтр автосохранения прогресса в Redis активен (шаг 15 сек)</span>
            </span>
            <AnimatePresence>
              {isSaving && (
                <motion.span
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  className="text-emerald-500 font-bold flex items-center space-x-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Сохранение прогресса в Redis...</span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Timestamped Notes Panel (Bento Card component 2) */}
        <div className="bg-white border border-zinc-100 rounded-bento-inner p-4 shadow-bento flex flex-col h-full min-h-[280px] lg:h-auto">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center space-x-2">
              <Bookmark className="w-4 h-4 text-brand" />
              <h4 className="text-sm font-bold text-zinc-900 font-outfit">
                Мой конспект
              </h4>
            </div>
            <span className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full font-bold">
              {currentNotes.length} закл.
            </span>
          </div>

          {/* List of bookmarks */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[220px] lg:max-h-[170px] scrollbar-thin">
            {currentNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                <span className="w-8 h-8 rounded-full bg-zinc-50 text-zinc-400 flex items-center justify-center text-xs">✍</span>
                <p className="text-[11px] text-zinc-400 font-medium leading-relaxed max-w-[160px]">
                  У вас пока нет заметок. Сделайте первую на важном моменте видео!
                </p>
              </div>
            ) : (
              currentNotes.map((note) => (
                <div 
                  key={note.id} 
                  className="group relative p-2.5 bg-zinc-50 border border-zinc-100 rounded-xl hover:bg-zinc-100/50 hover:border-zinc-200 transition-all flex flex-col space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleSeek(note.video_timestamp_seconds)}
                      className="text-[10px] font-bold text-brand hover:underline flex items-center space-x-1 text-left"
                    >
                      <span>⏱ {formatTime(note.video_timestamp_seconds)}</span>
                    </button>
                    <button
                      onClick={() => deleteVideoNote(note.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded cursor-pointer"
                      title="Удалить заметку"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-700 font-medium leading-relaxed">
                    {note.note_text}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Quick Note Button */}
          <button
            onClick={() => {
              setIsPlaying(false);
              setModalSec(progress);
              setIsModalOpen(true);
            }}
            className="mt-3.5 w-full bg-brand text-white hover:bg-brand-dark active:scale-[0.98] py-2 px-3 rounded-xl text-xs font-bold font-outfit transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Добавить заметку ({formatTime(progress)})</span>
          </button>
        </div>
      </div>

      {/* Glassmorphic Note Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsModalOpen(false); setIsPlaying(true); }}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white border border-zinc-100 rounded-bento p-6 max-w-md w-full shadow-bento-large relative z-10 space-y-4"
            >
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-brand-light text-brand px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                  ⏱ Таймкод {formatTime(modalSec)}
                </span>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-zinc-900 font-outfit">
                  Сделать закладку лекции
                </h4>
                <p className="text-xs text-zinc-400 font-medium">
                  Запишите важный тезис лектора или формулу. За это вы получите +10 XP!
                </p>
              </div>

              <textarea
                ref={modalInputRef}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Например: В Go слайсы расширяются с помощью append(), при этом емкость удваивается при переполнении..."
                rows={4}
                maxLength={200}
                className="w-full bg-zinc-50 border border-zinc-100 focus:border-zinc-200 rounded-xl p-3.5 text-xs text-zinc-800 font-medium focus:outline-none transition-all placeholder:text-zinc-400/80 resize-none leading-relaxed"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveNote();
                  }
                }}
              />

              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-semibold px-0.5">
                <span>{noteText.length}/200 символов</span>
                <span>Enter для сохранения</span>
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  onClick={() => { setIsModalOpen(false); setIsPlaying(true); }}
                  className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-600 rounded-xl transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSaveNote}
                  disabled={!noteText.trim()}
                  className="px-4 py-2 bg-brand text-white hover:bg-brand-dark disabled:bg-zinc-100 disabled:text-zinc-300 py-2.5 px-4 rounded-xl text-xs font-bold font-outfit transition-all cursor-pointer shadow-sm shadow-brand/10"
                >
                  Сохранить заметку
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
