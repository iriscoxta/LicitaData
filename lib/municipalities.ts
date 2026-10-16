export interface Municipality {
  /** Código IBGE (7 dígitos) — usado pelas comparações. */
  ibge: string;
  /** Código sequencial do TCE-CE (3 dígitos) — usado pelo overview municipal. */
  tce: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
}

export const MUNICIPALITIES: readonly Municipality[] = [
  { ibge: '2304400', tce: '057', name: 'Fortaleza', region: 'Grande Fortaleza', lat: -3.7319, lng: -38.5267 },
  { ibge: '2303709', tce: '043', name: 'Caucaia', region: 'Grande Fortaleza', lat: -3.7361, lng: -38.6531 },
  { ibge: '2312908', tce: '162', name: 'Sobral', region: 'Sertão de Sobral', lat: -3.6861, lng: -40.3497 },
  { ibge: '2307304', tce: '094', name: 'Juazeiro do Norte', region: 'Cariri', lat: -7.2131, lng: -39.3151 },
  { ibge: '2307650', tce: '099', name: 'Maracanaú', region: 'Grande Fortaleza', lat: -3.877, lng: -38.6256 },
  { ibge: '2304202', tce: '049', name: 'Crato', region: 'Cariri', lat: -7.2342, lng: -39.4094 },
  { ibge: '2306405', tce: '084', name: 'Itapipoca', region: 'Litoral Oeste', lat: -3.4944, lng: -39.5786 },
  { ibge: '2305506', tce: '074', name: 'Iguatu', region: 'Centro-Sul', lat: -6.3594, lng: -39.2986 },
  { ibge: '2311306', tce: '144', name: 'Quixadá', region: 'Sertão Central', lat: -4.9708, lng: -39.0153 },
  { ibge: '2313401', tce: '169', name: 'Tianguá', region: 'Serra da Ibiapaba', lat: -3.7322, lng: -40.9917 },
  { ibge: '2300200', tce: '004', name: 'Acaraú', region: 'Litoral Norte', lat: -2.8856, lng: -40.12 },
  { ibge: '2300754', tce: '010', name: 'Amontada', region: 'Litoral Oeste', lat: -3.3603, lng: -39.8306 },
  { ibge: '2306553', tce: '086', name: 'Itarema', region: 'Litoral Norte', lat: -2.9208, lng: -39.915 },
  { ibge: '2303501', tce: '041', name: 'Cascavel', region: 'Grande Fortaleza', lat: -4.1331, lng: -38.2417 },
  { ibge: '2311405', tce: '146', name: 'Quixeramobim', region: 'Sertão Central', lat: -5.1992, lng: -39.2925 },
  { ibge: '2304103', tce: '048', name: 'Crateús', region: 'Sertão dos Crateús', lat: -5.1781, lng: -40.6775 },
  { ibge: '2302508', tce: '031', name: 'Brejo Santo', region: 'Cariri', lat: -7.4931, lng: -38.985 },
  { ibge: '2306256', tce: '184', name: 'Itaitinga', region: 'Grande Fortaleza', lat: -3.9694, lng: -38.5281 },
  { ibge: '2311801', tce: '150', name: 'Russas', region: 'Vale do Jaguaribe', lat: -4.9403, lng: -37.9758 },
  { ibge: '2303402', tce: '040', name: 'Carnaubal', region: 'Serra da Ibiapaba', lat: -4.1597, lng: -40.9414 },
];

export const EXERCISES = ['2025', '2024', '2023', '2022', '2021'] as const;

export function byTce(code: string | null | undefined) {
  return MUNICIPALITIES.find((item) => item.tce === code);
}

export function byIbge(code: string | null | undefined) {
  return MUNICIPALITIES.find((item) => item.ibge === code);
}
