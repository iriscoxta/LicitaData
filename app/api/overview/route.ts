import type { NextRequest } from 'next/server';
import { mockOverview } from '@/lib/mock/overview';
import { byTce, MUNICIPALITIES } from '@/lib/municipalities';
import { backend, liveOrDemo } from '@/lib/server/backend';
import type { MunicipalOverview } from '@/lib/types';

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const municipality = byTce(search.get('municipio')) ?? MUNICIPALITIES[0]!;
  const year = /^\d{4}$/.test(search.get('ano') ?? '') ? search.get('ano')! : '2025';

  const query = new URLSearchParams({
    data_inicial: `${year}-01-01`,
    data_final: `${year}-12-31`,
    codigo_municipio: municipality.tce,
  });
  // sic: a rota oficial do backend é "munipal"
  const result = await backend<MunicipalOverview>(`/analytics/tce/overview/munipal?${query}`);
  return liveOrDemo(result, () => mockOverview(municipality.tce, year));
}
