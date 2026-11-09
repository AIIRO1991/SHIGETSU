/* 指月：一度開けば電波がなくても起動できるよう、本体とアイコンを端末に保存する（v1.5 は対象外） */
const CACHE='shigetsu-v2.0-r70';
const FILES=['./','index.html','manifest.webmanifest','favicon.ico','apple-touch-icon.png','icons/shigetsu-icon.svg','icons/shigetsu-icon-32.png','icons/shigetsu-icon-192.png','icons/shigetsu-icon-512.png','icons/shigetsu-icon-maskable-192.png','icons/shigetsu-icon-maskable-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('shigetsu-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url); if(u.origin!==location.origin||u.pathname.includes('/v1.5/')) return;
  const isPage=r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('index.html');
  if(isPage){   // 本体：通信できれば最新を取って保存、できなければ保存済みを使う
    e.respondWith(fetch(r).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put('index.html',cp)); } return res; }).catch(()=>caches.match('index.html').then(x=>x||caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(r).then(x=>x||fetch(r).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)); } return res; })));   // アイコンなど：保存済みを優先
});
