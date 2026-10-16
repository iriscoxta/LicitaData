import type { NextRequest } from 'next/server';
import { mockComparison } from '@/lib/mock/comparison';
import { backend, liveOrDemo, sourced } from '@/lib/server/backend';
import type { ComparisonRequest, ComparisonResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as ComparisonRequest | null;
  if (!body?.left?.filters || !body?.right?.filters) {
    return sourced({ error: { message: 'Requisição de comparação inválida.' } }, 'live', undefined, 400);
  }
  const result = await backend<ComparisonResponse>('/analytics/tce/comparisons', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return liveOrDemo(result, () => mockComparison(body));
}
