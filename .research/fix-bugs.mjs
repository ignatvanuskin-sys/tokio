import { readFileSync, writeFileSync } from 'node:fs';

/* ==========================================================================
 * FIX 1 — BookingWidget: React error #300 (hooks order).
 *
 * `const slotGroups = useMemo(...)` sat AFTER `if (result) return <SuccessScreen/>`.
 * On the render where a booking succeeds, the early return skips that useMemo,
 * so React sees fewer hooks than on the previous render and throws #300 —
 * crashing the client exactly when the customer has just booked. Moving the
 * hook above the early return keeps the hook count stable on every render.
 * ========================================================================== */
{
  const file = 'src/components/booking/BookingWidget.tsx';
  let source = readFileSync(file, 'utf8');

  const earlyReturn = [
    '  if (result) {',
    '    return <SuccessScreen booking={result} onRestart={restart} />;',
    '  }',
    '',
  ].join('\n');

  const memoBlock = [
    "  /* ---------------------------------------------------------------- группы */",
    '',
    '  const slotGroups = useMemo(',
    '    () =>',
    '      [',
    "        { title: 'Утро', items: availability.slots.filter((s) => s.time < '12:00') },",
    '        {',
    "          title: 'День',",
    "          items: availability.slots.filter((s) => s.time >= '12:00' && s.time < '17:00'),",
    '        },',
    "        { title: 'Вечер', items: availability.slots.filter((s) => s.time >= '17:00') },",
    '      ].filter((group) => group.items.length > 0),',
    '    [availability],',
    '  );',
    '',
  ].join('\n');

  if (!source.includes(earlyReturn) || !source.includes(memoBlock)) {
    console.log('FIX1 SKIP: anchor blocks not found');
  } else {
    // Remove the early return, then re-insert it after the hook.
    source = source.replace(earlyReturn, '');
    source = source.replace(memoBlock, memoBlock + earlyReturn);
    writeFileSync(file, source, 'utf8');

    const order = source.indexOf('const slotGroups = useMemo(') < source.indexOf('if (result) {');
    console.log(`FIX1 ok — hooks now precede the early return: ${order}`);
  }
}

/* ==========================================================================
 * FIX 2 — Gallery tiles rendered invisible.
 *
 * The tile faded itself in from opacity-0 driven by React state. A cached image
 * fires `load` before React attaches onLoad, and the mount-time `complete`
 * check proved unreliable in practice — QA still measured computed
 * `opacity: 0` on all 17 tiles while every image was loaded (complete: true,
 * naturalWidth 187). Rather than keep chasing the race, the fade is removed:
 * a thumbnail does not need a JS-driven reveal, and an always-visible image
 * cannot get stuck hidden. A LQIP background keeps the loading state calm.
 * ========================================================================== */
{
  const file = 'src/components/Gallery.tsx';
  let source = readFileSync(file, 'utf8');

  const stateBlock = [
    '  const [loaded, setLoaded] = useState(false);',
    '  const imgRef = useRef<HTMLImageElement | null>(null);',
  ].join('\n');

  if (source.includes(stateBlock)) {
    source = source.replace(stateBlock, '');
    console.log('FIX2 ok — removed loaded state + ref');
  } else {
    console.log('FIX2 SKIP: state block not found');
  }

  // Drop the mount-reconciliation effect (no longer needed).
  const effectStart = source.indexOf('  /**\n   * A cached image fires');
  if (effectStart !== -1) {
    const effectEnd = source.indexOf('}, []);', effectStart);
    if (effectEnd !== -1) {
      source = source.slice(0, effectStart) + source.slice(effectEnd + '}, []);'.length + 1);
      console.log('FIX2 ok — removed mount reconciliation effect');
    }
  }

  const imgBefore = [
    '            ref={imgRef}',
    '            onLoad={() => setLoaded(true)}',
    '            className={`h-full w-full object-cover transition duration-700 ${',
    "              loaded ? 'scale-100 opacity-100 blur-0' : 'scale-105 opacity-0 blur-md'",
    '            }`}',
  ].join('\n');

  const imgAfter = [
    '            // No JS-driven fade: a cached image could stay at opacity 0 forever.',
    "            className=\"h-full w-full object-cover\"",
  ].join('\n');

  if (source.includes(imgBefore)) {
    source = source.replace(imgBefore, imgAfter);
    console.log('FIX2 ok — tile image is now always visible');
  } else {
    console.log('FIX2 SKIP: img className block not found');
  }

  writeFileSync(file, source, 'utf8');
  console.log(
    `FIX2 leftovers — loaded:${source.includes('loaded')} imgRef:${source.includes('imgRef')}`,
  );
}
