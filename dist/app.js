const SOURCE_WIDTH = 1672;
const SOURCE_HEIGHT = 941;
const RECOGNITION_DELAY = 1900;
const REVEAL_INTERVAL = 135;
const SCENE_DURATION = 9800;
const STORAGE_KEY = 'poi-marker-calibration-v1';

const scenes = [
  {
    name: '01 · 夜间十字路口',
    url: './assets/cctv-intersection.png',
    targets: [
      { x: 28.6, y: 60.5, size: 48 },
      { x: 39.7, y: 64.5, size: 46 },
      { x: 44.0, y: 61.7, size: 43 },
      { x: 67.5, y: 47.4, size: 42 },
      { x: 70.3, y: 47.7, size: 42 }
    ]
  },
  {
    name: '02 · 雨夜街道',
    url: './assets/backgrounds/night-sidewalk.png',
    targets: [
      { x: 22.1, y: 37.6, size: 74 },
      { x: 38.3, y: 33.2, size: 70 },
      { x: 48.2, y: 68.2, size: 76 },
      { x: 71.3, y: 61.7, size: 76 },
      { x: 73.1, y: 24.6, size: 62 }
    ]
  },
  {
    name: '03 · 黄昏人行道',
    url: './assets/backgrounds/dusk-crosswalk.png',
    targets: [
      { x: 9.7, y: 37.4, size: 62 },
      { x: 42.8, y: 64.7, size: 72 },
      { x: 58.3, y: 46.7, size: 66 },
      { x: 72.8, y: 57.9, size: 72 },
      { x: 85.8, y: 61.0, size: 74 }
    ]
  },
  {
    name: '04 · 地铁站台',
    url: './assets/backgrounds/subway-platform.png',
    targets: [
      { x: 20.3, y: 41.8, size: 78 },
      { x: 33.3, y: 24.8, size: 70 },
      { x: 48.4, y: 13.6, size: 58 },
      { x: 57.8, y: 12.7, size: 54 },
      { x: 69.8, y: 24.8, size: 72 }
    ]
  }
];

const originalTargets = scenes.map(({ targets }) => targets.map((target) => ({ ...target })));
const feeds = [document.querySelector('.feed-a'), document.querySelector('.feed-b')];
const markers = [...document.querySelectorAll('.marker')];
const panel = document.querySelector('.calibration-panel');
const sceneSelect = document.querySelector('#scene-select');
const coordinateOutput = document.querySelector('#coordinate-output');
const calibrationStatus = document.querySelector('#calibration-status');
const calibrationToggle = document.querySelector('#calibration-toggle');
const revealTimers = new Set();

let sceneIndex = 0;
let activeFeedIndex = 0;
let selectedMarkerIndex = 0;
let calibrationMode = true;
let playbackTimer = null;
let dragMarkerIndex = null;
let dragOffset = { x: 0, y: 0 };

function loadSavedTargets() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved) || saved.length !== scenes.length) return;

    saved.forEach((targets, savedSceneIndex) => {
      if (!Array.isArray(targets) || targets.length !== markers.length) return;
      targets.forEach((target, targetIndex) => {
        if (!Number.isFinite(target.x) || !Number.isFinite(target.y)) return;
        scenes[savedSceneIndex].targets[targetIndex].x = target.x;
        scenes[savedSceneIndex].targets[targetIndex].y = target.y;
      });
    });
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function saveTargets() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(scenes.map(({ targets }) => targets.map(({ x, y, size }) => ({ x, y, size }))))
  );
}

scenes.forEach(({ name, url }, index) => {
  const image = new Image();
  image.src = url;

  const option = document.createElement('option');
  option.value = String(index);
  option.textContent = name;
  sceneSelect.append(option);
});

function clearRevealTimers() {
  revealTimers.forEach(clearTimeout);
  revealTimers.clear();
}

function stopPlayback() {
  clearInterval(playbackTimer);
  playbackTimer = null;
}

function startPlayback() {
  stopPlayback();
  playbackTimer = setInterval(() => setScene((sceneIndex + 1) % scenes.length, true), SCENE_DURATION);
}

function getCoverMetrics() {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const scale = Math.max(viewportWidth / SOURCE_WIDTH, viewportHeight / SOURCE_HEIGHT);
  const renderedWidth = SOURCE_WIDTH * scale;
  const renderedHeight = SOURCE_HEIGHT * scale;

  return {
    scale,
    renderedWidth,
    renderedHeight,
    offsetX: (viewportWidth - renderedWidth) / 2,
    offsetY: (viewportHeight - renderedHeight) / 2
  };
}

function projectTarget(target) {
  const metrics = getCoverMetrics();
  return {
    left: metrics.offsetX + (target.x / 100) * metrics.renderedWidth,
    top: metrics.offsetY + (target.y / 100) * metrics.renderedHeight,
    size: Math.max(30, Math.min(96, target.size * metrics.scale))
  };
}

function unprojectPoint(left, top) {
  const metrics = getCoverMetrics();
  return {
    x: Math.max(0, Math.min(100, ((left - metrics.offsetX) / metrics.renderedWidth) * 100)),
    y: Math.max(0, Math.min(100, ((top - metrics.offsetY) / metrics.renderedHeight) * 100))
  };
}

function positionMarkers() {
  scenes[sceneIndex].targets.forEach((target, index) => {
    const marker = markers[index];
    const projected = projectTarget(target);
    const isInFrame =
      projected.left > -projected.size &&
      projected.left < window.innerWidth + projected.size &&
      projected.top > -projected.size &&
      projected.top < window.innerHeight + projected.size;

    marker.style.left = `${projected.left}px`;
    marker.style.top = `${projected.top}px`;
    marker.style.width = `${projected.size}px`;
    marker.dataset.inFrame = String(isInFrame);
    marker.hidden = !isInFrame || (!calibrationMode && !marker.classList.contains('is-visible'));
  });
}

function hideMarkers() {
  clearRevealTimers();
  markers.forEach((marker) => {
    marker.classList.remove('is-visible', 'reacquire');
    marker.hidden = true;
  });
}

function showCalibrationMarkers() {
  markers.forEach((marker, index) => {
    marker.classList.add('is-visible');
    marker.classList.remove('reacquire');
    marker.hidden = false;
    marker.classList.toggle('is-selected', index === selectedMarkerIndex);
  });
  positionMarkers();
  updateCoordinateOutput();
}

function revealMarkers() {
  positionMarkers();
  markers.forEach((marker, index) => {
    if (marker.dataset.inFrame !== 'true') return;
    const timer = setTimeout(() => {
      revealTimers.delete(timer);
      marker.hidden = false;
      marker.classList.remove('reacquire');
      void marker.offsetWidth;
      marker.classList.add('is-visible', 'reacquire');
    }, index * REVEAL_INTERVAL);
    revealTimers.add(timer);
  });
}

function scheduleRecognition() {
  const timer = setTimeout(() => {
    revealTimers.delete(timer);
    revealMarkers();
  }, RECOGNITION_DELAY);
  revealTimers.add(timer);
}

function applySceneBackground(nextSceneIndex, crossfade) {
  if (!crossfade) {
    feeds[0].style.backgroundImage = `url("${scenes[nextSceneIndex].url}")`;
    feeds[0].classList.add('visible');
    feeds[1].classList.remove('visible');
    activeFeedIndex = 0;
    return;
  }

  const nextFeedIndex = activeFeedIndex === 0 ? 1 : 0;
  feeds[nextFeedIndex].style.backgroundImage = `url("${scenes[nextSceneIndex].url}")`;
  feeds[nextFeedIndex].classList.add('visible');
  feeds[activeFeedIndex].classList.remove('visible');
  activeFeedIndex = nextFeedIndex;
}

function setScene(nextSceneIndex, crossfade = false) {
  hideMarkers();
  sceneIndex = (nextSceneIndex + scenes.length) % scenes.length;
  sceneSelect.value = String(sceneIndex);
  applySceneBackground(sceneIndex, crossfade);

  if (calibrationMode) showCalibrationMarkers();
  else scheduleRecognition();
}

function selectMarker(index) {
  selectedMarkerIndex = index;
  markers.forEach((marker, markerIndex) => {
    marker.classList.toggle('is-selected', markerIndex === index);
  });
  updateCoordinateOutput();
}

function updateCoordinateOutput() {
  const target = scenes[sceneIndex].targets[selectedMarkerIndex];
  coordinateOutput.textContent = `框 ${selectedMarkerIndex + 1}  ·  X ${target.x.toFixed(2)}%  ·  Y ${target.y.toFixed(2)}%`;
}

function updateTarget(index, clientX, clientY) {
  const point = unprojectPoint(clientX, clientY);
  const target = scenes[sceneIndex].targets[index];
  target.x = Number(point.x.toFixed(3));
  target.y = Number(point.y.toFixed(3));
  saveTargets();
  positionMarkers();
  updateCoordinateOutput();
  calibrationStatus.textContent = '已保存在当前浏览器';
}

function nudgeSelectedMarker(deltaX, deltaY) {
  const target = scenes[sceneIndex].targets[selectedMarkerIndex];
  target.x = Number(Math.max(0, Math.min(100, target.x + deltaX)).toFixed(3));
  target.y = Number(Math.max(0, Math.min(100, target.y + deltaY)).toFixed(3));
  saveTargets();
  positionMarkers();
  updateCoordinateOutput();
  calibrationStatus.textContent = '已微调并保存';
}

function exportCoordinates() {
  return JSON.stringify(
    scenes.map(({ name, url, targets }) => ({
      scene: name,
      image: url,
      targets: targets.map(({ x, y, size }) => ({ x, y, size }))
    })),
    null,
    2
  );
}

async function copyCoordinates() {
  const coordinates = exportCoordinates();
  try {
    await navigator.clipboard.writeText(coordinates);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = coordinates;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.append(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
  calibrationStatus.textContent = '全部坐标已复制，可以直接粘贴给我';
}

function enterCalibration() {
  calibrationMode = true;
  stopPlayback();
  clearRevealTimers();
  document.body.classList.add('is-calibrating');
  panel.hidden = false;
  calibrationToggle.hidden = true;
  applySceneBackground(sceneIndex, false);
  showCalibrationMarkers();
}

function exitCalibration() {
  calibrationMode = false;
  document.body.classList.remove('is-calibrating');
  panel.hidden = true;
  calibrationToggle.hidden = false;
  hideMarkers();
  positionMarkers();
  scheduleRecognition();
  startPlayback();
}

markers.forEach((marker, index) => {
  marker.addEventListener('pointerdown', (event) => {
    if (!calibrationMode) return;
    event.preventDefault();
    dragMarkerIndex = index;
    selectMarker(index);
    const projected = projectTarget(scenes[sceneIndex].targets[index]);
    dragOffset = {
      x: projected.left - event.clientX,
      y: projected.top - event.clientY
    };
    marker.setPointerCapture(event.pointerId);
  });

  marker.addEventListener('pointermove', (event) => {
    if (!calibrationMode || dragMarkerIndex !== index) return;
    updateTarget(index, event.clientX + dragOffset.x, event.clientY + dragOffset.y);
  });

  marker.addEventListener('pointerup', () => {
    dragMarkerIndex = null;
  });

  marker.addEventListener('pointercancel', () => {
    dragMarkerIndex = null;
  });
});

document.querySelector('#previous-scene').addEventListener('click', () => setScene(sceneIndex - 1));
document.querySelector('#next-scene').addEventListener('click', () => setScene(sceneIndex + 1));
document.querySelector('#copy-coordinates').addEventListener('click', copyCoordinates);
document.querySelector('#preview-mode').addEventListener('click', exitCalibration);
calibrationToggle.addEventListener('click', enterCalibration);

document.querySelector('#reset-scene').addEventListener('click', () => {
  scenes[sceneIndex].targets = originalTargets[sceneIndex].map((target) => ({ ...target }));
  saveTargets();
  showCalibrationMarkers();
  calibrationStatus.textContent = '本张画面已恢复初始坐标';
});

sceneSelect.addEventListener('change', () => setScene(Number(sceneSelect.value)));

window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'c') {
    calibrationMode ? exitCalibration() : enterCalibration();
    return;
  }
  if (!calibrationMode || !event.key.startsWith('Arrow')) return;
  if (['BUTTON', 'SELECT', 'INPUT'].includes(document.activeElement.tagName)) return;

  event.preventDefault();
  const step = event.shiftKey ? 0.5 : 0.1;
  const offsets = {
    ArrowLeft: [-step, 0],
    ArrowRight: [step, 0],
    ArrowUp: [0, -step],
    ArrowDown: [0, step]
  };
  nudgeSelectedMarker(...offsets[event.key]);
});

window.addEventListener('resize', positionMarkers, { passive: true });

loadSavedTargets();
setScene(0);
enterCalibration();
