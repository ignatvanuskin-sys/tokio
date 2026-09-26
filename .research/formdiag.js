(() => {
  const fs = document.querySelector('fieldset.step-in');
  const chain = [];
  let n = fs;
  while (n && n !== document.documentElement) {
    const cs = getComputedStyle(n);
    const r = n.getBoundingClientRect();
    chain.push({ sel: n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') + (typeof n.className === 'string' && n.className ? '.' + n.className.trim().split(/\s+/).slice(0, 4).join('.') : ''), display: cs.display, vis: cs.visibility, op: cs.opacity, pos: cs.position, h: Math.round(r.height), w: Math.round(r.width), ov: cs.overflow, tf: cs.transform });
    n = n.parentElement;
  }
  const h3 = [...document.querySelectorAll('h3,h2,h1')].filter(x => /что нужно сделать/i.test(x.innerText || ''));
  const stepInfo = h3.map(x => { const r = x.getBoundingClientRect(); return { txt: x.innerText.trim(), y: Math.round(r.top + window.scrollY), w: Math.round(r.width), h: Math.round(r.height), ff: getComputedStyle(x).fontFamily, tt: getComputedStyle(x).textTransform }; });
  return { url: location.href, scrollY: window.scrollY, fsFound: !!fs, fsRect: fs ? (r => ({ top: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width) }))(fs.getBoundingClientRect()) : null, chain: chain, stepHeading: stepInfo, allH: h3.length };
})()
