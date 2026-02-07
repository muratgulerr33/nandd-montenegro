#!/usr/bin/env bash
# Chat smoke: guest/start -> guest/message -> admin/conversations (hasUnread) -> mark-read
# Kullanım: ADMIN_SECRET=xxx [BASE_URL=http://127.0.0.1:3000] ./scripts/smoke-chat.sh

set -e
BASE_URL="${BASE_URL:-http://127.0.0.1:3000}"
BASE_URL="${BASE_URL%/}"
SECRET="${ADMIN_SECRET:-}"

if [ -z "$SECRET" ]; then
  echo "ADMIN_SECRET gerekli. Örn: ADMIN_SECRET=xxx npm run smoke-chat" >&2
  exit 1
fi

echo "Base URL: $BASE_URL"
echo "---"

# 1) Guest start
echo "1. POST /api/chat/guest/start"
START_JSON="$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/chat/guest/start")"
START_BODY="$(echo "$START_JSON" | sed '$d')"
START_CODE="$(echo "$START_JSON" | tail -n 1)"
if [ "$START_CODE" != "200" ]; then
  echo "  FAIL status=$START_CODE" >&2
  echo "$START_BODY" >&2
  exit 1
fi
CONV_ID="$(echo "$START_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('conversationId',''))")"
VISITOR_ID="$(echo "$START_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('visitorId',''))")"
if [ -z "$CONV_ID" ] || [ -z "$VISITOR_ID" ]; then
  echo "  FAIL: conversationId or visitorId missing in response" >&2
  echo "$START_BODY" >&2
  exit 1
fi
echo "  OK conversationId=$CONV_ID"

# 2) Guest message
echo "2. POST /api/chat/guest/message"
MSG_BODY='smoke test message'
MSG_JSON="$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" \
  -d "{\"conversationId\":\"$CONV_ID\",\"visitorId\":\"$VISITOR_ID\",\"body\":\"$MSG_BODY\"}" \
  "$BASE_URL/api/chat/guest/message")"
MSG_CODE="$(echo "$MSG_JSON" | tail -n 1)"
if [ "$MSG_CODE" != "200" ]; then
  echo "  FAIL status=$MSG_CODE" >&2
  echo "$MSG_JSON" | sed '$d' >&2
  exit 1
fi
echo "  OK"

# 3) Admin conversations (check hasUnread)
echo "3. GET /api/chat/admin/conversations"
CONV_LIST="$(curl -s -w "\n%{http_code}" -H "x-admin-secret: $SECRET" "$BASE_URL/api/chat/admin/conversations")"
CONV_LIST_BODY="$(echo "$CONV_LIST" | sed '$d')"
CONV_LIST_CODE="$(echo "$CONV_LIST" | tail -n 1)"
if [ "$CONV_LIST_CODE" != "200" ]; then
  echo "  FAIL status=$CONV_LIST_CODE" >&2
  echo "$CONV_LIST_BODY" >&2
  exit 1
fi
if ! echo "$CONV_LIST_BODY" | grep -q '"hasUnread":true'; then
  echo "  WARN: no hasUnread:true in response (conversation may already be read)"
fi
echo "  OK"

# 4) Mark read
echo "4. POST /api/chat/admin/mark-read"
MARK_JSON="$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" \
  -H "x-admin-secret: $SECRET" \
  -d "{\"conversationId\":\"$CONV_ID\"}" \
  "$BASE_URL/api/chat/admin/mark-read")"
MARK_CODE="$(echo "$MARK_JSON" | tail -n 1)"
if [ "$MARK_CODE" != "200" ]; then
  echo "  FAIL status=$MARK_CODE" >&2
  echo "$MARK_JSON" | sed '$d' >&2
  exit 1
fi
echo "  OK"

echo "---"
echo "smoke-chat OK"
