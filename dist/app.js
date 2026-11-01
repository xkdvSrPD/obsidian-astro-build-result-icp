const SOURCE_WIDTH = 1672;
const SOURCE_HEIGHT = 941;
const RECOGNITION_DELAY = 1900;
const REVEAL_INTERVAL = 135;
const SCENE_DURATION = 9800;

// User-provided positions. x/y point to each person's head in source-image space.
const scenes = [
  {
    url: './assets/cctv-intersection.png',
    targets: [
      { x: 22.671, y: 51.818, size: 48 },
      { x: 39.633, y: 64.659, size: 46 },
      { x: 43.95, y: 61.105, size: 43 },
      { x: 55.913, y: 36.79, size: 42 },
      { x: 46.65, y: 66.558, size: 42 }
    ]
  },
  {
    url: './assets/backgrounds/night-sidewalk.png',
    targets: [
      { x: 81.217, y: 24.261, size: 74 },
      { x: 22.226, y: 37.753, size: 70 },
      { x: 21.459, y: 24.083, size: 76 },
      { x: 38.292, y: 34.387, size: 76 },
      { x: 71.467, y: 62.36, size: 62 }
    ]
  },
  {
    url: './assets/backgrounds/dusk-crosswalk.png',
    targets: [
      { x: 9.671, y: 37.991, size: 62 },
      { x: 72.817, y: 55.781, size: 72 },
      { x: 32.213, y: 28.551, size: 66 },
      { x: 40.725, y: 51.543, size: 72 },
      { x: 85.8, y: 61, size: 74 }
    ]
  },
  {
    url: './assets/backgrounds/subway-platform.png',
    targets: [
      { x: 69.904, y: 25.887, size: 78 },
      { x: 19.517, y: 45.478, size: 70 },
      { x: 61.087, y: 6.153, size: 58 },
      { x: 48.447, y: 14.406, size: 54 },
      { x: 33.094, y: 27.141, size: 72 }
    ]
  }
];

const feeds = [document.querySelector('.feed-a'), document.querySelector('.feed-b')];
const markers = [...document.querySelectorAll('.marker')];
const revealTimers = new Set();
let sceneIndex = 0;
let activeFeedIndex = 0;

scenes.forEach(({ url }) => {
  const image = new Image();
  image.src = url;
});

function clearRevealTimers() {
  revealTimers.forEach(clearTimeout);
  revealTimers.clear();
}

function hideMarkers() {
  clearRevealTimers();
  markers.forEach((marker) => {
    marker.classList.remove('is-visible', 'reacquire');
    marker.hidden = true;
  });
}

function projectTarget(target) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const scale = Math.max(viewportWidth / SOURCE_WIDTH, viewportHeight / SOURCE_HEIGHT);
  const renderedWidth = SOURCE_WIDTH * scale;
  const renderedHeight = SOURCE_HEIGHT * scale;
  const offsetX = (viewportWidth - renderedWidth) / 2;
  const offsetY = (viewportHeight - renderedHeight) / 2;

  return {
    left: offsetX + (target.x / 100) * renderedWidth,
    top: offsetY + (target.y / 100) * renderedHeight,
    size: Math.max(30, Math.min(96, target.size * scale))
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
    marker.hidden = !isInFrame || !marker.classList.contains('is-visible');
  });
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

function switchScene() {
  hideMarkers();
  sceneIndex = (sceneIndex + 1) % scenes.length;

  const nextFeedIndex = activeFeedIndex === 0 ? 1 : 0;
  feeds[nextFeedIndex].style.backgroundImage = `url("${scenes[sceneIndex].url}")`;
  feeds[nextFeedIndex].classList.add('visible');
  feeds[activeFeedIndex].classList.remove('visible');
  activeFeedIndex = nextFeedIndex;

  positionMarkers();
  scheduleRecognition();
}

hideMarkers();
positionMarkers();
scheduleRecognition();

window.addEventListener('resize', positionMarkers, { passive: true });
setInterval(switchScene, SCENE_DURATION);
