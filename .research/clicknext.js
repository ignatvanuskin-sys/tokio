(async () => {
  const vis = [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0 && b.getBoundingClientRect().height > 0);
  const target = vis.filter(b => b.innerText.trim() === 'Далее')[0];
  if (!target) return { ok: false, reason: 'no visible Далее button', visibleButtons: vis.map(b => b.innerText.trim().slice(0, 20)) };
  const before = document.body.innerText.match(/ШАГ\s*\d\s*ИЗ\s*5[^\n]*/i);
  target.scrollIntoView({ block: 'center' });
  target.click();
  await new Promise(r => setTimeout(r, 800));
  const after = document.body.innerText.match(/ШАГ\s*\d\s*ИЗ\s*5[^\n]*/i);
  const heads = [...document.querySelectorAll('h2,h3')].filter(x => x.getBoundingClientRect().width > 0).map(x => x.innerText.trim().replace(/\s+/g, ' ').slice(0, 45)).slice(0, 4);
  return { ok: true, before: before && before[0], after: after && after[0], heads: heads, docH: document.documentElement.scrollHeight };
})()
