'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ChatDrawer } from '@/components/chat-drawer';
import { IconWhatsApp } from '@/components/icons/brand';
import {
  DockPhoneCall,
  DockInstagram,
  DockTelegram,
  DockYouTube,
} from '@/components/icons/dock-social';
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
  phone: DockPhoneCall,
  whatsapp: IconWhatsApp,
  instagram: DockInstagram,
  telegram: DockTelegram,
  youtube: DockYouTube,
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
        'fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 md:hidden',
        'pb-[calc(env(safe-area-inset-bottom,0px)+12px)]'
      )}
      aria-hidden
    >
      <div className="flex items-end gap-3">
        {/* Pill dock — 5 icons */}
        <div
          className={cn(
            'flex h-14 items-center gap-1 rounded-full p-1.5',
            'bg-background/70 backdrop-blur border border-border/60 shadow-popover'
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
                aria-disabled="true"
                tabIndex={-1}
                className={cn(
                  'grid h-11 w-11 shrink-0 place-items-center rounded-full',
                  'text-foreground hover:opacity-90 active:scale-[0.98]',
                  'transition-[opacity,transform]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                )}
                onClick={(e) => e.preventDefault()}
              >
                <span className="flex h-5 w-5 items-center justify-center">
                  <Icon className="block size-5" aria-hidden />
                </span>
              </a>
            );
          })}
        </div>
        {/* Chat bubble */}
        <ChatDrawer triggerLabel={t('chat')} />
      </div>
    </div>
  );
}
