// Page extras for the reading sections: the file-size calculator and the
// "Paste a link" button that follows you down the page on phones. Both work
// as plain content without JavaScript (the sizes show the default length).

// ----------------------------------------------------- size calculator ----
const fmtMB = (mb) =>
  mb >= 1000
    ? `${(mb / 1000).toFixed(1)} GB`
    : mb >= 10
      ? `${Math.round(mb)} MB`
      : `${mb.toFixed(1).replace(/\.0$/, '')} MB`;
const fmtLen = (min) => (min < 60 ? `${min} min` : `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ''}`);

for (const input of document.querySelectorAll('[data-len]')) {
  const sec = input.closest('section');
  const out = sec.querySelector('[data-len-out]');
  const cells = [...sec.querySelectorAll('[data-rate]')];
  const update = () => {
    const min = Number(input.value) || 1;
    out.textContent = fmtLen(min);
    for (const c of cells) c.textContent = `≈ ${fmtMB(Number(c.dataset.rate) * min)}`;
    // Filled part of the track (WebKit has no ::-moz-range-progress).
    input.style.setProperty('--fill', `${((min - input.min) / (input.max - input.min || 1)) * 100}%`);
  };
  input.addEventListener('input', update);
  update();
}

// ------------------------------------------------- sticky paste button ----
// Shown on phones once the link box has scrolled out of view.
const sticky = document.getElementById('stickyPaste');
const card = document.querySelector('.tool-card');
if (sticky && card && 'IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    sticky.hidden = entry.isIntersecting;
  }).observe(card);
  sticky.addEventListener('click', () => {
    const url = document.getElementById('url');
    card.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'center',
    });
    url?.focus({ preventScroll: true });
  });
}
