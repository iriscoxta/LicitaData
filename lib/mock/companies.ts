import type { RegisteredCompany } from '../types';
import { seeded } from './random';

export { STATES } from '../states';

/**
 * Empresas cadastradas na plataforma — DADOS DE DEMONSTRAÇÃO.
 * O backend ainda não expõe a listagem de empresas com geolocalização; quando expuser,
 * basta trocar a fonte em app/api/companies/route.ts mantendo o contrato RegisteredCompany.
 */


/** [UF, cidade, lat, lng, peso] — o peso controla quantas empresas cada cidade recebe. */
const CITIES: Array<[string, string, number, number, number]> = [
  ['CE', 'Fortaleza', -3.7319, -38.5267, 26],
  ['CE', 'Caucaia', -3.7361, -38.6531, 6],
  ['CE', 'Maracanaú', -3.877, -38.6256, 5],
  ['CE', 'Sobral', -3.6861, -40.3497, 7],
  ['CE', 'Juazeiro do Norte', -7.2131, -39.3151, 7],
  ['CE', 'Crato', -7.2342, -39.4094, 4],
  ['CE', 'Itapipoca', -3.4944, -39.5786, 4],
  ['CE', 'Amontada', -3.3603, -39.8306, 6],
  ['CE', 'Iguatu', -6.3594, -39.2986, 3],
  ['CE', 'Quixadá', -4.9708, -39.0153, 3],
  ['CE', 'Tianguá', -3.7322, -40.9917, 3],
  ['CE', 'Acaraú', -2.8856, -40.12, 3],
  ['CE', 'Russas', -4.9403, -37.9758, 2],
  ['CE', 'Crateús', -5.1781, -40.6775, 2],
  ['PI', 'Teresina', -5.0892, -42.8019, 6],
  ['PI', 'Parnaíba', -2.9055, -41.7734, 2],
  ['RN', 'Natal', -5.7945, -35.211, 6],
  ['RN', 'Mossoró', -5.1878, -37.3441, 3],
  ['PB', 'João Pessoa', -7.1195, -34.845, 5],
  ['PB', 'Campina Grande', -7.2307, -35.8811, 3],
  ['PE', 'Recife', -8.0476, -34.877, 8],
  ['PE', 'Petrolina', -9.3891, -40.5031, 3],
  ['PE', 'Caruaru', -8.2842, -35.9699, 2],
  ['AL', 'Maceió', -9.6658, -35.735, 4],
  ['SE', 'Aracaju', -10.9472, -37.0731, 3],
  ['BA', 'Salvador', -12.9714, -38.5014, 8],
  ['BA', 'Feira de Santana', -12.2664, -38.9663, 3],
  ['BA', 'Vitória da Conquista', -14.8615, -40.8442, 2],
  ['MA', 'São Luís', -2.5297, -44.3028, 5],
  ['MA', 'Imperatriz', -5.5264, -47.4917, 2],
  ['PA', 'Belém', -1.4558, -48.4902, 5],
  ['PA', 'Santarém', -2.4385, -54.6996, 2],
  ['AM', 'Manaus', -3.119, -60.0217, 5],
  ['AP', 'Macapá', 0.0349, -51.0694, 1],
  ['RR', 'Boa Vista', 2.8235, -60.6758, 1],
  ['AC', 'Rio Branco', -9.9754, -67.8249, 1],
  ['RO', 'Porto Velho', -8.7612, -63.9004, 2],
  ['TO', 'Palmas', -10.2491, -48.3243, 2],
  ['DF', 'Brasília', -15.7942, -47.8822, 7],
  ['GO', 'Goiânia', -16.6869, -49.2648, 5],
  ['GO', 'Anápolis', -16.3281, -48.953, 2],
  ['MT', 'Cuiabá', -15.601, -56.0974, 3],
  ['MS', 'Campo Grande', -20.4697, -54.6201, 3],
  ['MG', 'Belo Horizonte', -19.9167, -43.9345, 7],
  ['MG', 'Uberlândia', -18.9186, -48.2772, 3],
  ['MG', 'Juiz de Fora', -21.7642, -43.3503, 2],
  ['ES', 'Vitória', -20.3155, -40.3128, 3],
  ['RJ', 'Rio de Janeiro', -22.9068, -43.1729, 8],
  ['RJ', 'Niterói', -22.8832, -43.1034, 2],
  ['SP', 'São Paulo', -23.5505, -46.6333, 12],
  ['SP', 'Campinas', -22.9056, -47.0608, 4],
  ['SP', 'Ribeirão Preto', -21.1775, -47.8103, 2],
  ['SP', 'Santos', -23.9608, -46.3336, 2],
  ['PR', 'Curitiba', -25.4284, -49.2733, 6],
  ['PR', 'Londrina', -23.3045, -51.1696, 2],
  ['SC', 'Florianópolis', -27.5954, -48.548, 4],
  ['SC', 'Joinville', -26.3045, -48.8487, 2],
  ['RS', 'Porto Alegre', -30.0346, -51.2177, 5],
  ['RS', 'Caxias do Sul', -29.1678, -51.1794, 2],
];

export const SEGMENTS = [
  'Material de escritório',
  'Alimentação escolar',
  'Obras e engenharia',
  'Tecnologia da informação',
  'Saúde e hospitalar',
  'Limpeza e conservação',
  'Transporte',
  'Consultoria',
] as const;

const PREFIXES = [
  'Nordeste', 'Atlântico', 'Horizonte', 'Mandacaru', 'Aroeira', 'Jangada', 'Sertão', 'Planalto', 'Litoral', 'Serra',
  'Cariri', 'Ipê', 'Carnaúba', 'Vento Sul', 'Rio Claro', 'Aurora', 'Boa Vista', 'Pau-Brasil', 'Cajueiro', 'Maré Alta',
];
const CORES: Record<(typeof SEGMENTS)[number], string[]> = {
  'Material de escritório': ['Papelaria', 'Suprimentos', 'Office'],
  'Alimentação escolar': ['Alimentos', 'Nutrição', 'Distribuidora'],
  'Obras e engenharia': ['Engenharia', 'Construções', 'Obras'],
  'Tecnologia da informação': ['Tecnologia', 'Sistemas', 'Digital'],
  'Saúde e hospitalar': ['Saúde', 'Médica', 'Hospitalar'],
  'Limpeza e conservação': ['Limpeza', 'Serviços', 'Conservação'],
  Transporte: ['Transportes', 'Logística', 'Fretes'],
  Consultoria: ['Consultoria', 'Gestão', 'Assessoria'],
};
const LEGAL = { MEI: 'MEI', ME: 'ME', EPP: 'EPP', DEMAIS: 'Ltda.' } as const;
const SIZES: RegisteredCompany['size'][] = ['MEI', 'ME', 'ME', 'ME', 'EPP', 'EPP', 'DEMAIS'];
const STATUSES: RegisteredCompany['status'][] = ['ATIVA', 'ATIVA', 'ATIVA', 'ATIVA', 'EM_ANALISE', 'PENDENTE'];

function build(): RegisteredCompany[] {
  const rng = seeded('licitadata:companies:v1');
  const companies: RegisteredCompany[] = [];
  for (const [uf, city, lat, lng, weight] of CITIES) {
    for (let i = 0; i < weight; i += 1) {
      const segment = rng.pick(SEGMENTS);
      const size = rng.pick(SIZES);
      const tradeName = `${rng.pick(PREFIXES)} ${rng.pick(CORES[segment])}`;
      const digits = (n: number) => Array.from({ length: n }, () => rng.int(0, 9)).join('');
      const spread = weight > 10 ? 0.11 : 0.05;
      const month = rng.int(1, 12);
      const year = month > 10 ? 2025 : rng.pick([2024, 2025, 2026]);
      companies.push({
        id: `emp-${companies.length + 1}`,
        name: `${tradeName} ${LEGAL[size]}`,
        tradeName,
        cnpj: `${digits(2)}.${digits(3)}.${digits(3)}/0001-${digits(2)}`,
        size,
        segment,
        status: rng.pick(STATUSES),
        uf,
        city,
        lat: lat + rng.between(-spread, spread),
        lng: lng + rng.between(-spread, spread),
        wonBids: rng.int(0, 48),
        contractedCents: Math.round(rng.between(15_000, 2_400_000) * 100),
        registeredAt: `${year}-${String(month).padStart(2, '0')}-${String(rng.int(1, 28)).padStart(2, '0')}`,
      });
    }
  }
  return companies;
}

export const REGISTERED_COMPANIES: readonly RegisteredCompany[] = build();
