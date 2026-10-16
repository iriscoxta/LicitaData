import { byIbge, MUNICIPALITIES } from '../municipalities';
import type { ComparisonRequest, ComparisonResponse, MunicipalOverview, SideResult, ValueComparison } from '../types';
import { mockOverview } from './overview';

function compare(
  left: number | null,
  right: number | null,
  leftLabel: string,
  rightLabel: string,
  unit: ValueComparison['unit'],
): ValueComparison {
  const l = { source: 'LEFT' as const, label: leftLabel, value: left };
  const r = { source: 'RIGHT' as const, label: rightLabel, value: right };
  if (left === null || right === null) {
    return { ordering: 'UNAVAILABLE', left: l, right: r, higher: null, lower: null, absolute_difference: null, unit };
  }
  if (left === right) {
    return { ordering: 'TIE', left: l, right: r, higher: null, lower: null, absolute_difference: 0, unit };
  }
  const leftHigher = left > right;
  return {
    ordering: leftHigher ? 'LEFT_HIGHER' : 'RIGHT_HIGHER',
    left: l,
    right: r,
    higher: leftHigher ? l : r,
    lower: leftHigher ? r : l,
    absolute_difference: Math.abs(left - right),
    unit,
  };
}

function side(request: ComparisonRequest['left'], overview: MunicipalOverview): SideResult {
  return {
    label: request.label,
    filters: request.filters,
    overview: {
      status_exercicio: overview.status_exercicio,
      municipio: overview.municipio,
      competencias_solicitadas: overview.competencias_solicitadas ?? [],
      competencias_publicadas: overview.competencias_publicadas ?? [],
      competencias_ausentes: overview.competencias_ausentes ?? [],
      falhas_competencias: [],
      totais_brutos: { empenhos: overview.totais_brutos?.empenhos ?? 0 },
      totais_filtrados: { empenhos: overview.totais_filtrados?.empenhos ?? 0 },
      cobertura_cadastral: {
        empenhos: overview.cobertura_cadastral?.empenhos ?? 0,
        empenhos_com_cache: overview.cobertura_cadastral?.empenhos_com_cache ?? 0,
        percentual: overview.cobertura_cadastral?.percentual ?? 0,
      },
      kpis: Object.fromEntries(
        Object.entries(overview.kpis ?? {}).filter(
          (entry): entry is [string, number] => typeof entry[1] === 'number',
        ),
      ),
    },
  };
}

export function mockComparison(request: ComparisonRequest): ComparisonResponse {
  const toOverview = (s: ComparisonRequest['left']) =>
    mockOverview(
      (byIbge(s.filters.municipality_ibge_code) ?? MUNICIPALITIES[0]!).tce,
      s.filters.start_date.slice(0, 4),
    );
  const left = toOverview(request.left);
  const right = toOverview(request.right);
  const L = request.left.label;
  const R = request.right.label;

  const kpiKeys = Object.keys(left.kpis ?? {}) as Array<keyof NonNullable<MunicipalOverview['kpis']>>;
  const leftEvolution = left.evolucao_compras_consideradas ?? [];
  const rightEvolution = right.evolucao_compras_consideradas ?? [];

  return {
    fonte: 'TCE-CE',
    origem_dados: 'DEMONSTRACAO',
    consultas_externas: false,
    comparison_mode: request.comparison_mode,
    left: side(request.left, left),
    right: side(request.right, right),
    sections: {
      kpis: kpiKeys.map((key) => ({
        indicator: key,
        ...compare(
          left.kpis?.[key] ?? null,
          right.kpis?.[key] ?? null,
          L,
          R,
          key.startsWith('percentual') ? 'PONTOS_PERCENTUAIS' : 'CENTAVOS',
        ),
      })),
      participacao_por_porte_empresarial: (left.participacao_por_porte_empresarial ?? []).map((item, index) => {
        const other = right.participacao_por_porte_empresarial?.[index];
        return {
          porte: item.porte ?? '',
          valor_centavos: compare(item.valor_centavos ?? null, other?.valor_centavos ?? null, L, R, 'CENTAVOS'),
          percentual: compare(item.percentual ?? null, other?.percentual ?? null, L, R, 'PONTOS_PERCENTUAIS'),
        };
      }),
      elementos_despesa: (left.elementos_despesa ?? []).map((item, index) => ({
        codigo: item.codigo ?? '',
        nome: item.nome ?? '',
        ...compare(
          item.valor_liquido_centavos ?? null,
          right.elementos_despesa?.[index]?.valor_liquido_centavos ?? null,
          L,
          R,
          'CENTAVOS',
        ),
      })),
      evolucao_compras_consideradas: leftEvolution.map((item, index) => {
        const other = rightEvolution[index];
        return {
          position: index + 1,
          left_period: item.periodo ?? null,
          right_period: other?.periodo ?? null,
          left_published: true,
          right_published: Boolean(other),
          compras_consideradas_centavos: compare(
            item.compras_consideradas_centavos ?? null,
            other?.compras_consideradas_centavos ?? null,
            L,
            R,
            'CENTAVOS',
          ),
          microempresas_centavos: compare(
            item.microempresas_centavos ?? null,
            other?.microempresas_centavos ?? null,
            L,
            R,
            'CENTAVOS',
          ),
        };
      }),
      destino_recursos: (left.destino_recursos ?? []).map((item, index) => {
        const other = right.destino_recursos?.[index];
        return {
          destino: item.destino ?? '',
          valor_centavos: compare(item.valor_centavos ?? null, other?.valor_centavos ?? null, L, R, 'CENTAVOS'),
          percentual: compare(item.percentual ?? null, other?.percentual ?? null, L, R, 'PONTOS_PERCENTUAIS'),
        };
      }),
    },
  };
}
