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
  CloudLightning 
} from 'lucide-react';

interface VideoPlayerProps {
  lessonId: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ lessonId }) => {
  const { 
    modules, 
    watchVideo 
  } = useLmsStore();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // in seconds
  const [volume, setVolume] = useState(80);
  const [isSaving, setIsSaving] = useState(false);
  
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
          <h3 className="text-xl font-bold text-zinc-900 font-outfit mt-1.5 truncate max-w-xl">
            {lessonTitle}
          </h3>
        </div>
        
        {isVideoWatched && (
          <span className="self-start sm:self-center text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold">
            ✓ Просмотрено
          </span>
        )}
      </div>

      <div className="flex flex-col space-y-4">
        {/* Full Width Video Player */}
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
    </motion.div>
  );
};
