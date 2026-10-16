const parentOrigin = window.location.origin;
const returnLink = document.querySelector('[data-return]');
if (window.parent !== window) {
  window.parent.postMessage({ type: 'portfolio-case-title', title: document.title.split(' — ')[0] }, parentOrigin);
  returnLink.textContent = '← 返回项目';
  returnLink.addEventListener('click', event => {
    event.preventDefault();
    window.parent.postMessage({ type: 'portfolio-case-back' }, parentOrigin);
  });
  document.querySelectorAll('a[href^="../index.html"]:not([data-return])').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      window.parent.postMessage({ type: 'portfolio-case-close' }, parentOrigin);
    });
  });
}
const links = [...document.querySelectorAll('.nav-links a')];
const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
const progress = document.querySelector('.progress');
let frame;
function updateReading() {
  frame = null;
  const y = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.setProperty('--read', `${height > 0 ? Math.min(100, y / height * 100) : 0}%`);
  let current = sections[0];
  for (const section of sections) if (section.getBoundingClientRect().top <= 140) current = section;
  links.forEach(link => {
    const active = link.getAttribute('href') === `#${current?.id}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(updateReading); }, { passive: true });
window.addEventListener('resize', updateReading);
updateReading();
const lightbox = document.querySelector('.lightbox');
let opener;
document.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => {
  opener = button;
  lightbox.querySelector('img').src = button.dataset.image;
  lightbox.querySelector('img').alt = button.querySelector('img').alt;
  lightbox.querySelector('p').textContent = button.querySelector('img').alt;
  lightbox.showModal();
}));
lightbox.querySelector('button').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('close', () => opener?.focus({ preventScroll: true }));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !lightbox.open && window.parent !== window) {
    window.parent.postMessage({ type: 'portfolio-case-close' }, parentOrigin);
  }
});
const compare = document.querySelector('.compare');
if (compare) compare.querySelector('input').addEventListener('input', event => compare.style.setProperty('--position', `${event.target.value}%`));
// Defer original boards until the reader explicitly opens the archive.
document.querySelector('.archive details')?.addEventListener('toggle', event => {
  if (!event.target.open) return;
  event.target.querySelectorAll('img[data-src]').forEach(img => { img.src = img.dataset.src; delete img.dataset.src; });
});
