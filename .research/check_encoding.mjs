import { readFileSync } from 'node:fs';
const s = readFileSync('src/data/reviews.generated.ts', 'utf8');
const authors = [...s.matchAll(/"author": "([^"]+)"/g)].map((m) => m[1]);
const texts = [...s.matchAll(/"text": "((?:[^"\\]|\\.){0,90})/g)].map((m) => m[1]);
console.log('AUTHORS:', authors.join(' | '));
console.log('SAMPLE 1:', texts[0]);
console.log('SAMPLE 2:', texts[1]);
console.log('has replacement chars:', s.includes('\uFFFD'));
