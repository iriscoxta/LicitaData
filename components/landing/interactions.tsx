'use client';

import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/** Botão que é atraído levemente pelo cursor. */
export function Magnetic({ children, strength = 0.3, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 260, damping: 18 });
  const y = useSpring(0, { stiffness: 260, damping: 18 });
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      className={cn('inline-flex', className)}
      onPointerMove={(event) => {
        if (reduce || !ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((event.clientX - rect.left - rect.width / 2) * strength);
        y.set((event.clientY - rect.top - rect.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** Palavra que alterna com transição vertical. */
export function RotatingWord({ words, className }: { words: string[]; className?: string }) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const timer = setInterval(() => setIndex((value) => (value + 1) % words.length), 2600);
    return () => clearInterval(timer);
  }, [words.length, reduce]);
  return (
    <span className={cn('relative inline-grid overflow-hidden align-bottom', className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={words[index]}
          initial={{ y: '100%', opacity: 0, filter: 'blur(6px)' }}
          animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-100%', opacity: 0, filter: 'blur(6px)' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="col-start-1 row-start-1 whitespace-nowrap pb-[0.08em]"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Ponteiro global normalizado (-1..1), usado para paralaxe. */
export function usePointerParallax() {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      px.set((event.clientX / window.innerWidth) * 2 - 1);
      py.set((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [px, py]);
  return {
    x: useSpring(px, { stiffness: 60, damping: 20 }),
    y: useSpring(py, { stiffness: 60, damping: 20 }),
  };
}

/** Elemento que se desloca conforme o ponteiro, com profundidade configurável. */
export function Parallax({
  depth,
  pointer,
  className,
  children,
}: {
  depth: number;
  pointer: ReturnType<typeof usePointerParallax>;
  className?: string;
  children: React.ReactNode;
}) {
  const x = useTransform(pointer.x, (value) => value * depth);
  const y = useTransform(pointer.y, (value) => value * depth);
  return (
    <motion.div style={{ x, y }} className={className}>
      {children}
    </motion.div>
  );
}

/** Moldura que inclina em 3D seguindo o cursor, com brilho que acompanha o ponteiro. */
export function TiltFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const rx = useSpring(8, { stiffness: 120, damping: 20 });
  const ry = useSpring(0, { stiffness: 120, damping: 20 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(0);
  const glow = useMotionTemplate`radial-gradient(600px circle at ${gx}% ${gy}%, rgb(111 123 255 / 0.16), transparent 45%)`;

  return (
    <div style={{ perspective: 1800 }} className={className}>
      <motion.div
        ref={ref}
        style={{ rotateX: reduce ? 0 : rx, rotateY: reduce ? 0 : ry, transformStyle: 'preserve-3d' }}
        onPointerMove={(event) => {
          if (!ref.current) return;
          const rect = ref.current.getBoundingClientRect();
          const nx = (event.clientX - rect.left) / rect.width;
          const ny = (event.clientY - rect.top) / rect.height;
          rx.set((0.5 - ny) * 8);
          ry.set((nx - 0.5) * 10);
          gx.set(nx * 100);
          gy.set(ny * 100);
        }}
        onPointerLeave={() => {
          rx.set(8);
          ry.set(0);
        }}
        className="relative"
      >
        {children}
        <motion.div className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: glow }} />
      </motion.div>
    </div>
  );
}

/** Revela o conteúdo ao entrar na viewport. */
export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Cartão com holofote que segue o cursor (borda e fundo). */
export function SpotlightCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const background = useMotionTemplate`radial-gradient(380px circle at ${mx}px ${my}px, rgb(111 123 255 / 0.10), transparent 70%)`;
  return (
    <div
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        mx.set(event.clientX - rect.left);
        my.set(event.clientY - rect.top);
      }}
      onPointerLeave={() => {
        mx.set(-200);
        my.set(-200);
      }}
      className={cn('group relative overflow-hidden rounded-[22px] border border-line bg-surface', className)}
    >
      <motion.div className="pointer-events-none absolute inset-0" style={{ background }} />
      {children}
    </div>
  );
}
