import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Compare } from '@/components/compare/compare';

export const metadata: Metadata = { title: 'Comparação' };

export default function CompararPage() {
  return (
    <Suspense>
      <Compare />
    </Suspense>
  );
}
