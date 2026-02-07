'use client';

import {
  Users,
  Inbox,
  Phone,
  MessageCircle,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type InboxTab = 'visitors' | 'inbox' | 'calls' | 'quickwp' | 'settings';

/** Sabit ikon alanı (optik hizalama); tüm dock ikonları aynı outline dili. */
const DOCK_ICON_SIZE = 20;
const DOCK_ICON_STROKE = 2;

type TabItem = {
  id: InboxTab;
  label: string;
  icon: LucideIcon;
  disabled: boolean;
};

const TABS: TabItem[] = [
  { id: 'visitors', label: 'Ziyaretçiler', icon: Users, disabled: false },
  { id: 'inbox', label: 'Inbox', icon: Inbox, disabled: false },
  { id: 'calls', label: 'Aramalar', icon: Phone, disabled: true },
  { id: 'quickwp', label: 'Quick WP', icon: MessageCircle, disabled: true },
  { id: 'settings', label: 'Ayarlar', icon: Settings, disabled: false },
];

export function BottomNav({
  activeTab,
  onTabChange,
}: {
  activeTab: InboxTab;
  onTabChange: (tab: InboxTab) => void;
}) {
  return (
    <nav
      className="flex shrink-0 items-center justify-around border-t border-border bg-surface-2 py-2 safe-area-pb"
      role="tablist"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-disabled={tab.disabled}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors',
              tab.disabled && 'cursor-not-allowed opacity-60',
              !tab.disabled && 'hover:bg-surface-1',
              isActive && 'text-primary',
              !isActive && !tab.disabled && 'text-muted-foreground'
            )}
          >
            <span
              className="flex shrink-0 items-center justify-center"
              style={{ width: DOCK_ICON_SIZE, height: DOCK_ICON_SIZE }}
              aria-hidden
            >
              <Icon
                size={DOCK_ICON_SIZE}
                strokeWidth={DOCK_ICON_STROKE}
                className="shrink-0"
              />
            </span>
            <span className="t-caption text-[10px] leading-tight">
              {tab.disabled ? 'Yakında' : tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
