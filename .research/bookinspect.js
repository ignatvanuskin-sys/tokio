(() => {
  const old = document.getElementById('__snap_fix'); if (old) old.remove();
  const h = window.innerHeight;
  const s = document.createElement('style'); s.id = '__snap_fix';
  s.textContent = `[class*="min-h-[70svh]"]{min-height:${(0.7*h).toFixed(1)}px !important;}[class*="min-h-[calc(100svh-3.5rem)]"]{min-height:${h-56}px !important;}`;
  document.head.appendChild(s);
  const s2 = document.createElement('style'); s2.id = '__snap_noanim';
  s2.textContent = '*,*::before,*::after{animation:none !important;transition:none !important;}';
  document.head.appendChild(s2);
  const hs = [...document.querySelectorAll('h1,h2,h3')].map(x => (x.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 70)).filter(Boolean);
  const btns = [...document.querySelectorAll('button,a')].map(b => {
    const r = b.getBoundingClientRect();
    return { t: (b.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 30), bg: getComputedStyle(b).backgroundColor, y: Math.round(r.top + window.scrollY), vis: r.width > 0 && r.height > 0 };
  }).filter(b => b.t);
  const steps = [...document.querySelectorAll('[class*="stepper"],[class*="step"],[role="progressbar"],[class*="progress"]')].slice(0, 12).map(e => ({ sel: e.tagName.toLowerCase() + '.' + (typeof e.className === 'string' ? e.className.trim().split(/\s+/).slice(0, 3).join('.') : ''), t: (e.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 60), y: Math.round(e.getBoundingClientRect().top + window.scrollY) }));
  return { url: location.href, docH: document.documentElement.scrollHeight, docW: document.documentElement.scrollWidth, iw: window.innerWidth, ih: window.innerHeight, headings: hs, buttons: btns, steps: steps, bodyStart: document.body.innerText.replace(/\s+/g, ' ').slice(0, 500) };
})()
