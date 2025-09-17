// Simple Service Worker for CampusHub360
const CACHE_NAME = 'campus-hub-360-v1';

// Handle fetch requests
self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);
  
  // Allow local requests and the Django backend
  if (url.hostname === 'localhost' || 
      url.hostname === '127.0.0.1' || 
      url.hostname.includes('localhost') ||
      url.hostname === '13.232.220.214') {
    event.respondWith(
      fetch(event.request).catch(function() {
        return new Response('Network error', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
    );
    return;
  }
  
  // Block other external requests for security
  event.respondWith(
    new Response('Blocked external request', {
      status: 403,
      statusText: 'Forbidden'
    })
  );
});

// Handle service worker installation
self.addEventListener('install', function(event) {
  console.log('Service Worker installed');
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', function(event) {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
});

