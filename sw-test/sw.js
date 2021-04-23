self.addEventListener('install', function(event) {
  console.log("install called");
  event.waitUntil(
    caches.open('v1').then(function(cache) {
      return cache.addAll([
        '/sw-test/',
        '/sw-test/index.html',
        '/sw-test/style.css',
        '/sw-test/app.js',
        '/sw-test/image-list.js',
        '/sw-test/star-wars-logo.jpg',
        '/sw-test/gallery/bountyHunters.jpg',
        '/sw-test/gallery/myLittleVader.jpg',
        '/sw-test/gallery/snowTroopers.jpg'
      ]);
    })
  );
});

self.addEventListener('activate', function(event) {
  console.log("active called");
});

self.addEventListener('fetch', function(event) {
  event.respondWith(caches.match(event.request).then(function(response) {
    // caches.match() always resolves
    // but in case of success response will have value
    console.log("fetch called");
    
// Get all the clients, and for each post a message
clients.matchAll().then(clients => {
  clients.forEach(client => {
      // Post "addAll" to get a list of files to cache
      clientPostMessage(client, "Hello Brave").then(message => {
          // For each file, check if it already exists in the cache
          message.forEach(url => {
              caches.match(url).then(result => {
                  // If there's nothing in the cache, fetch the file and cache it
                  if(!result) {
                      fetch(url).then(response => {
                          caches.open(cacheName).then(cache => {
                              cache.put(url, response);
                          });
                      });
                  }
              })
          });
      });
  })
});

    if (response !== undefined) {
      return response;
    } else {
      return fetch(event.request).then(function (response) {
        // response may be used only once
        // we need to save clone to put one copy in cache
        // and serve second one
        let responseClone = response.clone();
        
        caches.open('v1').then(function (cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(function () {
        return caches.match('/sw-test/gallery/myLittleVader.jpg');
      });
    }
  }));
});

self.addEventListener('message', function(event){
  console.log("SW Received Message: " + event.data);
});

function clientPostMessage(client, message){
  return new Promise(function(resolve, reject){
      var channel = new MessageChannel();

      channel.port1.onmessage = function(event){
          if(event.data.error){
              reject(event.data.error);
          }
          else {
              resolve(event.data);
          }
      };

      client.postMessage(message, [channel.port2]);
  });
};