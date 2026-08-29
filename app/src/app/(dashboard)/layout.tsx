'use client';

import React from 'react';
import { DashboardLayout } from '@/components/ui/DashboardLayout';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
