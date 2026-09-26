import { readFileSync, writeFileSync } from 'node:fs';

const raw = JSON.parse(readFileSync(new URL('./reviews_all.json', import.meta.url), 'utf8'));

const clean = raw
  .filter((r) => typeof r.text === 'string' && r.text.trim().length > 0)
  .map((r) => ({
    id: r.id,
    rating: r.rating,
    date: (r.date_created || '').slice(0, 10),
    author: r.user?.name || 'Клиент 2ГИС',
    hasReply: Boolean(r.official_answer),
    reply: r.official_answer?.text ?? null,
    len: r.text.trim().length,
    text: r.text.replace(/\r/g, '').replace(/\n{2,}/g, '\n').trim(),
  }));

// Distribution across the reviews we can read (the API caps at 156 of 166).
const dist = {};
for (const r of clean) dist[r.rating] = (dist[r.rating] || 0) + 1;

const featured = clean
  .filter((r) => r.rating === 5 && r.len >= 180)
  .sort((a, b) => b.len - a.len)
  .slice(0, 14);

const out = { downloaded: raw.length, withText: clean.length, distribution: dist, featured };
writeFileSync(new URL('./reviews_picked.json', import.meta.url), JSON.stringify(out, null, 2), 'utf8');
console.log(`withText=${clean.length}`, JSON.stringify(dist));
console.log('featured:', featured.length);
