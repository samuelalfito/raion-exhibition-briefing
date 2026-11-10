import '@fontsource/anton';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import './style.css';
import QRCode from 'qrcode';
import { slides as slideHtml, FORM_URL } from './slides.js';

const W = 1920;
const H = 1080;

const stage = document.getElementById('stage');
stage.innerHTML = slideHtml.join('');
const slides = [...stage.querySelectorAll('.slide')];
const counter = document.getElementById('counter');
const bar = document.querySelector('#progress span');

let scale = 1;
let index = 0;
let venue = null;
let venuePromise = null;

function fit() {
  scale = Math.min(window.innerWidth / W, window.innerHeight / H);
  stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
  venue?.setScale(scale);
}

// Adegan 3D dimuat saat pertama kali dibutuhkan, lalu dipakai ulang.
function loadVenue() {
  venuePromise ??= import('./venue.js').then(({ createVenue }) => {
    venue = createVenue(document.getElementById('venue'));
    venue.setScale(scale);
    return venue;
  });
  return venuePromise;
}

function go(next) {
  index = Math.max(0, Math.min(slides.length - 1, next));
  slides.forEach((el, i) => {
    el.dataset.state = i === index ? 'active' : i < index ? 'past' : 'future';
    el.setAttribute('aria-hidden', i === index ? 'false' : 'true');
  });
  counter.textContent = `${index + 1} / ${slides.length}`;
  bar.style.transform = `scaleX(${(index + 1) / slides.length})`;
  history.replaceState(null, '', `#/${index + 1}`);

  const onVenue = slides[index].hasAttribute('data-venue');
  document.body.classList.toggle('on-venue', onVenue);
  if (onVenue) loadVenue().then((v) => slides[index].hasAttribute('data-venue') && v.start());
  else venue?.stop();
  // Siapkan 3D satu slide lebih awal supaya tidak ada jeda saat tiba.
  if (slides[index + 1]?.hasAttribute('data-venue')) loadVenue();
}

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
}

window.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const onButton = e.target instanceof HTMLButtonElement;
  switch (e.key) {
    case 'ArrowRight':
    case 'PageDown':
      go(index + 1);
      break;
    case 'ArrowLeft':
    case 'PageUp':
      go(index - 1);
      break;
    case ' ':
    case 'Enter':
      if (onButton) return;
      go(index + (e.shiftKey ? -1 : 1));
      break;
    case 'Home':
      go(0);
      break;
    case 'End':
      go(slides.length - 1);
      break;
    case 'f':
    case 'F':
      toggleFullscreen();
      break;
    default:
      return;
  }
  e.preventDefault();
});

document.getElementById('prev').addEventListener('click', () => go(index - 1));
document.getElementById('next').addEventListener('click', () => go(index + 1));
document.getElementById('fs').addEventListener('click', toggleFullscreen);
window.addEventListener('resize', fit);
window.addEventListener('hashchange', () => {
  const n = parseInt(location.hash.replace('#/', ''), 10);
  if (n && n - 1 !== index) go(n - 1);
});

QRCode.toDataURL(FORM_URL, { margin: 1, width: 640, color: { dark: '#0e0e0f', light: '#ffffff' } }).then(
  (url) => {
    document.getElementById('qr-form').src = url;
  },
);

fit();
go((parseInt(location.hash.replace('#/', ''), 10) || 1) - 1);
