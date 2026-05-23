'use client';

import { useEffect } from 'react';
import { useLmsStore } from '@/store/useLmsStore';

export const ThemeInitializer: React.FC = () => {
  const theme = useLmsStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return null;
};
