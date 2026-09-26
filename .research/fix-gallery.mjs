import { readFileSync, writeFileSync } from 'node:fs';

/**
 * Fix: gallery tiles rendered permanently invisible.
 *
 * Cause — the tile faded itself in from opacity-0 and only flipped the state in
 * React onLoad. When the browser already holds the image in cache, the load
 * event fires BEFORE React attaches the handler (or the img is already complete
 * at mount), so onLoad never runs and the tile stays at opacity 0 forever.
 * DOM evidence from QA: complete === true, naturalWidth 187, opacity: 0.
 *
 * Fix — keep the fade for the cold-cache case, but reconcile on mount by
 * checking img.complete, so an already-loaded image can never stay hidden.
 */
const file = 'src/components/Gallery.tsx';
let source = readFileSync(file, 'utf8');

const before = [
  '  const [loaded, setLoaded] = useState(false);',
  '  const { width, height } = intrinsicSize(item.id, 960);',
].join('\n');

const after = [
  '  const [loaded, setLoaded] = useState(false);',
  '  const imgRef = useRef<HTMLImageElement | null>(null);',
  '  const { width, height } = intrinsicSize(item.id, 960);',
  '',
  '  /**',
  '   * A cached image fires its load event before React attaches onLoad, so the',
  '   * handler alone is not enough — the tile would stay at opacity 0 forever.',
  '   * Reconcile once on mount against the element own state instead.',
  '   */',
  '  useEffect(() => {',
  '    if (imgRef.current?.complete) setLoaded(true);',
  '  }, []);',
].join('\n');

if (!source.includes(before)) {
  console.log('SKIP: state block not found');
} else {
  source = source.replace(before, after);
  console.log('ok: mount reconciliation added');
}

const imgBefore = ['            draggable={false}', '            onLoad={() => setLoaded(true)}'].join('\n');
const imgAfter = [
  '            draggable={false}',
  '            ref={imgRef}',
  '            onLoad={() => setLoaded(true)}',
].join('\n');

if (!source.includes(imgBefore)) {
  console.log('SKIP: img block not found');
} else {
  source = source.replace(imgBefore, imgAfter);
  console.log('ok: ref attached');
}

writeFileSync(file, source, 'utf8');
console.log('gallery fixed');
