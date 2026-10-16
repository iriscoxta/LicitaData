import { monthShort } from './format';
import type { MunicipalOverview } from './types';
import type { TagTone } from '@/components/ui/tag';

export const SIZE_META: Record<string, { label: string; color: string; tone: TagTone }> = {
  ME: { label: 'Microempresa', color: 'var(--data-2)', tone: 'green' },
  MEI: { label: 'MEI', color: 'var(--data-5)', tone: 'teal' },
  EPP: { label: 'EPP', color: 'var(--data-3)', tone: 'sky' },
  OUTROS_PORTES: { label: 'Outros portes', color: 'var(--data-1)', tone: 'violet' },
  NAO_IDENTIFICADO: { label: 'Não identificado', color: 'var(--data-4)', tone: 'gray' },
};

export const DESTINATION_META: Record<string, { label: string; color: string; tone: TagTone }> = {
  NO_MUNICIPIO_COMPRADOR: { label: 'No município comprador', color: 'var(--data-1)', tone: 'blue' },
  EM_OUTRO_MUNICIPIO: { label: 'Outro município do CE', color: 'var(--data-2)', tone: 'green' },
  FORA_DO_CEARA: { label: 'Fora do Ceará', color: 'var(--data-3)', tone: 'amber' },
  ORIGEM_NAO_IDENTIFICADA: { label: 'Origem não identificada', color: 'var(--data-4)', tone: 'rose' },
};

export const EXPENSE_COLORS = ['var(--data-1)', 'var(--data-2)', 'var(--data-3)', 'var(--data-4)', 'var(--data-5)', 'var(--data-6)', 'var(--data-7)'];

export function overviewView(data: MunicipalOverview) {
  const monthly = (data.evolucao_compras_consideradas ?? []).map((item) => ({
    period: item.periodo ?? '',
    label: monthShort(item.periodo ?? ''),
    total: item.compras_consideradas_centavos ?? 0,
    me: item.microempresas_centavos ?? 0,
  }));
  const total =
    data.kpis?.total_compras_centavos ?? monthly.reduce((sum, item) => sum + item.total, 0);

  const sizes = (data.participacao_por_porte_empresarial ?? []).map((item) => {
    const key = item.porte ?? 'NAO_IDENTIFICADO';
    const meta = SIZE_META[key] ?? { label: key, color: 'var(--data-6)', tone: 'gray' as TagTone };
    return { key, ...meta, value: item.valor_centavos ?? 0, percent: item.percentual ?? 0 };
  });

  const expenses = [...(data.elementos_despesa ?? [])]
    .map((item, index) => ({
      code: item.codigo ?? '',
      name: item.nome ?? item.codigo ?? '—',
      value: item.valor_liquido_centavos ?? 0,
      color: EXPENSE_COLORS[index % EXPENSE_COLORS.length]!,
    }))
    .sort((a, b) => b.value - a.value);

  const destinations = (data.destino_recursos ?? []).map((item) => {
    const key = item.destino ?? 'ORIGEM_NAO_IDENTIFICADA';
    const meta = DESTINATION_META[key] ?? { label: key, color: 'var(--data-6)', tone: 'gray' as TagTone };
    return { key, ...meta, value: item.valor_centavos ?? 0, percent: item.percentual ?? 0 };
  });

  const peak = monthly.reduce<(typeof monthly)[number] | null>((best, item) => (!best || item.total > best.total ? item : best), null);
  const published = data.competencias_publicadas?.length ?? 0;
  const requested = data.competencias_solicitadas?.length ?? 0;

  return {
    municipality: data.municipio?.nome ?? '—',
    status: data.status_exercicio ?? null,
    total,
    mePercent: data.kpis?.percentual_participacao_me ?? null,
    meTotal: data.kpis?.total_compras_ME_centavos ?? null,
    localPercent: data.kpis?.percentual_compras_fornecedores_locais ?? null,
    outsidePercent: data.kpis?.percentual_recursos_fora_municipio ?? null,
    commitments: data.totais_filtrados?.empenhos ?? data.totais_brutos?.empenhos ?? null,
    coverage: data.cobertura_cadastral?.percentual ?? null,
    missing: data.competencias_ausentes ?? [],
    published,
    requested,
    monthly,
    sizes,
    expenses,
    destinations,
    peak,
    monthlyAverage: monthly.length ? total / monthly.length : 0,
  };
}

export type OverviewView = ReturnType<typeof overviewView>;

export function delta(current: number | null, previous: number | null | undefined) {
  if (current === null || previous === null || previous === undefined || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}
