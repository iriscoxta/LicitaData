import { byTce, MUNICIPALITIES } from '../municipalities';
import type { MunicipalOverview } from '../types';
import { seeded, shares } from './random';

export const EXPENSE_ELEMENTS: Array<[string, string]> = [
  ['30', 'Material de consumo'],
  ['39', 'Outros serviços de terceiros — PJ'],
  ['51', 'Obras e instalações'],
  ['52', 'Equipamentos e material permanente'],
  ['40', 'Serviços de TI e comunicação — PJ'],
  ['32', 'Material para distribuição gratuita'],
  ['35', 'Serviços de consultoria'],
];

const SEASONALITY = [0.62, 0.78, 0.95, 0.98, 1.04, 1.02, 0.99, 1.08, 1.06, 1.1, 1.14, 1.38];

export function mockOverview(tceCode: string, year: string): MunicipalOverview {
  const municipality = byTce(tceCode) ?? MUNICIPALITIES[0]!;
  const rank = MUNICIPALITIES.indexOf(municipality);
  const rng = seeded(`overview:${municipality.tce}:${year}`);
  const scale = (rank === 0 ? 92_000_000 : 21_000_000 / Math.sqrt(rank + 1)) * 100;
  const yearFactor = 1 + (Number(year) - 2021) * 0.06;

  const months = Array.from({ length: 12 }, (_, index) => `${year}-${String(index + 1).padStart(2, '0')}`);
  const meShare = rng.between(0.19, 0.41);
  const monthly = months.map((periodo, index) => {
    const total = Math.round(scale * yearFactor * SEASONALITY[index]! * rng.between(0.86, 1.14));
    return {
      periodo,
      compras_consideradas_centavos: total,
      microempresas_centavos: Math.round(total * meShare * rng.between(0.82, 1.18)),
    };
  });

  const total = monthly.reduce((sum, item) => sum + item.compras_consideradas_centavos, 0);
  const meTotal = monthly.reduce((sum, item) => sum + item.microempresas_centavos, 0);
  const mePct = Math.round((meTotal / total) * 1000) / 10;

  const meiWeight = rng.between(0.12, 0.3);
  const sizePct = shares([mePct * (1 - meiWeight), mePct * meiWeight, rng.between(48, 64), rng.between(3, 9)]);
  const sizeNames = ['ME', 'MEI', 'OUTROS_PORTES', 'NAO_IDENTIFICADO'];

  const expenseWeights = EXPENSE_ELEMENTS.map((_, index) => rng.between(0.4, 1.3) / (index * 0.45 + 1));
  const expenseTotal = expenseWeights.reduce((sum, value) => sum + value, 0);

  const local = rng.between(22, 58);
  const destPct = shares([local, rng.between(18, 40), rng.between(8, 22), rng.between(2, 7)]);
  const destinations = ['NO_MUNICIPIO_COMPRADOR', 'EM_OUTRO_MUNICIPIO', 'FORA_DO_CEARA', 'ORIGEM_NAO_IDENTIFICADA'];

  const commitments = Math.round((total / 100 / 18_500) * rng.between(0.8, 1.2));
  const coverage = Math.round(rng.between(84, 99) * 10) / 10;

  return {
    fonte: 'TCE-CE',
    origem_dados: 'DEMONSTRACAO',
    status_exercicio: Number(year) < 2026 ? 'Exercício encerrado' : 'Exercício em andamento',
    municipio: { nome: municipality.name, uf: 'CE', codigo_ibge: municipality.ibge, codigo_tce: municipality.tce },
    competencias_solicitadas: months,
    competencias_publicadas: months,
    competencias_ausentes: [],
    falhas_competencias: [],
    totais_brutos: { empenhos: commitments },
    totais_filtrados: { empenhos: commitments },
    cobertura_cadastral: {
      empenhos: commitments,
      empenhos_com_cache: Math.round((commitments * coverage) / 100),
      percentual: coverage,
    },
    unidade_monetaria: 'CENTAVOS',
    kpis: {
      total_compras_centavos: total,
      percentual_participacao_me: mePct,
      total_compras_ME_centavos: meTotal,
      percentual_compras_fornecedores_locais: destPct[0],
      percentual_recursos_fora_municipio: Math.round((100 - destPct[0]!) * 10) / 10,
    },
    participacao_por_porte_empresarial: sizeNames.map((porte, index) => ({
      porte,
      percentual: sizePct[index],
      valor_centavos: Math.round((total * sizePct[index]!) / 100),
    })),
    elementos_despesa: EXPENSE_ELEMENTS.map(([codigo, nome], index) => ({
      codigo,
      nome,
      valor_liquido_centavos: Math.round((meTotal * expenseWeights[index]!) / expenseTotal),
    })),
    evolucao_compras_consideradas: monthly,
    destino_recursos: destinations.map((destino, index) => ({
      destino,
      percentual: destPct[index],
      valor_centavos: Math.round((meTotal * destPct[index]!) / 100),
    })),
  };
}
