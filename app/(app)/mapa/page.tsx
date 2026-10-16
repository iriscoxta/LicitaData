import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CompaniesMap } from '@/components/map/companies-map';

export const metadata: Metadata = { title: 'Mapa de empresas' };

export default function MapaPage() {
  return (
    <Suspense>
      <CompaniesMap />
    </Suspense>
  );
}
