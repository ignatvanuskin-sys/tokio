/**
 * Vitest global setup.
 *
 * Points the demo booking store at a scratch file so tests never touch (or
 * pollute) the real .data/demo-db.json, and removes anything left over from a
 * previous run.
 */
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const scratchDb = path.join(tmpdir(), 'tokyo-vitest', 'demo-db.json');

rmSync(path.dirname(scratchDb), { recursive: true, force: true });
process.env.DEMO_DB_PATH = scratchDb;
