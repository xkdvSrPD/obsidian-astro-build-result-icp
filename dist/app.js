const body = document.body;
const current = document.querySelector('#current-concept');
const concepts = ['01', '02', '03', '04', '05'];
let animationFrame;

function updateClocks() {
  const value = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).format(new Date());
  document.querySelectorAll('[data-clock]').forEach((item) => { item.textContent = value; });
}

function openConcept(id, push = true) {
  if (!concepts.includes(id)) return;
  cancelAnimationFrame(animationFrame);
  body.dataset.view = id;
  current.textContent = id;
  document.title = `${id} // ${document.querySelector(`[data-concept="${id}"]`).getAttribute('aria-label')}`;
  if (push) history.pushState({ view: id }, '', `#${id}`);
  if (id === '02') requestAnimationFrame(drawRelationshipGraph);
  if (id === '05') requestAnimationFrame(drawAnalogGraph);
  window.scrollTo(0, 0);
}

function goHome(push = true) {
  cancelAnimationFrame(animationFrame);
  body.dataset.view = 'home';
  document.title = 'MACHINE // PERSONAL INDEX';
  if (push) history.pushState({ view: 'home' }, '', `${location.pathname}${location.search}`);
  window.scrollTo(0, 0);
}

document.querySelectorAll('[data-open]').forEach((button) => button.addEventListener('click', () => openConcept(button.dataset.open)));
document.querySelectorAll('[data-home]').forEach((button) => button.addEventListener('click', () => goHome()));
document.querySelectorAll('[data-step]').forEach((button) => button.addEventListener('click', () => {
  const index = concepts.indexOf(body.dataset.view);
  const direction = button.dataset.step === 'next' ? 1 : -1;
  openConcept(concepts[(index + direction + concepts.length) % concepts.length]);
}));

window.addEventListener('keydown', (event) => {
  if (/^[1-5]$/.test(event.key)) openConcept(`0${event.key}`);
  if (event.key === 'Escape') goHome();
  if (body.dataset.view !== 'home' && event.key === 'ArrowRight') document.querySelector('[data-step="next"]').click();
  if (body.dataset.view !== 'home' && event.key === 'ArrowLeft') document.querySelector('[data-step="prev"]').click();
});

window.addEventListener('popstate', () => {
  const id = location.hash.slice(1);
  if (concepts.includes(id)) openConcept(id, false); else goHome(false);
});

const inspectorContent = {
  VIO: ['PERSON / ADMIN', '独立创作者与产品设计者。所有路径都指向正在发生的工作。'],
  WORK: ['PROJECT CLUSTER', '十二个项目被识别为持续出现的创造模式。'],
  CODE: ['ACTIVE ASSET', '代码不是目的，而是把系统真正运行起来的方法。'],
  NOTES: ['ARCHIVED SIGNALS', '三十八条笔记记录思考如何随时间改变。'],
  DESIGN: ['KNOWN ASSOCIATE', '把复杂的信息组织成清晰、可感知的界面。'],
  CONTACT: ['OPEN CHANNEL', '一条未加密的通信线路，正在等待新的信号。']
};

document.querySelectorAll('[data-node]').forEach((node) => node.addEventListener('click', () => {
  const [type, copy] = inspectorContent[node.dataset.node];
  document.querySelector('#inspector-name').textContent = node.dataset.node;
  document.querySelector('.graph-inspector div b').textContent = type;
  document.querySelector('#inspector-copy').textContent = copy;
}));

const memories = {
  2019: ['RECORD 2019.04.17 / 21:18:02', 'FIRST SIGNAL IDENTIFIED', 'ANALYSIS: SUBJECT BEGINS TO MAKE'],
  2021: ['RECORD 2021.09.03 / 09:42:18', 'SYSTEMS PATTERN EMERGES', 'ANALYSIS: COMPLEXITY BECOMES MATERIAL'],
  2023: ['RECORD 2023.06.21 / 14:11:47', 'INDEPENDENT PATH SELECTED', 'ANALYSIS: AUTONOMY INCREASES'],
  2025: ['RECORD 2025.02.08 / 17:31:09', 'NEW INTERFACE OBSERVED', 'ANALYSIS: DESIGN AND CODE CONVERGE'],
  2026: ['RECORD 2026.11.01 / 13:04:22', 'SUBJECT CONTINUES TO BUILD', 'ANALYSIS: PATTERN PERSISTS']
};

document.querySelectorAll('.memory-timeline button').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.memory-timeline button').forEach((item) => item.classList.toggle('active', item === button));
  const data = memories[button.querySelector('b').textContent];
  const overlay = document.querySelector('.memory-overlay');
  overlay.querySelector('span').textContent = data[0];
  overlay.querySelector('b').textContent = data[1];
  overlay.querySelector('small').textContent = data[2];
}));

function setupCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, rect.width * dpr);
  canvas.height = Math.max(1, rect.height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width: rect.width, height: rect.height, rect };
}

function drawRelationshipGraph() {
  const canvas = document.querySelector('#graph-canvas');
  if (!canvas || body.dataset.view !== '02') return;
  const { ctx, width, height, rect } = setupCanvas(canvas);
  const nodes = [...document.querySelectorAll('.contextualize .person-node')].map((node) => {
    const box = node.getBoundingClientRect();
    return { x: box.left - rect.left + 10, y: box.top - rect.top + 10, className: node.className };
  });
  const center = nodes[0];
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1;
  nodes.slice(1).forEach((node, index) => {
    ctx.strokeStyle = index === 1 ? 'rgba(91,157,192,.48)' : index === 3 ? 'rgba(217,74,68,.42)' : 'rgba(180,201,189,.32)';
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    const mx = (center.x + node.x) / 2;
    ctx.bezierCurveTo(mx, center.y, mx, node.y, node.x, node.y);
    ctx.stroke();
  });
  ctx.setLineDash([]);
  for (let i = 0; i < 20; i += 1) {
    const x = ((i * 173) % Math.max(width, 1));
    const y = ((i * 97 + 53) % Math.max(height, 1));
    ctx.fillStyle = 'rgba(168,192,179,.28)';
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawAnalogGraph() {
  const canvas = document.querySelector('#analog-canvas');
  if (!canvas || body.dataset.view !== '05') return;
  const { ctx, width, height } = setupCanvas(canvas);
  const points = [
    [.12,.18],[.23,.52],[.17,.79],[.43,.22],[.52,.48],[.48,.81],[.72,.18],[.82,.42],[.9,.72],[.69,.83],[.93,.24]
  ].map(([x,y]) => ({ x:x*width, y:y*height }));
  ctx.clearRect(0,0,width,height);
  ctx.lineWidth = 1;
  points.forEach((point,index) => {
    const next = points[(index * 3 + 4) % points.length];
    ctx.strokeStyle = index % 4 === 0 ? 'rgba(216,190,85,.25)' : 'rgba(137,167,150,.18)';
    ctx.beginPath();ctx.moveTo(point.x,point.y);ctx.lineTo(next.x,next.y);ctx.stroke();
    ctx.fillStyle = index % 4 === 0 ? 'rgba(216,190,85,.65)' : 'rgba(175,198,185,.42)';
    ctx.beginPath();ctx.arc(point.x,point.y,index % 4 === 0 ? 2.5 : 1.5,0,Math.PI*2);ctx.fill();
  });
}

window.addEventListener('resize', () => {
  if (body.dataset.view === '02') drawRelationshipGraph();
  if (body.dataset.view === '05') drawAnalogGraph();
});

updateClocks();
setInterval(updateClocks, 1000);
const initial = location.hash.slice(1);
if (concepts.includes(initial)) openConcept(initial, false);
