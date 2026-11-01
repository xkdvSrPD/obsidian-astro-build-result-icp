const backgroundCandidates = [
  'https://images.pexels.com/photos/17569862/pexels-photo-17569862.jpeg?auto=compress&cs=tinysrgb&w=2400',
  'https://images.unsplash.com/photo-1689101576466-9fb608c529df?auto=format&fit=crop&fm=jpg&q=76&w=2400',
  'https://upload.wikimedia.org/wikipedia/commons/9/9c/Highway_intersection_at_night-time_%28Unsplash%29.jpg',
  'https://c.pxhere.com/photos/fb/6a/aerial_angle_buildings_busy_city_cityscape_crossing_crosswalk-1073836.jpg!d'
];
const backgrounds = ['./assets/cctv-intersection.png'];

const markerLayouts = [
  [[12,72,1],[28,54,.95],[43,65,1],[57,38,.92],[72,46,1],[82,32,.88],[91,66,.82]],
  [[9,62,.9],[24,43,1],[39,71,.88],[55,29,.95],[68,55,1],[82,41,.84],[92,23,.8]],
  [[14,35,.88],[31,61,1],[46,47,.9],[59,70,.96],[72,33,.91],[86,57,.86],[92,17,.82]],
  [[10,58,.92],[26,31,.88],[42,52,1],[57,39,.94],[69,68,.9],[84,29,.86],[91,51,.8]],
  [[12,29,.84],[27,57,.95],[43,39,.9],[55,66,1],[71,49,.92],[83,24,.84],[93,70,.78]]
];

const feedA = document.querySelector('.feed-a');
const feedB = document.querySelector('.feed-b');
const markers = [...document.querySelectorAll('.marker')];
let backgroundIndex = 0;
let feedBIsVisible = false;
let markerFrame = 0;

backgroundCandidates.forEach((url) => {
  const image = new Image();
  image.addEventListener('load', () => backgrounds.push(url), { once: true });
  image.src = url;
});

function placeMarkers(index) {
  markerLayouts[index % markerLayouts.length].forEach(([left, top], markerIndex) => {
    const marker = markers[markerIndex];
    marker.style.left = `${left}%`;
    marker.style.top = `${top}%`;
    marker.classList.remove('reacquire');
    void marker.offsetWidth;
    marker.classList.add('reacquire');
  });
}

function switchBackground() {
  backgroundIndex = (backgroundIndex + 1) % backgrounds.length;
  const nextUrl = backgrounds[backgroundIndex];
  if (feedBIsVisible) {
    feedA.style.backgroundImage = `url("${nextUrl}")`;
    feedB.classList.remove('visible');
  } else {
    feedB.style.backgroundImage = `url("${nextUrl}")`;
    feedB.classList.add('visible');
  }
  feedBIsVisible = !feedBIsVisible;
  placeMarkers(backgroundIndex);
}

setInterval(switchBackground, 7200);

setInterval(() => {
  const marker = markers[markerFrame % markers.length];
  marker.style.marginLeft = markerFrame % 2 ? '1px' : '-1px';
  marker.style.marginTop = markerFrame % 3 === 0 ? '1px' : '0';
  marker.style.opacity = markerFrame % 4 === 0 ? '.66' : '.96';
  setTimeout(() => {
    marker.style.marginLeft = '';
    marker.style.marginTop = '';
    marker.style.opacity = '';
  }, 100);
  markerFrame += 1;
}, 840);
