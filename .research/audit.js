(() => {
  const vw = window.innerWidth;
  const btns = [...document.querySelectorAll('a,button')].slice(0, 400).map(b => {
    const cs = getComputedStyle(b);
    const r = b.getBoundingClientRect();
    return { t: (b.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 40), bg: cs.backgroundColor, color: cs.color, border: cs.borderTopColor, y: Math.round(r.top + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) };
  }).filter(b => b.t && b.w > 40 && b.h > 20);
  const over = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const right = r.right + window.scrollX;
    const left = r.left + window.scrollX;
    if (right > vw + 1.5 || left < -1.5) {
      const cls = (typeof el.className === 'string' ? el.className : '').trim().split(/\s+/).slice(0, 3).join('.');
      over.push({ sel: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (cls ? '.' + cls : ''), left: Math.round(left), right: Math.round(right), w: Math.round(r.width), txt: (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 40) });
    }
  }
  const clipped = [];
  for (const el of document.querySelectorAll('h1,h2,h3,h4,p,span,a,button,li')) {
    if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
      const cs = getComputedStyle(el);
      if (cs.overflow === 'visible') continue;
      clipped.push({ sel: el.tagName.toLowerCase() + (el.id ? '#' + el.id : ''), sw: el.scrollWidth, cw: el.clientWidth, txt: (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 50) });
    }
  }
  const sticky = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed' || cs.position === 'sticky') {
      const cls = (typeof el.className === 'string' ? el.className : '').trim().split(/\s+/).slice(0, 3).join('.');
      const r = el.getBoundingClientRect();
      sticky.push({ sel: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (cls ? '.' + cls : ''), pos: cs.position, h: Math.round(r.height), txt: (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 40) });
    }
  }
  const h1 = document.querySelector('h1');
  const h1s = h1 ? { text: (h1.innerText || '').trim().slice(0, 50), font: getComputedStyle(h1).fontFamily, tt: getComputedStyle(h1).textTransform, fs: getComputedStyle(h1).fontSize, fw: getComputedStyle(h1).fontWeight } : null;
  const colorCount = {};
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    for (const p of ['backgroundColor', 'color']) {
      const v = cs[p];
      const m = v.match(/^rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)$/);
      if (!m) continue;
      const a = m[4] === undefined ? 1 : parseFloat(m[4]);
      if (a < 0.5) continue;
      const r = +m[1], g = +m[2], b = +m[3];
      if (r > 150 && g > 40 && g < 150 && b < 100 && r > g + 60) colorCount[p + '=' + v] = (colorCount[p + '=' + v] || 0) + 1;
    }
  }
  return { url: location.href, vw, docW: document.documentElement.scrollWidth, docH: document.documentElement.scrollHeight, h1: h1s, orangeish: colorCount, buttons: btns.slice(0, 30), overflow: over.slice(0, 20), clipped: clipped.slice(0, 20), sticky: sticky.slice(0, 12) };
})()
