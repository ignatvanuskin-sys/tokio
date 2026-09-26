(() => {
  const old = document.getElementById('__snap_fix'); if (old) old.remove();
  const h = window.innerHeight;
  const s = document.createElement('style'); s.id = '__snap_fix';
  s.textContent = `[class*="min-h-[70svh]"]{min-height:${(0.7*h).toFixed(1)}px !important;}[class*="min-h-[calc(100svh-3.5rem)]"]{min-height:${h-56}px !important;}`;
  document.head.appendChild(s);
  const s2 = document.createElement('style'); s2.id = '__snap_noanim';
  s2.textContent = '*,*::before,*::after{animation:none !important;transition:none !important;}';
  document.head.appendChild(s2);
  const stepText = [...document.querySelectorAll('p,div,span')].map(x => (x.innerText || '').trim()).filter(t => /^ШАГ\s*\d\s*ИЗ\s*5/i.test(t))[0] || null;
  const h2 = [...document.querySelectorAll('h1,h2,h3')].map(x => { const r = x.getBoundingClientRect(); return { t: (x.innerText || '').trim().replace(/\s+/g, ' '), y: Math.round(r.top + window.scrollY), vis: r.width > 0 && r.height > 0, ff: getComputedStyle(x).fontFamily, tt: getComputedStyle(x).textTransform, fs: getComputedStyle(x).fontSize }; }).filter(x => x.vis && x.y > 100 && x.y < 1200);
  // progress segments
  const bar = document.querySelector('[class*="progress"],[role="progressbar"]');
  let segs = null;
  if (bar) { segs = { sel: bar.tagName + '.' + (typeof bar.className === 'string' ? bar.className.split(/\s+/).slice(0, 3).join('.') : ''), children: bar.children.length, html: bar.outerHTML.slice(0, 400) }; }
  // date cards
  const dateBtns = [...document.querySelectorAll('button')].filter(b => /\d{2}\.\d{2}|пн|вт|ср|чт|пт|сб|вс|янв|фев|мар|апр|мая|июн|июл|авг|сен|окт|ноя|дек/i.test(b.innerText || '')).map(b => { const r = b.getBoundingClientRect(); return { t: (b.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 40), y: Math.round(r.top + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) }; });
  const timeLabels = [...document.querySelectorAll('*')].filter(x => x.children.length === 0 && /^(Утро|День|Вечер)$/i.test((x.textContent || '').trim())).map(x => { const r = x.getBoundingClientRect(); return { t: x.textContent.trim(), y: Math.round(r.top + window.scrollY), w: Math.round(r.width), h: Math.round(r.height), fs: getComputedStyle(x).fontSize }; });
  const navBtns = [...document.querySelectorAll('button')].filter(b => /^(Далее|Назад)/.test((b.innerText || '').trim())).map(b => { const r = b.getBoundingClientRect(); return { t: b.innerText.trim(), y: Math.round(r.top + window.scrollY), vis: r.width > 0, bg: getComputedStyle(b).backgroundColor }; });
  const alerts = [...document.querySelectorAll('form *')].map(x => (x.innerText || '').trim()).filter(t => /ошибк|заполните|выберите|укажите/i.test(t)).slice(0, 5);
  return { url: location.href, docH: document.documentElement.scrollHeight, docW: document.documentElement.scrollWidth, iw: window.innerWidth, ih: window.innerHeight, step: stepText, visibleHeadings: h2, progress: segs, dateCards: dateBtns, timeLabels: timeLabels, navBtns: navBtns, warnings: alerts };
})()
