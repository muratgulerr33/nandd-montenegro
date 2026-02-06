"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";

const TOKEN_NAMES = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
] as const;

interface TokenItem {
  name: string;
  value: string;
  cssVar: string;
}

function getTokenValue(name: string): string {
  if (typeof document === "undefined") return "";
  try {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(`--${name}`)
      .trim();
    return value || "(missing)";
  } catch {
    return "(missing)";
  }
}

function TokenCard({
  token,
  onCopy,
}: {
  token: TokenItem;
  onCopy: (value: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (token.value === "(missing)") return;
    onCopy(token.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [token.value, onCopy]);

  return (
    <Card
      className="rounded-2xl shadow-sm overflow-hidden cursor-pointer transition-opacity hover:opacity-95"
      onClick={handleCopy}
    >
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm text-foreground truncate">
            {token.name}
          </span>
          {token.value !== "(missing)" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              className="shrink-0 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
              aria-label="Copy value"
            >
              {copied ? (
                <span className="text-xs">✓</span>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              )}
            </button>
          )}
        </div>
        <div
          className="w-full h-10 rounded-lg border border-border flex-shrink-0"
          style={{ backgroundColor: `var(--${token.name})` }}
        />
        <div className="text-xs text-muted-foreground font-mono truncate">
          {token.value}
        </div>
      </CardContent>
    </Card>
  );
}

export function ThemeTokensGrid() {
  const [tokens, setTokens] = useState<TokenItem[]>([]);

  const updateTokens = useCallback(() => {
    const items: TokenItem[] = TOKEN_NAMES.map((name) => ({
      name,
      cssVar: `--${name}`,
      value: getTokenValue(name),
    }));
    setTokens(items);
  }, []);

  useEffect(() => {
    queueMicrotask(updateTokens);
    const observer = new MutationObserver(() => queueMicrotask(updateTokens));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [updateTokens]);

  const copyToClipboard = useCallback((value: string) => {
    void navigator.clipboard?.writeText(value);
  }, []);

  if (tokens.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {TOKEN_NAMES.map((name) => (
          <Card key={name} className="rounded-2xl shadow-sm">
            <CardContent className="p-4 animate-pulse">
              <div className="h-4 w-2/3 bg-muted rounded mb-3" />
              <div className="w-full h-10 bg-muted rounded-lg mb-2" />
              <div className="h-3 w-full bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {tokens.map((token) => (
        <TokenCard
          key={token.name}
          token={token}
          onCopy={copyToClipboard}
        />
      ))}
    </div>
  );
}
