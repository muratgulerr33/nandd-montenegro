/**
 * Push registration: request permission, get FCM token, POST to backend, then redirect.
 * Called from index.html with window.__INBOX_PUSH_CONFIG__ = { baseUrl, secret, locale }.
 */

(function () {
  const config = window.__INBOX_PUSH_CONFIG__;
  if (!config || !config.secret) return;

  const baseUrl = (config.baseUrl || '').replace(/\/$/, '');
  const secret = config.secret;
  const locale = config.locale || 'tr';
  const apiUrl = baseUrl + '/api/chat/admin/register-device';
  const inboxUrl = baseUrl + '/' + locale + '/inbox?key=' + encodeURIComponent(secret);

  function redirect(convId) {
    const url = convId ? inboxUrl + '&conv=' + encodeURIComponent(convId) : inboxUrl;
    window.location.replace(url);
  }

  function doRegister() {
    if (typeof Capacitor === 'undefined' || !Capacitor.Plugins.FirebaseMessaging) {
      redirect();
      return;
    }
    const FirebaseMessaging = Capacitor.Plugins.FirebaseMessaging;
    FirebaseMessaging.requestPermissions()
      .then(function (result) {
        if (result.receive !== 'granted') {
          redirect();
          return;
        }
        return FirebaseMessaging.getToken();
      })
      .then(function (tokenResult) {
        const token = tokenResult && (tokenResult.token || tokenResult.value || tokenResult);
        if (!token) {
          redirect();
          return;
        }
        return fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-secret': secret,
          },
          body: JSON.stringify({ fcmToken: token, label: 'android' }),
        }).then(function () { return token; });
      })
      .then(function () {
        redirect();
      })
      .catch(function () {
        redirect();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', doRegister);
  } else {
    doRegister();
  }
})();
