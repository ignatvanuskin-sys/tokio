(() => {
  const old = document.getElementById('__snap_fix');
  if (old) old.remove();
  const s = document.createElement('style');
  s.id = '__snap_fix';
  s.textContent = `
    [class*="min-h-[70svh]"] { min-height: 590.8px !important; }
    [class*="min-h-[calc(100svh-3.5rem)]"] { min-height: 788px !important; }
  `;
  document.head.appendChild(s);
  // freeze animations/transitions so captures are deterministic
  const s2 = document.createElement('style');
  s2.id = '__snap_noanim';
  s2.textContent = '*,*::before,*::after{animation:none !important;transition:none !important;scroll-behavior:auto !important;}';
  document.head.appendChild(s2);
  return { injected: true, docH: document.documentElement.scrollHeight, docW: document.documentElement.scrollWidth, innerW: window.innerWidth, innerH: window.innerHeight };
})()
