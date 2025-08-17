// Service Worker Registration for Production
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    }).then(function(registration) {
      console.log('✅ Service Worker registered successfully:', registration);
      
      // Check for updates
      registration.addEventListener('updatefound', function() {
        console.log('🔄 Service Worker update found');
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', function() {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🆕 New Service Worker available');
              // Optionally show update notification to user
            }
          });
        }
      });
    }).catch(function(error) {
      console.error('❌ Service Worker registration failed:', error);
    });
  });
}
