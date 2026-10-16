import type { NextRequest } from 'next/server';
import { mockSuppliers } from '@/lib/mock/suppliers';
import { byTce, MUNICIPALITIES } from '@/lib/municipalities';
import { backend, liveOrDemo } from '@/lib/server/backend';
import type { SupplierListResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const municipality = byTce(search.get('municipio')) ?? MUNICIPALITIES[0]!;
  const year = /^\d{4}$/.test(search.get('ano') ?? '') ? search.get('ano')! : '2025';

  const query = new URLSearchParams({
    uf: 'CE',
    municipality_tce_code: municipality.tce,
    start_date: `${year}-01-01`,
    end_date: `${year}-12-31`,
    page: '1',
    page_size: '20',
    sort_by: 'net_value',
    sort_order: 'desc',
  });
  const result = await backend<SupplierListResponse>(`/analytics/tce/fornecedores?${query}`);
  return liveOrDemo(result, () => mockSuppliers(municipality.tce, year));
}
