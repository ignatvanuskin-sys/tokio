import { readFileSync, existsSync } from 'node:fs';

const path = 'content/reviews.ts';
if (!existsSync(path)) {
  console.log('MISSING: content/reviews.ts was not written');
  process.exit(1);
}

const s = readFileSync(path, 'utf8');
console.log('bytes:', s.length);
console.log('replacement chars present:', s.includes('\uFFFD'));

const authors = [...s.matchAll(/"author": "([^"]+)"/g)].map((m) => m[1]);
const ratings = [...s.matchAll(/"rating": ([1-5])/g)].map((m) => Number(m[1]));

console.log('review count:', authors.length);
console.log('ratings:', ratings.join(', '));
console.log('authors:', authors.join(' | '));

// Print the first two texts to confirm the Cyrillic survived.
const texts = [...s.matchAll(/"text": "((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
console.log('\n--- text 1 ---\n' + (texts[0] ?? '').slice(0, 200));
console.log('\n--- text 2 ---\n' + (texts[1] ?? '').slice(0, 200));
