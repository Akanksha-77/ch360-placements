// Service Worker Cleanup Script
// This script will unregister any existing service workers and clear caches

if ('serviceWorker' in navigator) {
  // Unregister all service workers
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('Service worker unregistered:', registration.scope);
    }
  });

  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      console.log('All caches cleared');
    });
  }
}

// Clear localStorage and sessionStorage
localStorage.clear();
sessionStorage.clear();

console.log('Cleanup completed - all service workers, caches, and storage cleared');




