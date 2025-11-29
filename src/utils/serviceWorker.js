export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const isSupportedProtocol = window.location.protocol === 'http:' || window.location.protocol === 'https:';
    
    if (isSupportedProtocol) {
      window.addEventListener('load', () => {
        const swPath = import.meta.env.PROD ? '/sw.js' : '/sw.js';
        navigator.serviceWorker.register(swPath, { scope: '/' })
          .then((registration) => {
            console.log('Service Worker registered:', registration);
          })
          .catch((error) => {
            console.log('Service Worker registration failed:', error);
          });
      });
    }
  }
}

