
const CURRENT_CACHE_NAME='version-1.03';let filesToCache=['./','./index.html','./service-worker.js','./serviceWorkerSettings.js','./js/bundle.js','./style/style.css','./img/board.png','./img/peg.png','./img/pegHolder.png','./img/vintage-concrete.png','https://fonts.googleapis.com/css?family=Kalam:400,700','./img/icons/android-chrome-36x36.png','./img/icons/android-chrome-48x48.png','./img/icons/android-chrome-72x72.png','./img/icons/android-chrome-96x96.png','./img/icons/android-chrome-144x144.png','./img/icons/android-chrome-192x192.png','./img/icons/android-chrome-256x256.png','./img/icons/android-chrome-384x384.png','./img/icons/android-chrome-512x512.png','./img/icons/apple-touch-icon-57x57.png','./img/icons/apple-touch-icon-60x60.png','./img/icons/apple-touch-icon-72x72.png','./img/icons/apple-touch-icon-76x76.png','./img/icons/apple-touch-icon-114x114.png','./img/icons/apple-touch-icon-120x120.png','./img/icons/apple-touch-icon-144x144.png','./img/icons/apple-touch-icon-152x152.png','./img/icons/apple-touch-icon-180x180.png','./img/icons/favicon-32x32.png','./img/icons/android-chrome-192x192.png','./img/icons/favicon-16x16.png','./img/icons/mstile-70x70.png','./img/icons/mstile-150x150.png','./img/icons/mstile-310x310.png','./img/icons/mstile-310x150.png','./manifest.json','./browserconfig.xml','./favicon.ico'];self.addEventListener('install',event=>{console.log("[ServiceWorker] Attempting to install service worker and cache files");event.waitUntil(addAllCacheFilesToCache(filesToCache,CURRENT_CACHE_NAME));});async function addAllCacheFilesToCache(files,cacheName)
{let cache=await caches.open(cacheName);console.log("[ServiceWorker] Caching files to Cache");return cache.addAll(files);}
self.addEventListener('activate',event=>{console.log("[ServiceWorker] Activated");event.waitUntil(makeCacheIsUpToDate(CURRENT_CACHE_NAME));});async function makeCacheIsUpToDate(actualCacheName)
{let cacheNames=await caches.keys();let cacheNamesToDelete=cacheNames.filter(cacheName=>cacheName!==actualCacheName);cacheNamesToDelete.forEach(cacheName=>deleteCachedFiles(cacheName));return Promise.all(cacheNamesToDelete);}
function deleteCachedFiles(cacheName)
{console.log("[ServiceWorker] Removing Cached Files from Cache - ",cacheName);return caches.delete(cacheName);}
self.addEventListener('fetch',event=>{console.log("[ServiceWorker] Fetch event for ",event.request.url);event.respondWith(getRequestedData(event.request,CURRENT_CACHE_NAME));});async function getRequestedData(request,cacheName)
{let foundInCache=await getFromCache(request);if(foundInCache)
{return respondWithCachedFile(request,foundInCache);}
else
{try
{return await fetchDataFromServerAndSaveInCache(request,cacheName);}
catch(error)
{console.log("[ServiceWorker] Unable to fetch due to an error: "+error);}}}
async function getFromCache(request)
{return await caches.match(request);}
async function respondWithCachedFile(request,result)
{console.log("[ServiceWorker] Found in Cache ",request.url,result);return result;}
async function fetchDataFromServerAndSaveInCache(request,cacheName)
{console.log("[ServiceWorker] Not found in Cache, atempting to fetch data from location ",request.url);let requestClone=request.clone();let serverResponse=await fetch(requestClone);let serverResponseClone=serverResponse.clone();addNewDataToCache(cacheName,request,serverResponseClone);return serverResponse;}
async function addNewDataToCache(cacheName,request,data)
{let cache=await caches.open(cacheName);cache.put(request,data);console.log("[ServiceWorker] New data has been successfully cached ",request.url);}