(() => {
  const old = document.getElementById('__snap_fix'); if (old) old.remove();
  const h = window.innerHeight;
  const s = document.createElement('style');
  s.id = '__snap_fix';
  s.textContent = `
    [class*="min-h-[70svh]"] { min-height: ${(0.7 * h).toFixed(1)}px !important; }
    [class*="min-h-[calc(100svh-3.5rem)]"] { min-height: ${h - 56}px !important; }
  `;
  document.head.appendChild(s);
  const s2 = document.createElement('style');
  s2.id = '__snap_noanim';
  s2.textContent = '*,*::before,*::after{animation:none !important;transition:none !important;scroll-behavior:auto !important;}';
  document.head.appendChild(s2);
  window.__baseDocH = document.documentElement.scrollHeight;
  return { baseInnerH: h, docH: document.documentElement.scrollHeight, docW: document.documentElement.scrollWidth };
})()
