'use client';

import { AnimatePresence, motion } from 'motion/react';
import { MapPin, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MUNICIPALITIES } from '@/lib/municipalities';
import { cn } from '@/lib/utils';

const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Busca rápida de município (Ctrl/⌘+K) que abre o painel já filtrado. */
export function MunicipalitySearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const results = useMemo(() => {
    const term = normalize(query.trim());
    return MUNICIPALITIES.filter((item) => !term || normalize(item.name).includes(term) || normalize(item.region).includes(term)).slice(0, 7);
  }, [query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (tce: string) => {
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
    router.push(`/painel?municipio=${tce}`);
  };

  return (
    <div className="relative hidden lg:block">
      <label className="flex h-9 w-72 items-center gap-2 rounded-[10px] border border-line bg-surface px-3 text-[13px] focus-within:border-brand">
        <Search className="size-4 shrink-0 text-muted" />
        <span className="sr-only">Buscar município</span>
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIndex(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') setIndex((value) => Math.min(value + 1, results.length - 1));
            if (event.key === 'ArrowUp') setIndex((value) => Math.max(value - 1, 0));
            if (event.key === 'Enter' && results[index]) go(results[index].tce);
            if (event.key === 'Escape') inputRef.current?.blur();
          }}
          placeholder="Buscar município"
          role="combobox"
          aria-expanded={open}
          aria-controls="municipality-results"
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted"
        />
        <kbd className="rounded border border-line px-1.5 font-mono text-[10px] text-muted">Ctrl K</kbd>
      </label>
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.ul
            id="municipality-results"
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-11 right-0 left-0 z-50 overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-pop"
          >
            {results.map((item, position) => (
              <li key={item.tce} role="option" aria-selected={position === index}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => go(item.tce)}
                  onMouseEnter={() => setIndex(position)}
                  className={cn('flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px]', position === index && 'bg-surface-2')}
                >
                  <MapPin className="size-3.5 text-muted" />
                  <span className="font-medium">{item.name}</span>
                  <span className="ml-auto text-[11.5px] text-muted">{item.region}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
