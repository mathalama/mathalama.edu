'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLmsStore } from '../store/useLmsStore';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated } = useLmsStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
      <div className="flex flex-col items-center space-y-3">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold animate-pulse" style={{ color: 'var(--text-secondary)' }}>Проверка авторизации...</span>
      </div>
    </div>
  );
}
