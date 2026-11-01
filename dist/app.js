const body = document.body;
const clock = document.querySelector('#clock');
const current = document.querySelector('#current-concept');
const concepts = ['01', '02', '03', '04', '05'];

function updateClock() {
  clock.textContent = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).format(new Date());
}

function openConcept(id, push = true) {
  if (!concepts.includes(id)) return;
  body.dataset.view = id;
  current.textContent = id;
  document.title = `${id} / ${document.querySelector(`[data-concept="${id}"]`).getAttribute('aria-label')}`;
  if (push) history.pushState({ view: id }, '', `#${id}`);
  if (id === '05') drawNetwork();
  window.scrollTo(0, 0);
}

function goHome(push = true) {
  body.dataset.view = 'home';
  document.title = 'MACHINE / Personal Site Directions';
  if (push) history.pushState({ view: 'home' }, '', location.pathname);
  window.scrollTo(0, 0);
}

document.querySelectorAll('[data-open]').forEach((button) => {
  button.addEventListener('click', () => openConcept(button.dataset.open));
});
document.querySelectorAll('[data-home]').forEach((button) => button.addEventListener('click', () => goHome()));
document.querySelectorAll('[data-step]').forEach((button) => button.addEventListener('click', () => {
  const index = concepts.indexOf(body.dataset.view);
  const delta = button.dataset.step === 'next' ? 1 : -1;
  openConcept(concepts[(index + delta + concepts.length) % concepts.length]);
}));

window.addEventListener('keydown', (event) => {
  if (/^[1-5]$/.test(event.key)) openConcept(`0${event.key}`);
  if (event.key === 'Escape') goHome();
  if (body.dataset.view !== 'home' && event.key === 'ArrowRight') document.querySelector('[data-step="next"]').click();
  if (body.dataset.view !== 'home' && event.key === 'ArrowLeft') document.querySelector('[data-step="prev"]').click();
});

window.addEventListener('popstate', () => {
  const id = location.hash.slice(1);
  id ? openConcept(id, false) : goHome(false);
});

function drawNetwork() {
  const canvas = document.querySelector('#network');
  const bounds = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = bounds.width * dpr;
  canvas.height = bounds.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, bounds.width, bounds.height);
  const center = { x: bounds.width / 2, y: bounds.height * .45 };
  const points = [
    { x: bounds.width * .13, y: bounds.height * .26 }, { x: bounds.width * .86, y: bounds.height * .31 },
    { x: bounds.width * .18, y: bounds.height * .73 }, { x: bounds.width * .83, y: bounds.height * .74 },
    { x: bounds.width * .32, y: bounds.height * .16 }, { x: bounds.width * .7, y: bounds.height * .13 },
    { x: bounds.width * .3, y: bounds.height * .83 }, { x: bounds.width * .67, y: bounds.height * .88 }
  ];
  ctx.strokeStyle = 'rgba(151, 191, 199, .28)';
  ctx.lineWidth = 1;
  points.forEach((p, i) => {
    ctx.beginPath(); ctx.moveTo(center.x, center.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    if (i > 0) { ctx.beginPath(); ctx.moveTo(points[i - 1].x, points[i - 1].y); ctx.lineTo(p.x, p.y); ctx.stroke(); }
  });
  ctx.fillStyle = '#cce6e9';
  points.forEach((p) => { ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); ctx.fill(); });
}

window.addEventListener('resize', () => { if (body.dataset.view === '05') drawNetwork(); });
updateClock();
setInterval(updateClock, 1000);
const initial = location.hash.slice(1);
if (concepts.includes(initial)) openConcept(initial, false);
