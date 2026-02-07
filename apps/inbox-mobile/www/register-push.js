/**
 * Push registration: request permission, get FCM token, POST to backend, then redirect.
 * If app was opened from notification tap, redirects to inbox with ?conv=<id>.
 * Config: window.__INBOX_PUSH_CONFIG__ = { baseUrl, secret, locale }.
 */
(function () {
  var config = window.__INBOX_PUSH_CONFIG__;
  if (!config || !config.secret || config.secret === '<PLACEHOLDER>') return;
  var baseUrl = (config.baseUrl || '').replace(/\/$/, '');
  var secret = config.secret;
  var locale = config.locale || 'tr';
  var apiUrl = baseUrl + '/api/chat/admin/register-device';
  var inboxUrl = baseUrl + '/' + locale + '/inbox?key=' + encodeURIComponent(secret);
  function redirect(convId) {
    var url = convId ? inboxUrl + '&conv=' + encodeURIComponent(convId) : inboxUrl;
    window.location.replace(url);
  }
  function doRegister() {
    if (typeof Capacitor === 'undefined' || !Capacitor.Plugins.FirebaseMessaging) {
      redirect();
      return;
    }
    var FirebaseMessaging = Capacitor.Plugins.FirebaseMessaging;
    var getInitial = FirebaseMessaging.getInitialNotification ? FirebaseMessaging.getInitialNotification() : Promise.resolve(null);
    getInitial
      .then(function (notif) {
        var convId = (notif && notif.data && notif.data.conversationId) ? notif.data.conversationId : null;
        return FirebaseMessaging.requestPermissions().then(function () { return convId; });
      })
      .then(function (convId) {
        return FirebaseMessaging.getToken().then(function (tokenResult) {
          return { convId: convId, tokenResult: tokenResult };
        });
      })
      .then(function (out) {
        var convId = out && out.convId;
        var tokenResult = out && out.tokenResult;
        var token = tokenResult && (tokenResult.token || tokenResult.value || tokenResult);
        if (!token) {
          redirect(convId);
          return;
        }
        return fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
          body: JSON.stringify({ fcmToken: token, label: 'android' }),
        }).then(function () { return convId; });
      })
      .then(function (convId) { redirect(convId || null); })
      .catch(function () { redirect(); });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', doRegister);
  } else {
    doRegister();
  }
})();
