'use client';

import { Users, Inbox, Phone, MessageCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export type InboxTab = 'visitors' | 'inbox' | 'calls' | 'quickwp' | 'settings';

type TabItem = {
  id: InboxTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled: boolean;
};

const TABS: TabItem[] = [
  { id: 'visitors', label: 'Ziyaretçiler', icon: Users, disabled: true },
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
            <Icon className="size-5" />
            <span className="t-caption text-[10px] leading-tight">
              {tab.disabled ? 'Yakında' : tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
