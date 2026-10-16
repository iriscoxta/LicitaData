import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Dashboard } from '@/components/dashboard/dashboard';

export const metadata: Metadata = { title: 'Painel' };

export default function PainelPage() {
  return (
    <Suspense>
      <Dashboard />
    </Suspense>
  );
}
