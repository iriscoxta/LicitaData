'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export const THEME_STORAGE_KEY = 'licitadata-theme';

/** Aplicado no <head> antes da pintura para evitar flash de tema. */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains('dark')), []);

  const toggle = () => {
    const next = !dark;
    const root = document.documentElement;
    root.classList.add('theme-switching');
    root.classList.toggle('dark', next);
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')));
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
    } catch {
      // armazenamento indisponível: o tema vale só para esta visita
    }
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex size-9 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
      aria-label={dark ? 'Usar tema claro' : 'Usar tema escuro'}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
