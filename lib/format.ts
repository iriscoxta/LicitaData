const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const compactBrl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});
const integer = new Intl.NumberFormat('pt-BR');
const pct = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 });

/** Valores do backend chegam em centavos. */
export const money = (cents: number) => brl.format(cents / 100);
export const compactMoney = (cents: number) => compactBrl.format(cents / 100);
export const count = (value: number) => integer.format(value);
export const percent = (value: number) => `${pct.format(value)}%`;

export function monthShort(period: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(period);
  if (!match) return period;
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return months[Number(match[2]) - 1] ?? period;
}

export function titleCase(value: string): string {
  return value
    .toLocaleLowerCase('pt-BR')
    .replace(/(^|\s)\p{L}/gu, (letter) => letter.toLocaleUpperCase('pt-BR'))
    .replace(/\s(De|Da|Do|Das|Dos|E)\s/g, (word) => word.toLocaleLowerCase('pt-BR'));
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}
