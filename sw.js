importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.3.0/workbox-sw.js');

// 注册 Service Worker
workbox.routing.registerRoute(
  new workbox.routing.NavigationRoute(({ request }) => {
    console.log('[Service Worker] Handling navigation request', request.url);
    return fetch(request);
  })
);

setInterval(() => {
    self.clients.matchAll().then(function(clients) {
        clients.forEach(function(client) {
            client.postMessage({
                action: 'callMethod',
                methodName: 'updateDatabaseInfo',
                args: []
            });
        });
    });
}, 30 * 60 * 1000);