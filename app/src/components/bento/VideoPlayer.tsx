'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLmsStore } from '../../store/useLmsStore';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Sparkles,
  Bookmark,
  Plus,
  Clock,
  Gauge,
  CheckCircle2
} from 'lucide-react';

interface VideoPlayerProps {
  lessonId: string;
  onSeekRequested?: (seconds: number) => void;
  externalSeek?: number | null;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ lessonId, onSeekRequested, externalSeek }) => {
  const { modules, watchVideo, addVideoNote } = useLmsStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // in seconds
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [isSavedPing, setIsSavedPing] = useState(false);

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

  const duration = 300; // Simulated video length: 5 minutes (300s)

  // Chapters / Timestamps of the lesson
  const chapters = [
    { title: 'Введение & Цели урока', start: 0 },
    { title: 'Базовая теория и понятия', start: 60 },
    { title: 'Практические примеры', start: 150 },
    { title: 'Разбор частых ошибок', start: 230 },
  ];

  // Handle external seek requests from notes
  useEffect(() => {
    if (externalSeek !== undefined && externalSeek !== null) {
      setProgress(externalSeek);
      setIsPlaying(true);
    }
  }, [externalSeek]);

  // Video playback simulation with custom playback rate
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.round(1000 / playbackSpeed);
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            watchVideo(lessonId);
            return duration;
          }
          const next = prev + 1;

          // Auto-save watch progress
          if (next > 0 && next % 20 === 0) {
            setIsSavedPing(true);
            watchVideo(lessonId);
            setTimeout(() => setIsSavedPing(false), 2000);
          }

          return next;
        });
      }, intervalMs);
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
  }, [isPlaying, lessonId, playbackSpeed, watchVideo]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setProgress(0);
    setIsPlaying(false);
  };

  const handleSeek = (seconds: number) => {
    setProgress(seconds);
    if (onSeekRequested) onSeekRequested(seconds);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSaveQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addVideoNote(lessonId, progress, newNoteText.trim());
    setNewNoteText('');
    setShowNoteInput(false);
  };

  const currentChapter = [...chapters].reverse().find((c) => progress >= c.start) || chapters[0];

  return (
    <div className="space-y-3.5 w-full">
      {/* Video Screen Container */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800 group shadow-lg">
        {/* Screen overlay & play center */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-black/30 flex flex-col justify-between p-4 z-10">
          
          {/* Top Bar inside Player */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/10">
                {currentChapter.title}
              </span>
              {isVideoWatched && (
                <span className="text-[11px] font-bold bg-emerald-500/80 text-white px-2.5 py-1 rounded-full flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Просмотрено</span>
                </span>
              )}
            </div>

            <AnimatePresence>
              {isSavedPing && (
                <motion.span
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] font-bold bg-emerald-500/90 text-white px-2.5 py-1 rounded-full flex items-center space-x-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>Прогресс сохранен</span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Center Play Button */}
          <div className="flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-brand/90 hover:bg-brand text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-sm"
              aria-label={isPlaying ? 'Пауза' : 'Воспроизведение'}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-current" />
              ) : (
                <Play className="w-7 h-7 fill-current translate-x-0.5" />
              )}
            </button>
          </div>

          {/* Bottom Control Bar */}
          <div className="space-y-2.5">
            {/* Timeline Bar */}
            <div className="flex items-center space-x-3">
              <span className="text-xs text-white font-mono font-bold tabular-nums">
                {formatTime(progress)}
              </span>

              <div
                className="flex-1 h-2 bg-white/25 hover:h-2.5 rounded-full relative cursor-pointer transition-all"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const percent = Math.max(0, Math.min(1, clickX / rect.width));
                  handleSeek(Math.floor(percent * duration));
                }}
              >
                <div
                  className="h-full bg-brand rounded-full relative transition-all"
                  style={{ width: `${(progress / duration) * 100}%` }}
                >
                  <div className="w-3.5 h-3.5 bg-white rounded-full absolute -right-1.5 -top-0.5 shadow-md" />
                </div>

                {/* Chapter Markers */}
                {chapters.map((ch, idx) => {
                  if (idx === 0) return null;
                  const leftPercent = (ch.start / duration) * 100;
                  return (
                    <div
                      key={ch.start}
                      title={ch.title}
                      style={{ left: `${leftPercent}%` }}
                      className="absolute top-0 bottom-0 w-0.5 bg-white/60 pointer-events-none"
                    />
                  );
                })}
              </div>

              <span className="text-xs text-white/80 font-mono font-bold tabular-nums">
                {formatTime(duration)}
              </span>
            </div>

            {/* Bottom Buttons Bar */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePlay}
                  className="p-1.5 hover:text-brand transition-colors cursor-pointer"
                  title={isPlaying ? 'Пауза' : 'Воспроизведение'}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>

                <button
                  onClick={handleReset}
                  className="p-1.5 hover:text-brand transition-colors cursor-pointer"
                  title="Начать сначала"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Volume */}
                <div className="flex items-center space-x-1.5 group/vol">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 hover:text-brand transition-colors cursor-pointer"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <div
                    className="w-14 h-1.5 bg-white/30 rounded-full cursor-pointer relative"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const vol = Math.max(0, Math.min(100, Math.round((clickX / rect.width) * 100)));
                      setVolume(vol);
                      setIsMuted(false);
                    }}
                  >
                    <div
                      className="h-full bg-white rounded-full"
                      style={{ width: `${isMuted ? 0 : volume}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 relative">
                {/* Add note quick button */}
                <button
                  onClick={() => setShowNoteInput(!showNoteInput)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-bold transition-colors cursor-pointer"
                  title="Добавить заметку на этой секунде"
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Заметка ({formatTime(progress)})</span>
                </button>

                {/* Speed selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-bold font-mono transition-colors cursor-pointer"
                  >
                    <Gauge className="w-3.5 h-3.5" />
                    <span>{playbackSpeed}x</span>
                  </button>

                  {showSpeedMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-zinc-900 border border-zinc-700 rounded-xl p-1 shadow-2xl flex flex-col space-y-1 z-30 min-w-[75px]">
                      {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => {
                            setPlaybackSpeed(spd);
                            setShowSpeedMenu(false);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold font-mono text-left transition-colors cursor-pointer ${
                            playbackSpeed === spd
                              ? 'bg-brand text-white'
                              : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Quick Select Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
        <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
          <Clock className="w-3 h-3" /> Темы:
        </span>
        {chapters.map((ch) => {
          const isActive = currentChapter.start === ch.start;
          return (
            <button
              key={ch.start}
              onClick={() => handleSeek(ch.start)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 border ${
                isActive
                  ? 'bg-brand text-white border-brand shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <span className="text-[10px] opacity-75 font-mono">{formatTime(ch.start)}</span>
              <span>{ch.title}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Add Note Form Popover */}
      <AnimatePresence>
        {showNoteInput && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSaveQuickNote}
            className="p-3.5 rounded-2xl border space-y-2.5 overflow-hidden"
            style={{ background: 'var(--surface-hover)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              <span className="flex items-center space-x-1.5">
                <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                <span>Заметка к таймкоду {formatTime(progress)}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowNoteInput(false)}
                className="text-[11px] text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                Отмена
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Запишите важное правило, формулу или мысль учителя..."
                className="flex-1 px-3.5 py-2 rounded-xl text-xs border outline-none focus:border-brand"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                autoFocus
              />
              <button
                type="submit"
                disabled={!newNoteText.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-dark transition-all disabled:opacity-40 cursor-pointer flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Сохранить</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};
