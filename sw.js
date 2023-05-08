importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.3.0/workbox-sw.js');

// 注册 Service Worker
workbox.routing.registerRoute(
  new workbox.routing.NavigationRoute(({ request }) => {
    console.log('[Service Worker] Handling navigation request', request.url);
    return fetch(request);
  })
);

// 在每隔 30 分钟更新数据
// setInterval(() => {
//   console.log('[Service Worker] Updating data...');
//   // 执行更新数据的操作
// }, 30 * 60 * 1000);

setInterval(() => {
    console.log('[Service Worker] Updating data...');
}, 1000);