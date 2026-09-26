(async () => {
  const visBtns = () => [...document.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0 && b.getBoundingClientRect().height > 0);
  const cards = visBtns().filter(b => /^(СЕГОДНЯ|ЗАВТРА|ПН|ВТ|СР|ЧТ|ПТ|СБ|ВС)\s*\d{2}/i.test((b.innerText || '').trim()));
  if (!cards.length) return { ok: false, reason: 'no date cards', sample: visBtns().map(b => b.innerText.trim().slice(0, 18)) };
  const pick = cards[Math.min(2, cards.length - 1)];
  const picked = pick.innerText.trim().replace(/\s+/g, ' ');
  pick.scrollIntoView({ block: 'center' });
  pick.click();
  await new Promise(r => setTimeout(r, 500));
  const sel = (document.body.innerText.match(/Вы выбрали:[^\n]*/) || [null])[0];
  const next = visBtns().filter(b => b.innerText.trim() === 'Далее')[0];
  if (!next) return { ok: false, reason: 'no Далее after date pick', picked: picked, selected: sel };
  next.scrollIntoView({ block: 'center' });
  next.click();
  await new Promise(r => setTimeout(r, 900));
  const step = (document.body.innerText.match(/ШАГ\s*\d\s*ИЗ\s*5[^\n]*/i) || [null])[0];
  const heads = [...document.querySelectorAll('h2,h3')].filter(x => x.getBoundingClientRect().width > 0).map(x => x.innerText.trim().replace(/\s+/g, ' ').slice(0, 45)).slice(0, 4);
  const timeLabels = [...document.querySelectorAll('*')].filter(x => x.children.length === 0 && /^(УТРО|ДЕНЬ|ВЕЧЕР)$/i.test((x.textContent || '').trim())).map(x => x.textContent.trim());
  return { ok: true, pickedDate: picked, selectedText: sel, step: step, heads: heads, timeLabelsFound: timeLabels, docH: document.documentElement.scrollHeight };
})()
