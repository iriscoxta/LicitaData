'use client';

import { ArrowUpDown, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ORIGIN_TAG, SIZE_TAG, Tag } from '@/components/ui/tag';
import { count, formatDate, money, titleCase } from '@/lib/format';
import type { SupplierListItem } from '@/lib/types';
import { cn } from '@/lib/utils';

type SortKey = 'value' | 'commitments' | 'last';

export function SuppliersTable({
  items,
  total,
  loading,
  badge,
}: {
  items: SupplierListItem[];
  total: number | null;
  loading: boolean;
  badge?: React.ReactNode;
}) {
  const [query, setQuery] = useState('');
  const [size, setSize] = useState<string | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: 'value', desc: true });

  const sizes = useMemo(() => [...new Set(items.map((item) => item.porte))], [items]);
  const rows = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('pt-BR');
    const filtered = items.filter(
      (item) =>
        (!size || item.porte === size) &&
        (!term || item.nome.toLocaleLowerCase('pt-BR').includes(term) || (item.cnpj ?? '').includes(term)),
    );
    const pick = (item: SupplierListItem) =>
      sort.key === 'value'
        ? item.valores.valor_considerado_centavos
        : sort.key === 'commitments'
          ? item.quantidade_empenhos
          : Date.parse(item.ultimo_empenho ?? '') || 0;
    return [...filtered].sort((a, b) => (sort.desc ? pick(b) - pick(a) : pick(a) - pick(b)));
  }, [items, query, size, sort]);

  const max = Math.max(...items.map((item) => item.valores.valor_considerado_centavos), 1);
  const toggleSort = (key: SortKey) => setSort((current) => ({ key, desc: current.key === key ? !current.desc : true }));

  return (
    <Card
      title={
        <>
          Principais fornecedores
          {total !== null && <span className="num font-normal text-muted">· {count(total)} no recorte</span>}
        </>
      }
      action={badge}
      bodyClassName="p-0"
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
        <label className="relative flex h-8 w-full items-center sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 size-3.5 text-muted" />
          <span className="sr-only">Filtrar fornecedores</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filtrar por nome ou CNPJ…"
            className="h-full w-full rounded-lg border border-line bg-surface pr-3 pl-8 text-[12.5px] outline-none placeholder:text-muted focus:border-brand"
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setSize(null)} className={cn('rounded-full transition-opacity', size ? 'opacity-50 hover:opacity-100' : '')}>
            <Tag tone="gray">Todos</Tag>
          </button>
          {sizes.map((value) => {
            const meta = SIZE_TAG[value] ?? { label: value, tone: 'gray' as const };
            return (
              <button
                key={value}
                type="button"
                aria-pressed={size === value}
                onClick={() => setSize(size === value ? null : value)}
                className={cn('rounded-full transition-opacity', size && size !== value ? 'opacity-50 hover:opacity-100' : '')}
              >
                <Tag tone={meta.tone} dot={size === value}>
                  {meta.label}
                </Tag>
              </button>
            );
          })}
        </div>
      </div>

      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-[12.5px]">
          <thead>
            <tr className="border-b border-line text-[11.5px] text-muted">
              <th className="px-4 py-2.5 font-medium">Fornecedor</th>
              <th className="px-3 py-2.5 font-medium">Porte</th>
              <th className="px-3 py-2.5 font-medium">Origem</th>
              <SortHeader label="Empenhos" active={sort.key === 'commitments'} onClick={() => toggleSort('commitments')} className="text-right" />
              <SortHeader label="Valor considerado" active={sort.key === 'value'} onClick={() => toggleSort('value')} className="text-right" />
              <SortHeader label="Último empenho" active={sort.key === 'last'} onClick={() => toggleSort('last')} />
            </tr>
          </thead>
          <tbody>
            {loading && !items.length
              ? Array.from({ length: 5 }, (_, index) => (
                  <tr key={index} className="border-b border-line last:border-0">
                    <td colSpan={6} className="px-4 py-3.5">
                      <div className="skeleton h-5 w-full" />
                    </td>
                  </tr>
                ))
              : rows.map((item) => {
                  const sizeMeta = SIZE_TAG[item.porte] ?? { label: item.porte, tone: 'gray' as const };
                  const origin = item.origens_no_recorte[0];
                  const originMeta = origin ? ORIGIN_TAG[origin] : undefined;
                  return (
                    <tr key={item.documento} className="group border-b border-line transition-colors last:border-0 hover:bg-surface-2/70">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[11px] font-semibold text-ink-2 ring-1 ring-line">
                            {item.nome.replace(/[^A-Za-zÀ-ú ]/g, '').split(' ').filter(Boolean).slice(0, 2).map((word) => word[0]).join('')}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">{titleCase(item.nome)}</p>
                            <p className="num font-mono text-[11px] text-muted">{item.cnpj ?? item.documento}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Tag tone={sizeMeta.tone}>{sizeMeta.label}</Tag>
                      </td>
                      <td className="px-3 py-3">{originMeta ? <Tag tone={originMeta.tone} dot>{originMeta.label}</Tag> : <span className="text-muted">—</span>}</td>
                      <td className="num px-3 py-3 text-right text-ink-2">{count(item.quantidade_empenhos)}</td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-surface-2 lg:block">
                            <div className="h-full rounded-full bg-[var(--data-1)]" style={{ width: `${(item.valores.valor_considerado_centavos / max) * 100}%` }} />
                          </div>
                          <span className="num font-medium">{money(item.valores.valor_considerado_centavos)}</span>
                        </div>
                      </td>
                      <td className="num px-3 py-3 text-muted">{formatDate(item.ultimo_empenho)}</td>
                    </tr>
                  );
                })}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  Nenhum fornecedor encontrado para este filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function SortHeader({ label, active, onClick, className }: { label: string; active: boolean; onClick: () => void; className?: string }) {
  return (
    <th className={cn('px-3 py-2.5 font-medium', className)}>
      <button type="button" onClick={onClick} className={cn('inline-flex items-center gap-1 hover:text-ink', active && 'text-ink')}>
        {label}
        <ArrowUpDown className="size-3" />
      </button>
    </th>
  );
}
