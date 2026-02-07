import { redirect } from 'next/navigation';
import { InboxClient } from './InboxClient';
import { InboxLayout } from './InboxLayout';
import { SettingsTab } from './SettingsTab';

type Props = { searchParams: Promise<{ key?: string; conv?: string }> };

export default async function InboxPage({ searchParams }: Props) {
  const { key, conv } = await searchParams;
  const secret = process.env.ADMIN_INBOX_SECRET;
  if (!secret || key !== secret) {
    redirect('/');
  }
  return (
    <InboxLayout
      settingsChildren={<SettingsTab secret={key} />}
    >
      <InboxClient secret={key} initialConversationId={conv ?? undefined} />
    </InboxLayout>
  );
}
