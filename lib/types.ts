/**
 * Contratos da API do backend MonitoraME (NestJS) consumidos pelo LicitaData.
 * Mantidos com os mesmos nomes de campos do backend para que o BFF apenas repasse o JSON.
 */

export type CompanySize = 'ME' | 'MEI' | 'EPP' | 'OTHER' | 'UNKNOWN';
export type SupplierOrigin =
  | 'NO_MUNICIPIO_COMPRADOR'
  | 'EM_OUTRO_MUNICIPIO'
  | 'FORA_DO_CEARA'
  | 'ORIGEM_NAO_IDENTIFICADA';
export type ExpenseElementCode = '30' | '32' | '35' | '39' | '40' | '51' | '52';

/** GET /analytics/tce/overview/munipal */
export interface MunicipalOverview {
  fonte?: string;
  origem_dados?: string;
  status_exercicio?: string;
  municipio?: { nome?: string; uf?: string; codigo_ibge?: string; codigo_tce?: string };
  competencias_solicitadas?: string[];
  competencias_publicadas?: string[];
  competencias_ausentes?: string[];
  falhas_competencias?: unknown[];
  totais_brutos?: { empenhos?: number };
  totais_filtrados?: { empenhos?: number };
  cobertura_cadastral?: { empenhos?: number; empenhos_com_cache?: number; percentual?: number };
  unidade_monetaria?: string;
  kpis?: {
    total_compras_centavos?: number;
    percentual_participacao_me?: number;
    total_compras_ME_centavos?: number;
    percentual_compras_fornecedores_locais?: number;
    percentual_recursos_fora_municipio?: number;
  };
  participacao_por_porte_empresarial?: Array<{ porte?: string; valor_centavos?: number; percentual?: number }>;
  elementos_despesa?: Array<{ codigo?: string; nome?: string; valor_liquido_centavos?: number }>;
  evolucao_compras_consideradas?: Array<{
    periodo?: string;
    compras_consideradas_centavos?: number;
    microempresas_centavos?: number;
  }>;
  destino_recursos?: Array<{ destino?: string; valor_centavos?: number; percentual?: number }>;
}

/** POST /analytics/tce/comparisons */
export type ComparisonMode = 'PERIODS' | 'MUNICIPALITIES' | 'MIXED';
export type Ordering = 'LEFT_HIGHER' | 'RIGHT_HIGHER' | 'TIE' | 'UNAVAILABLE';

export interface ComparisonSideRequest {
  label: string;
  filters: {
    uf: 'CE';
    municipality_ibge_code: string;
    start_date: string;
    end_date: string;
    company_sizes: CompanySize[];
    supplier_origins: SupplierOrigin[];
    expense_element_codes: ExpenseElementCode[];
  };
}

export interface ComparisonRequest {
  comparison_mode: ComparisonMode;
  left: ComparisonSideRequest;
  right: ComparisonSideRequest;
}

export interface Side {
  source: 'LEFT' | 'RIGHT';
  label: string;
  value: number | null;
}

export interface ValueComparison {
  ordering: Ordering;
  left: Side;
  right: Side;
  higher: Side | null;
  lower: Side | null;
  absolute_difference: number | null;
  unit: 'CENTAVOS' | 'PONTOS_PERCENTUAIS';
}

export interface SideResult {
  label: string;
  filters: ComparisonSideRequest['filters'];
  overview: {
    status_exercicio?: string | null;
    municipio?: { nome?: string; uf?: string; codigo_ibge?: string; codigo_tce?: string } | null;
    competencias_solicitadas: string[];
    competencias_publicadas: string[];
    competencias_ausentes: string[];
    falhas_competencias: unknown[];
    totais_brutos: { empenhos: number };
    totais_filtrados?: { empenhos: number } | null;
    cobertura_cadastral?: { empenhos: number; empenhos_com_cache: number; percentual: number } | null;
    base_analitica?: { municipio_comprador?: string | null } | null;
    kpis: Record<string, number>;
  };
}

export interface EvolutionComparison {
  position: number;
  left_period: string | null;
  right_period: string | null;
  left_published: boolean;
  right_published: boolean;
  compras_consideradas_centavos: ValueComparison;
  microempresas_centavos: ValueComparison;
}

export interface ComparisonResponse {
  fonte: string;
  origem_dados: string;
  consultas_externas: boolean;
  comparison_mode: string;
  left: SideResult;
  right: SideResult;
  sections: {
    kpis: Array<{ indicator: string } & ValueComparison>;
    participacao_por_porte_empresarial: Array<{
      porte: string;
      valor_centavos: ValueComparison;
      percentual: ValueComparison;
    }>;
    elementos_despesa: Array<{ codigo: string; nome: string } & ValueComparison>;
    evolucao_compras_consideradas: EvolutionComparison[];
    destino_recursos: Array<{ destino: string; valor_centavos: ValueComparison; percentual: ValueComparison }>;
  };
}

/** GET /analytics/tce/fornecedores */
export interface SupplierListItem {
  tipo_documento: 'CNPJ' | 'CPF';
  documento: string;
  cnpj: string | null;
  nome: string;
  porte: string;
  cadastro_status: string;
  origens_no_recorte: string[];
  valores: {
    valor_empenhado_centavos: number;
    valor_anulado_centavos: number;
    valor_considerado_centavos: number;
  };
  quantidade_empenhos: number;
  quantidade_anulacoes: number;
  quantidade_municipios: number;
  primeiro_empenho: string | null;
  ultimo_empenho: string | null;
}

export interface SupplierListResponse {
  source: string;
  data_source: string;
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_previous: boolean;
    has_next: boolean;
  };
  items: SupplierListItem[];
}

/** Origem dos dados exibidos: backend real ou demonstração local. */
export type DataSource = 'live' | 'demo';

export interface Sourced<T> {
  data: T;
  source: DataSource;
  reason?: string;
}

/** Empresa cadastrada na plataforma (mapa — dados de demonstração). */
export interface RegisteredCompany {
  id: string;
  name: string;
  tradeName: string;
  cnpj: string;
  size: 'MEI' | 'ME' | 'EPP' | 'DEMAIS';
  segment: string;
  status: 'ATIVA' | 'EM_ANALISE' | 'PENDENTE';
  uf: string;
  city: string;
  lat: number;
  lng: number;
  wonBids: number;
  contractedCents: number;
  registeredAt: string;
}
