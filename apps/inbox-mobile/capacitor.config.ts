import type { CapacitorConfig } from '@capacitor/cli';

// Prod build: INBOX_SERVER_URL veya NEXT_PUBLIC_INBOX_URL ile prod domain verin (örn. npx cap sync android öncesi export)
// Debug build: INBOX_SERVER_URL boş bırakıp aşağıdaki server.url'i açın veya INBOX_SERVER_URL=http://10.0.2.2:3000
const serverUrl = process.env.INBOX_SERVER_URL || process.env.NEXT_PUBLIC_INBOX_URL || '';

const config: CapacitorConfig = {
  appId: 'com.nandd.inbox',
  appName: 'NANDD Inbox',
  webDir: 'www',
  server:
    serverUrl.trim() !== ''
      ? { url: serverUrl.trim().replace(/\/$/, '') }
      : {
          // Debug: emülatör için açın
          // url: 'http://10.0.2.2:3000',
        },
};

export default config;
