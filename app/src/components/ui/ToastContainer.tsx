'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLmsStore } from '../../store/useLmsStore';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useLmsStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-4.5 h-4.5 text-rose-500" />;
      default:
        return <Info className="w-4.5 h-4.5 text-blue-500" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-emerald-100 bg-emerald-50/80';
      case 'error':
        return 'border-rose-100 bg-rose-50/80';
      default:
        return 'border-blue-100 bg-blue-50/80';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-xl border backdrop-blur-md shadow-lg ${getBorderColor(
              toast.type
            )}`}
          >
            <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-zinc-950 font-outfit">{toast.title}</h5>
              <p className="text-[10px] text-zinc-600 font-medium leading-normal mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
