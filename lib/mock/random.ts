/** PRNG determinístico: o mesmo recorte sempre gera os mesmos números de demonstração. */
export function seeded(key: string) {
  let h = 1779033703 ^ key.length;
  for (let i = 0; i < key.length; i += 1) {
    h = Math.imul(h ^ key.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let state = h >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    between: (min: number, max: number) => min + next() * (max - min),
    int: (min: number, max: number) => Math.floor(min + next() * (max - min + 1)),
    pick: <T,>(items: readonly T[]): T => items[Math.floor(next() * items.length)]!,
  };
}

/** Distribui 100% em partes proporcionais aos pesos, com 1 casa decimal. */
export function shares(weights: number[]): number[] {
  const total = weights.reduce((sum, value) => sum + value, 0);
  const raw = weights.map((value) => Math.round((value / total) * 1000) / 10);
  const drift = Math.round((100 - raw.reduce((sum, value) => sum + value, 0)) * 10) / 10;
  raw[0] = Math.round((raw[0]! + drift) * 10) / 10;
  return raw;
}
