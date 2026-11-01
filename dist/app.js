const boxes = [...document.querySelectorAll('.subject-box')];
let frame = 0;

setInterval(() => {
  const box = boxes[frame % boxes.length];
  const x = frame % 2 ? 2 : -2;
  const y = frame % 3 === 0 ? 1 : -1;
  box.style.transform = `translate(${x}px, ${y}px)`;
  box.style.opacity = frame % 4 === 0 ? '.68' : '.9';
  setTimeout(() => {
    box.style.transform = '';
    box.style.opacity = '';
  }, 120);
  frame += 1;
}, 1700);
