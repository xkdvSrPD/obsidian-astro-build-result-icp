const markers = [...document.querySelectorAll('.marker')];
let frame = 0;

setInterval(() => {
  const marker = markers[frame % markers.length];
  const x = frame % 2 ? 2 : -2;
  const y = frame % 3 === 0 ? 1 : -1;
  marker.style.translate = `${x}px ${y}px`;
  marker.style.opacity = frame % 4 === 0 ? '.55' : '.9';
  if (frame % 3 === 0) marker.classList.add('reacquire');
  setTimeout(() => {
    marker.style.translate = '';
    marker.style.opacity = '';
    marker.classList.remove('reacquire');
  }, 120);
  frame += 1;
}, 760);
