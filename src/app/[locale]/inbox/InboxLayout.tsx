'use client';

import { useState } from 'react';
import { BottomNav, type InboxTab } from './BottomNav';
import { ComingSoonPlaceholder } from './ComingSoonPlaceholder';

export function InboxLayout({
  children,
  settingsChildren,
}: {
  children: React.ReactNode;
  settingsChildren: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<InboxTab>('inbox');

  return (
    <div className="flex h-dvh flex-col bg-background">
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {activeTab === 'inbox' && children}
        {activeTab === 'settings' && settingsChildren}
        {(activeTab === 'visitors' ||
          activeTab === 'calls' ||
          activeTab === 'quickwp') && <ComingSoonPlaceholder />}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
