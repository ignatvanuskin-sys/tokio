(async () => {
  await new Promise(r => setTimeout(r, 2000));
  const old = document.getElementById('__snap_fix'); if (old) old.remove();
  const h = window.innerHeight;
  const s = document.createElement('style'); s.id = '__snap_fix';
  s.textContent = `[class*="min-h-[70svh]"]{min-height:${(0.7*h).toFixed(1)}px !important;}[class*="min-h-[calc(100svh-3.5rem)]"]{min-height:${h-56}px !important;}`;
  document.head.appendChild(s);
  const s2 = document.createElement('style'); s2.id = '__snap_noanim';
  s2.textContent = '*,*::before,*::after{animation:none !important;transition:none !important;}';
  document.head.appendChild(s2);
  const hs = [...document.querySelectorAll('h1,h2,h3')].map(x => { const r = x.getBoundingClientRect(); return { t: (x.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 55), ff: getComputedStyle(x).fontFamily.split(',')[0], tt: getComputedStyle(x).textTransform, fs: getComputedStyle(x).fontSize, y: Math.round(r.top + window.scrollY), vis: r.width > 0 }; }).filter(x => x.vis).slice(0, 14);
  const imgs = [...document.querySelectorAll('img')].filter(i => i.getBoundingClientRect().width > 0).length;
  const orange = {};
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    for (const p of ['backgroundColor', 'color']) {
      const m = cs[p].match(/^rgba?\((\d+), (\d+), (\d+)/); if (!m) continue;
      const r = +m[1], g = +m[2], b = +m[3];
      if (r > 150 && g > 40 && g < 150 && b < 100 && r > g + 60) orange[p + '=rgb(' + r + ',' + g + ',' + b + ')'] = (orange[p + '=rgb(' + r + ',' + g + ',' + b + ')'] || 0) + 1;
    }
  }
  const over = [];
  const vw = window.innerWidth;
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    if (r.right + window.scrollX > vw + 1.5 || r.left + window.scrollX < -1.5) {
      over.push({ sel: el.tagName.toLowerCase() + '.' + (typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 3).join('.') : ''), left: Math.round(r.left), right: Math.round(r.right), txt: (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 35) });
    }
  }
  return { url: location.href, docH: document.documentElement.scrollHeight, docW: document.documentElement.scrollWidth, iw: window.innerWidth, ih: window.innerHeight, headings: hs, imgCount: imgs, orange: orange, overflow: over.slice(0, 12) };
})()
