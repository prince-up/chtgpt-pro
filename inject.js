// steal.js ko page mein inject karo
setTimeout(() => {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('steal.js');
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
}, 1000);