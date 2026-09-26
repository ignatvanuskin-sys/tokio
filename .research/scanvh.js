(() => {
  const W = window.innerHeight, H = window.innerWidth;
  const props = ['height','minHeight','maxHeight','paddingTop','paddingBottom','marginTop','marginBottom','fontSize','top','transform'];
  const out = [];
  const all = document.querySelectorAll('*');
  for (const el of all) {
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    let vhDeps = [];
    for (const p of props) {
      const v = cs[p];
      if (v && v.includes('vh')) vhDeps.push(p + '=' + v);
    }
    const h = Math.round(rect.height);
    const nearViewport = Math.abs(h - W) <= 3;
    if ((vhDeps.length || nearViewport) && (h > 200 || vhDeps.length)) {
      const id = el.id ? '#' + el.id : '';
      const cls = (typeof el.className === 'string' ? el.className : '').trim().split(/\s+/).slice(0, 4).join('.');
      out.push({
        sel: el.tagName.toLowerCase() + id + (cls ? '.' + cls : ''),
        h: h,
        vhDeps: vhDeps.join('; '),
        near: nearViewport,
        depth: (function(){let d=0,n=el;while(n.parentElement){d++;n=n.parentElement;}return d;})()
      });
    }
  }
  // also scan stylesheets for vh rules
  const rules = [];
  try {
    for (const ss of document.styleSheets) {
      let rs; try { rs = ss.cssRules; } catch(e) { continue; }
      if (!rs) continue;
      for (const r of rs) {
        if (r.cssText && /vh\b/.test(r.cssText) && r.cssText.length < 400) rules.push(r.cssText);
      }
    }
  } catch(e) {}
  return { innerH: W, innerW: H, docH: document.documentElement.scrollHeight, candidates: out.slice(0, 40), vhRules: rules.slice(0, 60) };
})()
