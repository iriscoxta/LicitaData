'use client';

import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ParticleBrazil } from '@/components/landing/particle-brazil';
import { SourceLogos } from '@/components/landing/source-logos';
import { buttonClass } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { Tag } from '@/components/ui/tag';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
        setError(body?.error?.message ?? 'Não foi possível entrar.');
        return;
      }
      router.push('/painel');
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col px-6 py-6 sm:px-12">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="LicitaData — início">
            <Logo />
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-[13px] text-muted hover:text-ink">
            <ArrowLeft className="size-4" /> Voltar
          </Link>
        </div>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto my-auto w-full max-w-sm py-12"
        >
          <h1 className="text-[32px] leading-tight font-semibold tracking-[-0.04em]">
            Bem-vindo de <span className="font-serif font-normal italic">volta</span>.
          </h1>
          <p className="mt-2 text-[14px] text-muted">Entre com a mesma conta do MonitoraME para ver os dados reais.</p>

          <label className="mt-8 block text-[13px] font-medium">
            E-mail
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-line-strong bg-surface px-3.5 text-[14px] font-normal outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
          </label>
          <label className="mt-4 block text-[13px] font-medium">
            Senha
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-line-strong bg-surface px-3.5 text-[14px] font-normal outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
          </label>

          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="mt-4 rounded-xl bg-[var(--tag-rose-bg)] px-3.5 py-2.5 text-[13px] text-[var(--tag-rose-fg)]">
              {error}
            </motion.p>
          )}

          <button type="submit" disabled={pending} className={buttonClass('primary', 'lg', 'mt-6 h-11 w-full rounded-xl')}>
            {pending ? <LoaderCircle className="animate-spin" /> : null}
            Entrar
            {!pending && <ArrowRight />}
          </button>

          <p className="mt-6 text-center text-[13px] text-muted">
            Só quer explorar?{' '}
            <Link href="/painel" className="font-medium text-ink underline-offset-4 hover:underline">
              Ver painel de demonstração
            </Link>
          </p>
        </motion.form>

        <div>
          <p className="mb-3 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">Fontes de dados</p>
          <SourceLogos className="gap-x-8 [&_img]:h-5!" />
        </div>
      </div>

      <div className="relative hidden overflow-hidden border-l border-line bg-surface lg:block">
        <ParticleBrazil className="absolute inset-10 size-[calc(100%-5rem)]" />
        <div className="absolute right-8 bottom-8 left-8 flex flex-wrap gap-2">
          <Tag tone="green" dot>ME</Tag>
          <Tag tone="sky" dot>184 municípios</Tag>
          <Tag tone="violet" dot>Comparações</Tag>
          <Tag tone="amber" dot>Mapa de empresas</Tag>
        </div>
      </div>
    </div>
  );
}
