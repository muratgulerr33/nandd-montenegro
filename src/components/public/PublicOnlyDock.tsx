'use client';

import { usePathname } from 'next/navigation';
import { StickyActionsDock } from '@/components/sticky-actions-dock';

/**
 * Public bottom dock (sosyal ikonlar + chat bubble) sadece müşteri sayfalarında
 * görünsün; admin inbox route'larında asla render etme.
 */
export function PublicOnlyDock() {
  const pathname = usePathname();
  const seg = pathname.split('/').filter(Boolean);

  const isInbox =
    seg[0] === 'inbox' ||
    seg[1] === 'inbox';

  if (isInbox) {
    return null;
  }

  return <StickyActionsDock />;
}
