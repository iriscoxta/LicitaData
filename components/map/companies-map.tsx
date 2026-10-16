'use client';

import { AnimatePresence, motion } from 'motion/react';
import { Building2, MapPin, Search, Trophy, Wallet, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/shell/app-shell';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { Select } from '@/components/ui/select';
import { SourceBadge } from '@/components/ui/source-badge';
import { Tag, type TagTone } from '@/components/ui/tag';
import { STATES } from '@/lib/states';
import { compactMoney, count } from '@/lib/format';
import type { RegisteredCompany } from '@/lib/types';
import { useApi } from '@/lib/use-api';
import { cn } from '@/lib/utils';
import type { CityCluster } from './leaflet-map';

const LeafletMap = dynamic(() => import('./leaflet-map').then((module) => module.LeafletMap), {
  ssr: false,
  loading: () => <div className="skeleton size-full rounded-none" />,
});

const SIZES: Array<{ value: RegisteredCompany['size']; label: string; tone: TagTone; color: string }> = [
  { value: 'MEI', label: 'MEI', tone: 'teal', color: '#2bb3a3' },
  { value: 'ME', label: 'ME', tone: 'green', color: '#3fb86f' },
  { value: 'EPP', label: 'EPP', tone: 'sky', color: '#3a9be0' },
  { value: 'DEMAIS', label: 'Demais', tone: 'violet', color: '#8b6cf0' },
];
const STATUS: Record<RegisteredCompany['status'], { label: string; tone: TagTone }> = {
  ATIVA: { label: 'Ativa', tone: 'green' },
  EM_ANALISE: { label: 'Em análise', tone: 'amber' },
  PENDENTE: { label: 'Pendente', tone: 'rose' },
};

const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function CompaniesMap() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const result = useApi<RegisteredCompany[]>('/api/companies');
  const all = useMemo(() => result.data ?? [], [result.data]);

  const uf = params.get('uf') ?? '';
  const city = params.get('cidade') ?? '';
  const [query, setQuery] = useState('');
  const [sizes, setSizes] = useState<Set<RegisteredCompany['size']>>(new Set());
  const [focusId, setFocusId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const setLocation = (nextUf: string, nextCity = '') => {
    const next = new URLSearchParams(params.toString());
    if (nextUf) next.set('uf', nextUf);
    else next.delete('uf');
    if (nextCity) next.set('cidade', nextCity);
    else next.delete('cidade');
    setSelectedId(null);
    router.replace(`${pathname}${next.size ? `?${next}` : ''}`, { scroll: false });
  };

  const states = useMemo(() => {
    const totals = new Map<string, number>();
    all.forEach((company) => totals.set(company.uf, (totals.get(company.uf) ?? 0) + 1));
    return [...totals.entries()].sort((a, b) => STATES[a[0]]!.localeCompare(STATES[b[0]]!));
  }, [all]);

  const cities = useMemo(() => {
    const totals = new Map<string, number>();
    all.filter((company) => company.uf === uf).forEach((company) => totals.set(company.city, (totals.get(company.city) ?? 0) + 1));
    return [...totals.entries()].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'));
  }, [all, uf]);

  const filtered = useMemo(() => {
    const term = normalize(query.trim());
    return all.filter(
      (company) =>
        (!uf || company.uf === uf) &&
        (!city || company.city === city) &&
        (sizes.size === 0 || sizes.has(company.size)) &&
        (!term || normalize(`${company.tradeName} ${company.name} ${company.segment} ${company.cnpj}`).includes(term)),
    );
  }, [all, uf, city, sizes, query]);

  const clusters = useMemo<CityCluster[]>(() => {
    const groups = new Map<string, CityCluster>();
    filtered.forEach((company) => {
      const key = `${company.uf}:${company.city}`;
      const group = groups.get(key) ?? { key, uf: company.uf, city: company.city, lat: 0, lng: 0, companies: [] };
      group.companies.push(company);
      groups.set(key, group);
    });
    return [...groups.values()].map((group) => ({
      ...group,
      lat: group.companies.reduce((sum, item) => sum + item.lat, 0) / group.companies.length,
      lng: group.companies.reduce((sum, item) => sum + item.lng, 0) / group.companies.length,
    }));
  }, [filtered]);

  useEffect(() => setSelectedId(null), [sizes, query]);

  const totals = useMemo(
    () => ({
      companies: filtered.length,
      cities: new Set(filtered.map((company) => `${company.uf}:${company.city}`)).size,
      bids: filtered.reduce((sum, company) => sum + company.wonBids, 0),
      contracted: filtered.reduce((sum, company) => sum + company.contractedCents, 0),
    }),
    [filtered],
  );

  const mode = city ? 'companies' : 'clusters';
  const list = useMemo(() => [...filtered].sort((a, b) => b.contractedCents - a.contractedCents), [filtered]);

  const toggleSize = (value: RegisteredCompany['size']) =>
    setSizes((current) => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });

  const pickCompany = (company: RegisteredCompany) => {
    if (company.city !== city || company.uf !== uf) setLocation(company.uf, company.city);
    setSelectedId(company.id);
  };

  return (
    <>
      <PageHeader
        title="Mapa de empresas"
        description="Todas as empresas cadastradas na plataforma, por estado e cidade."
        badge={<SourceBadge source={result.status === 'ready' ? result.source : null} reason={result.status === 'ready' ? result.reason : undefined} />}
      />

      {/* KPIs do recorte */}
      <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Empresas', value: totals.companies, icon: <Building2 />, format: (n: number) => count(Math.round(n)) },
          { label: 'Cidades', value: totals.cities, icon: <MapPin />, format: (n: number) => count(Math.round(n)) },
          { label: 'Licitações ganhas', value: totals.bids, icon: <Trophy />, format: (n: number) => count(Math.round(n)) },
          { label: 'Valor contratado', value: totals.contracted, icon: <Wallet />, format: compactMoney },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-[14px] border border-line bg-surface px-4 py-3 shadow-card">
            <div>
              <p className="text-[12px] text-muted">{item.label}</p>
              <p className="num mt-0.5 text-[20px] font-semibold tracking-tight">
                <AnimatedNumber value={item.value} format={item.format} duration={0.6} />
              </p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-full bg-surface-2 text-ink-2 [&_svg]:size-4">{item.icon}</span>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[18px] border border-line bg-surface shadow-card">
        {/* Barra de filtros */}
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface-2 p-3">
          <Select
            label="Estado"
            value={uf}
            onChange={(value) => setLocation(value)}
            options={[{ value: '', label: 'Todos os estados' }, ...states.map(([code, total]) => ({ value: code, label: `${STATES[code]} (${total})` }))]}
            className="w-full sm:w-56"
          />
          <Select
            label="Cidade"
            value={city}
            onChange={(value) => setLocation(uf, value)}
            options={[
              { value: '', label: uf ? 'Todas as cidades' : 'Escolha um estado' },
              ...cities.map(([name, total]) => ({ value: name, label: `${name} (${total})` })),
            ]}
            className={cn('w-full sm:w-56', !uf && 'pointer-events-none opacity-50')}
          />
          <label className="relative flex h-9 w-full items-center sm:w-60">
            <Search className="pointer-events-none absolute left-3 size-4 text-muted" />
            <span className="sr-only">Buscar empresa</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Empresa, segmento ou CNPJ"
              className="h-full w-full rounded-[10px] border border-line-strong bg-surface pr-3 pl-9 text-[13px] outline-none placeholder:text-muted focus:border-brand"
            />
          </label>
          <div className="flex flex-wrap items-center gap-1.5 lg:ml-auto">
            {SIZES.map((size) => {
              const active = sizes.has(size.value);
              return (
                <button
                  key={size.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleSize(size.value)}
                  className={cn('rounded-full transition-opacity', sizes.size > 0 && !active && 'opacity-45 hover:opacity-90')}
                >
                  <Tag tone={size.tone} dot className="h-7 px-3">
                    {size.label}
                  </Tag>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtros ativos */}
        <AnimatePresence initial={false}>
          {(uf || city) && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-line">
              <div className="flex flex-wrap items-center gap-2 px-3 py-2 text-[12px] text-muted">
                Filtrando:
                {uf && (
                  <button type="button" onClick={() => setLocation('')} className="group">
                    <Tag tone="blue">
                      {STATES[uf]} <X className="size-3 opacity-60 group-hover:opacity-100" />
                    </Tag>
                  </button>
                )}
                {city && (
                  <button type="button" onClick={() => setLocation(uf)} className="group">
                    <Tag tone="violet">
                      {city} <X className="size-3 opacity-60 group-hover:opacity-100" />
                    </Tag>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-[380px_1fr]">
          {/* Lista */}
          <div className="order-2 border-t border-line lg:order-1 lg:border-t-0 lg:border-r">
            <div className="flex items-center justify-between px-4 py-3 text-[12px] text-muted">
              <span>
                <b className="font-semibold text-ink">{count(list.length)}</b> empresas · por valor contratado
              </span>
            </div>
            <ul className="scrollbar-thin max-h-[420px] overflow-y-auto px-2 pb-2 lg:h-[calc(100dvh-330px)] lg:max-h-none lg:min-h-[480px]">
              {result.status === 'loading' &&
                Array.from({ length: 6 }, (_, index) => (
                  <li key={index} className="p-2">
                    <div className="skeleton h-16" />
                  </li>
                ))}
              {list.map((company) => (
                <li key={company.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setFocusId(company.id)}
                    onMouseLeave={() => setFocusId(null)}
                    onFocus={() => setFocusId(company.id)}
                    onBlur={() => setFocusId(null)}
                    onClick={() => pickCompany(company)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-surface-2',
                      selectedId === company.id && 'bg-surface-2 ring-1 ring-line-strong',
                    )}
                  >
                    <span
                      className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                      style={{ background: SIZES.find((size) => size.value === company.size)?.color }}
                    >
                      {company.tradeName.split(' ').slice(0, 2).map((word) => word[0]).join('')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[13px] font-medium">{company.tradeName}</span>
                        <span className="num shrink-0 text-[12px] font-medium">{compactMoney(company.contractedCents)}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-[11.5px] text-muted">
                        {company.segment} · {company.city}/{company.uf}
                      </span>
                      <span className="mt-1.5 flex gap-1">
                        <Tag tone={SIZES.find((size) => size.value === company.size)!.tone} className="h-5 px-2 text-[10.5px]">
                          {company.size === 'DEMAIS' ? 'Demais' : company.size}
                        </Tag>
                        <Tag tone={STATUS[company.status].tone} dot className="h-5 px-2 text-[10.5px]">
                          {STATUS[company.status].label}
                        </Tag>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
              {result.status === 'ready' && list.length === 0 && (
                <li className="px-4 py-12 text-center text-[13px] text-muted">Nenhuma empresa para estes filtros.</li>
              )}
            </ul>
          </div>

          {/* Mapa */}
          <div className="relative order-1 h-[420px] lg:order-2 lg:h-auto">
            <LeafletMap
              companies={mode === 'companies' ? filtered : []}
              clusters={mode === 'clusters' ? clusters : []}
              mode={mode}
              focusId={focusId}
              selectedId={selectedId}
              onCluster={(cluster) => setLocation(cluster.uf, cluster.city)}
              onCompany={(company) => setSelectedId(company.id)}
            />
            <div className="pointer-events-none absolute top-3 left-3 z-[400] rounded-xl border border-line bg-surface/90 px-3 py-2 text-[11.5px] shadow-pop backdrop-blur">
              <p className="mb-1.5 font-medium">{mode === 'clusters' ? 'Empresas por cidade' : 'Porte da empresa'}</p>
              {mode === 'clusters' ? (
                <p className="text-muted">Clique numa bolha para ver as empresas</p>
              ) : (
                <div className="flex gap-2.5">
                  {SIZES.map((size) => (
                    <span key={size.value} className="flex items-center gap-1 text-muted">
                      <span className="size-2 rounded-full" style={{ background: size.color }} />
                      {size.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
