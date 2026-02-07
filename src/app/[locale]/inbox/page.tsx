import { redirect } from 'next/navigation';
import { InboxClient } from './InboxClient';
import { InboxLayout } from './InboxLayout';
import { SettingsTab } from './SettingsTab';
import { VisitorsTab } from './VisitorsTab';

type Props = { searchParams: Promise<{ key?: string; conv?: string }> };

export default async function InboxPage({ searchParams }: Props) {
  const { key, conv } = await searchParams;
  const secret = process.env.ADMIN_INBOX_SECRET;
  if (!secret || key !== secret) {
    if (process.env.NODE_ENV === 'development') {
      const reason = !secret
        ? 'ADMIN_INBOX_SECRET env not set'
        : !key
          ? 'missing ?key= query'
          : '?key= does not match ADMIN_INBOX_SECRET';
      console.warn('[inbox] 307 redirect:', reason);
    }
    redirect('/');
  }
  return (
    <InboxLayout
      visitorsChildren={<VisitorsTab secret={key} />}
      settingsChildren={<SettingsTab secret={key} />}
    >
      <InboxClient secret={key} initialConversationId={conv ?? undefined} />
    </InboxLayout>
  );
}
