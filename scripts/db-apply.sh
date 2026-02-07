#!/usr/bin/env bash
# Apply drizzle migration.sql files in name order. Single command: npm run db:apply

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

set +u
[ -f .env ] && source .env
set -u

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Hata: DATABASE_URL tanımlı değil (.env içinde olmalı)." >&2
  exit 1
fi

MIGRATIONS="$(find drizzle -name 'migration.sql' -type f 2>/dev/null | sort)"
if [ -z "$MIGRATIONS" ]; then
  echo "Uyarı: drizzle/*/migration.sql bulunamadı." >&2
  exit 0
fi

while IFS= read -r f; do
  [ -z "$f" ] && continue
  echo "  -> $f"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f" -q
done <<< "$MIGRATIONS"

echo "db:apply tamamlandı."
