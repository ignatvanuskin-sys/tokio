(async () => {
  await new Promise(r => setTimeout(r, 3000));
  const imgs = [...document.querySelectorAll('img')];
  const grid = imgs.filter(i => i.getBoundingClientRect().width < 300);
  return {
    url: location.href,
    ih: window.innerHeight,
    docH: document.documentElement.scrollHeight,
    fixInjected: !!document.getElementById('__snap_fix'),
    animKilled: !!document.getElementById('__snap_noanim'),
    gridCount: grid.length,
    gridOpacity: grid.map(i => getComputedStyle(i).opacity).slice(0, 20),
    gridInlineStyle: grid.slice(0, 3).map(i => i.getAttribute('style')),
    gridParentClass: grid.slice(0, 3).map(i => i.parentElement.className),
    bigImgOpacity: imgs.filter(i => i.getBoundingClientRect().width >= 300).map(i => getComputedStyle(i).opacity)
  };
})()
