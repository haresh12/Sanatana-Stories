// Install event
self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
    self.skipWaiting();
  });
  
  // Activate event
  self.addEventListener('activate', (event) => {
    console.log('Service Worker activating.');
    return self.clients.claim();
  });