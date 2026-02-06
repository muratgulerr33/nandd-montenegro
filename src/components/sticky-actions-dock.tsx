'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Phone, MessageCircle } from 'lucide-react';
import {
  IconWhatsApp,
  IconInstagram,
  IconTelegram,
  IconYouTube,
} from '@/components/icons/brand';
import { cn } from '@/lib/utils';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const SNAP_DELAY_MS = 120;
const LERP_FACTOR = 0.12;

const DOCK_ACTION_IDS = [
  'phone',
  'whatsapp',
  'instagram',
  'telegram',
  'youtube',
] as const;

const DOCK_ICONS = {
  phone: Phone,
  whatsapp: IconWhatsApp,
  instagram: IconInstagram,
  telegram: IconTelegram,
  youtube: IconYouTube,
} as const;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function StickyActionsDock() {
  const t = useTranslations('stickySocial');
  const [reducedMotion, setReducedMotion] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);
  const measuredHeightRef = useRef(0);
  const lastYRef = useRef(0);
  const targetOffsetRef = useRef(0);
  const currentOffsetRef = useRef(0);
  const snapTimeoutRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    const handler = () => setReducedMotion(mql.matches);
    const tid = window.setTimeout(() => setReducedMotion(mql.matches), 0);
    mql.addEventListener('change', handler);
    return () => {
      clearTimeout(tid);
      mql.removeEventListener('change', handler);
    };
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (dockRef.current) {
        measuredHeightRef.current = dockRef.current.offsetHeight;
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      const el = dockRef.current;
      if (el) {
        el.style.transform = '';
        el.style.pointerEvents = 'auto';
      }
      return;
    }

    lastYRef.current = typeof window !== 'undefined' ? window.scrollY : 0;

    const onScroll = () => {
      const scrollY = window.scrollY;
      const delta = scrollY - lastYRef.current;
      const maxHide = measuredHeightRef.current + 16;
      targetOffsetRef.current = Math.max(
        0,
        Math.min(maxHide, targetOffsetRef.current + delta)
      );
      lastYRef.current = scrollY;

      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = window.setTimeout(() => {
        snapTimeoutRef.current = null;
        if (targetOffsetRef.current > maxHide / 2) {
          targetOffsetRef.current = maxHide;
        } else {
          targetOffsetRef.current = 0;
        }
      }, SNAP_DELAY_MS);
    };

    const onScrollPassive = () => {
      requestAnimationFrame(onScroll);
    };

    window.addEventListener('scroll', onScrollPassive, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScrollPassive);
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
      }
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    const tick = () => {
      const maxHide = measuredHeightRef.current + 16;
      const target = targetOffsetRef.current;
      const current = currentOffsetRef.current;
      const next = lerp(current, target, LERP_FACTOR);
      currentOffsetRef.current = next;

      const el = dockRef.current;
      if (el) {
        el.style.transform = `translateY(${next}px)`;
        el.style.pointerEvents = next >= maxHide - 1 ? 'none' : 'auto';
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={dockRef}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 lg:hidden',
        'pb-[calc(env(safe-area-inset-bottom,0px)+12px)]'
      )}
      aria-hidden
    >
      <div className="flex items-end gap-3">
        {/* Pill dock — 5 icons */}
        <div
          className={cn(
            'flex h-14 items-center gap-1 rounded-full p-1.5',
            'border border-border/70 shadow-popover',
            'bg-background/75 [@supports(backdrop-filter:blur(0px))]:bg-background/60 [@supports(backdrop-filter:blur(0px))]:backdrop-blur-xl [@supports(backdrop-filter:blur(0px))]:backdrop-saturate-150'
          )}
        >
          {DOCK_ACTION_IDS.map((id) => {
            const Icon = DOCK_ICONS[id];
            const label = t(id);
            return (
              <a
                key={id}
                href="#"
                aria-label={label}
                className={cn(
                  'flex size-11 shrink-0 items-center justify-center rounded-full',
                  'text-foreground hover:bg-muted/80',
                  'transition-transform active:scale-[0.98]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                )}
                onClick={(e) => e.preventDefault()}
              >
                {id === 'phone' ? (
                  <Phone
                    className="size-5"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                ) : (
                  <Icon className="size-5" aria-hidden />
                )}
              </a>
            );
          })}
        </div>
        {/* Chat bubble */}
        <a
          href="#"
          aria-label={t('chat')}
          className={cn(
            'flex size-14 shrink-0 items-center justify-center rounded-full -translate-y-1',
            'bg-primary text-primary-foreground shadow-popover',
            'ring-1 ring-border/60',
            'hover:bg-primary/90 transition-transform active:scale-[0.98]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          )}
          onClick={(e) => e.preventDefault()}
        >
          <MessageCircle className="size-6" aria-hidden />
        </a>
      </div>
    </div>
  );
}
