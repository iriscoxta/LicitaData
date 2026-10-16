import { byTce, MUNICIPALITIES } from '../municipalities';
import type { SupplierListResponse } from '../types';
import { seeded } from './random';

const NAMES = [
  'Horizonte Serviços',
  'Costa Norte Comércio',
  'Vale Soluções',
  'Litoral Equipamentos',
  'Alvorada Engenharia',
  'Sertão Distribuidora',
  'Nova Rota Tecnologia',
  'Cariri Consultoria',
  'Raízes Alimentos',
  'Ceará Infraestrutura',
  'Mandacaru Gráfica',
  'Jangada Transportes',
  'Carnaúba Papelaria',
  'Aroeira Saúde',
  'Ventos Limpeza',
];
const SUFFIXES = ['Ltda.', 'EIRELI', 'ME', 'S.A.'];
const SIZES = ['ME', 'ME', 'MEI', 'EPP', 'DEMAIS'];
const ORIGINS = ['NO_MUNICIPIO_COMPRADOR', 'EM_OUTRO_MUNICIPIO', 'FORA_DO_CEARA'];

function fakeCnpj(rng: ReturnType<typeof seeded>) {
  const digits = (n: number) => Array.from({ length: n }, () => rng.int(0, 9)).join('');
  return `${digits(2)}.${digits(3)}.${digits(3)}/0001-${digits(2)}`;
}

export function mockSuppliers(tceCode: string, year: string, pageSize = 8): SupplierListResponse {
  const municipality = byTce(tceCode) ?? MUNICIPALITIES[0]!;
  const rng = seeded(`suppliers:${municipality.tce}:${year}`);
  const items = Array.from({ length: pageSize }, (_, index) => {
    const name = `${NAMES[(index * 7 + municipality.name.length) % NAMES.length]} ${rng.pick(SUFFIXES)}`;
    const value = Math.round((rng.between(180_000, 4_800_000) * 100) / (index * 0.35 + 1));
    const cancelled = Math.round(value * rng.between(0, 0.06));
    const document = fakeCnpj(rng);
    return {
      tipo_documento: 'CNPJ' as const,
      documento: document.replace(/\D/g, ''),
      cnpj: document,
      nome: name,
      porte: rng.pick(SIZES),
      cadastro_status: 'DISPONIVEL',
      origens_no_recorte: [rng.pick(ORIGINS)],
      valores: {
        valor_empenhado_centavos: value + cancelled,
        valor_anulado_centavos: cancelled,
        valor_considerado_centavos: value,
      },
      quantidade_empenhos: rng.int(6, 140),
      quantidade_anulacoes: rng.int(0, 4),
      quantidade_municipios: rng.int(1, 9),
      primeiro_empenho: `${year}-0${rng.int(1, 4)}-${String(rng.int(1, 28)).padStart(2, '0')}`,
      ultimo_empenho: `${year}-${rng.int(9, 12)}-${String(rng.int(1, 28)).padStart(2, '0')}`,
    };
  }).sort((a, b) => b.valores.valor_considerado_centavos - a.valores.valor_considerado_centavos);

  return {
    source: 'TCE-CE',
    data_source: 'DEMONSTRACAO',
    pagination: {
      page: 1,
      page_size: pageSize,
      total_items: 120 + rng.int(0, 600),
      total_pages: 20,
      has_previous: false,
      has_next: true,
    },
    items,
  };
}
