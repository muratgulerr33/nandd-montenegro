'use client';

import { cn } from '@/lib/utils';

export function ComingSoonPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center justify-center p-6 text-center',
        className
      )}
    >
      <p className="t-body text-muted-foreground">Yakında</p>
    </div>
  );
}
