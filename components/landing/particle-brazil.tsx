'use client';

import { useEffect, useRef } from 'react';
import { BRAZIL_BOUNDS, brazilDots, HIGHLIGHT_CITIES } from '@/lib/brazil';

interface Particle {
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hot: number; // 0 = ponto comum; > 0 = cidade em destaque (índice da cor)
  phase: number;
}

const HOT_COLORS = ['#6f7bff', '#7ccf9a', '#ffc960', '#ff7f7f', '#8fd3e8', '#c39bff'];

/**
 * Mapa do Brasil feito de partículas: o cursor empurra os pontos, que voltam
 * com mola. Cidades em destaque pulsam nas cores da paleta de dados.
 */
export function ParticleBrazil({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dots = brazilDots(0.95);
    const pointer = { x: -9999, y: -9999, active: false };
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let dotSize = 1.6;
    let ink = '#0d0d10';
    let frame = 0;
    let visible = true;
    let time = 0;

    const readInk = () => {
      ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || ink;
    };

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const { minLng, maxLng, minLat, maxLat } = BRAZIL_BOUNDS;
      const scale = Math.min(width / (maxLng - minLng), height / (maxLat - minLat));
      const offsetX = (width - (maxLng - minLng) * scale) / 2;
      const offsetY = (height - (maxLat - minLat) * scale) / 2;
      const project = (lng: number, lat: number) => [
        offsetX + (lng - minLng) * scale,
        offsetY + (maxLat - lat) * scale,
      ] as const;
      dotSize = Math.max(1.1, scale * 0.95 * 0.24);

      const hotIndex = new Map<number, number>();
      HIGHLIGHT_CITIES.forEach(([lng, lat], index) => {
        let best = -1;
        let bestDistance = Infinity;
        dots.forEach(([dx, dy], i) => {
          const d = (dx - lng) ** 2 + (dy - lat) ** 2;
          if (d < bestDistance) {
            bestDistance = d;
            best = i;
          }
        });
        if (best >= 0) hotIndex.set(best, (index % HOT_COLORS.length) + 1);
      });

      particles = dots.map(([lng, lat], i) => {
        const [x, y] = project(lng, lat);
        return { hx: x, hy: y, x, y, vx: 0, vy: 0, hot: hotIndex.get(i) ?? 0, phase: Math.random() * Math.PI * 2 };
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const radius = Math.min(width, height) * 0.16;
      for (const p of particles) {
        if (!reduce) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (pointer.active && distance < radius && distance > 0.01) {
            const force = (1 - distance / radius) ** 2 * 2.6;
            p.vx += (dx / distance) * force;
            p.vy += (dy / distance) * force;
          }
          // onda suave quando o cursor está parado
          const wave = Math.sin(time * 0.0012 + p.hx * 0.012 + p.hy * 0.008) * 0.35;
          p.vx += (p.hx - p.x) * 0.06;
          p.vy += (p.hy + wave - p.y) * 0.06;
          p.vx *= 0.82;
          p.vy *= 0.82;
          p.x += p.vx;
          p.y += p.vy;
        }

        const displacement = Math.min(1, Math.hypot(p.x - p.hx, p.y - p.hy) / 18);
        if (p.hot) {
          const color = HOT_COLORS[p.hot - 1]!;
          const pulse = reduce ? 0.5 : (Math.sin(time * 0.003 + p.phase) + 1) / 2;
          ctx.globalAlpha = 0.18 * (1 - pulse);
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, dotSize * (2.2 + pulse * 3.2), 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, dotSize * 1.55, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.globalAlpha = 0.2 + displacement * 0.65;
          ctx.fillStyle = displacement > 0.15 ? HOT_COLORS[0]! : ink;
          ctx.beginPath();
          ctx.arc(p.x, p.y, dotSize * (1 + displacement * 0.5), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      time = now;
      if (visible) draw();
      frame = requestAnimationFrame(loop);
    };

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = pointer.x >= -40 && pointer.y >= -40 && pointer.x <= rect.width + 40 && pointer.y <= rect.height + 40;
    };
    const onLeave = () => {
      pointer.active = false;
    };

    readInk();
    layout();
    const resize = new ResizeObserver(layout);
    resize.observe(canvas);
    const theme = new MutationObserver(readInk);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    const io = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
    });
    io.observe(canvas);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      theme.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
