const SOURCE_WIDTH = 1672;
const SOURCE_HEIGHT = 941;
const RECOGNITION_DELAY = 1900;
const REVEAL_INTERVAL = 135;
const SCENE_DURATION = 9800;

// Positions were measured against each source image. x/y point to a person's head,
// while size is the marker's source-pixel width before object-cover projection.
const scenes = [
  {
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

const feeds = [
  document.querySelector('.feed-a'),
  document.querySelector('.feed-b')
];
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
  const targets = scenes[sceneIndex].targets;

  markers.forEach((marker, index) => {
    const target = targets[index];
    if (!target) {
      marker.hidden = true;
      return;
    }

    const projected = projectTarget(target);
    marker.style.left = `${projected.left}px`;
    marker.style.top = `${projected.top}px`;
    marker.style.width = `${projected.size}px`;
    const isInFrame =
      projected.left > -projected.size &&
      projected.left < window.innerWidth + projected.size &&
      projected.top > -projected.size &&
      projected.top < window.innerHeight + projected.size;
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
