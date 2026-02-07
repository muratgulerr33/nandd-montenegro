import { redirect } from 'next/navigation';
import { InboxClient } from './InboxClient';

type Props = { searchParams: Promise<{ key?: string; conv?: string }> };

export default async function InboxPage({ searchParams }: Props) {
  const { key, conv } = await searchParams;
  const secret = process.env.ADMIN_INBOX_SECRET;
  if (!secret || key !== secret) {
    redirect('/');
  }
  return (
    <div className="min-h-dvh bg-background">
      <InboxClient secret={key} initialConversationId={conv ?? undefined} />
    </div>
  );
}
