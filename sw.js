// የህፃናት ኦሎምፒክ ውድድር — Service Worker
// 📲 መተግበሪያው እንደ አንድሮይድ አፕ እንዲጫን • 📶 ኢንተርኔት ሲጠፋ ገፁ ከተቀመጠው ቅጂ እንዲከፈት
// ገፁ (index.html) ሁልጊዜ መጀመሪያ ከኢንተርኔት ይመጣል — አዲስ ስሪት ሲጫን ተጠቃሚዎች ወዲያውኑ ያገኙታል
// ፋየርቤዝ፣ ኢሜል እና ሌሎች ከውጪ የሚመጡ ጥያቄዎች አይነኩም (ዳታው ሁልጊዜ በቀጥታ ከፋየርቤዝ)
const CACHE = 'oly-app-v1';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => {
      if (res && res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); }
      return res;
    }).catch(() => caches.match('./index.html').then(m => m || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => {
    if (res && res.ok && /\.(png|json|webmanifest|ico|svg)$/i.test(u.pathname)) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
    return res;
  })));
});
