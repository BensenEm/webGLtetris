// Everything three.js: renderer, camera, lights and the meshes that mirror the
// arena state. Game logic never touches three.js directly.

import * as THREE from 'three';
import * as scenery from './scenery.js';
import {
  X_LEN,
  Y_LEN,
  Z_LEN,
  CUBE_DIM,
  EMPTY,
  CAMERA_VIEWS,
  ARENA_TURN_FRAMES,
} from './config.js';

const cubeGeometry = new THREE.BoxGeometry(CUBE_DIM, CUBE_DIM, CUBE_DIM);

/**
 * Materials are cached per colour and shared by every cube using it. The
 * original allocated a fresh MeshPhongMaterial for each cube on every arena
 * rebuild and never disposed the old ones.
 */
const materialCache = new Map();

function materialFor(color) {
  let material = materialCache.get(color);
  if (!material) {
    material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.35,
      metalness: 0.15,
      envMapIntensity: 1.1,
    });
    materialCache.set(color, material);
  }
  return material;
}

// Black reads far better than white against the bright sky and sand.
const ghostMaterial = new THREE.MeshBasicMaterial({
  color: 0x000000,
  wireframe: true,
  transparent: true,
  opacity: 0.5,
});

export const groups = {
  /** The settled arena as it currently stands. */
  solid: new THREE.Group(),
  /** The same arena with completed lines removed, for the clear flash. */
  cleared: new THREE.Group(),
  falling: new THREE.Group(),
  ghost: new THREE.Group(),
  floor: new THREE.Group(),
};

let renderer;
let scene;
let camera;
let container;
/** Wraps the arena so the whole board can spin about y with the "q" key. */
let arenaCase;
let arenaPivot;
let cameraViewIndex = 0;

export function init(containerId) {
  container = document.getElementById(containerId);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // The physical sky is far brighter than the old flat clear colour, so it
  // needs tone mapping to land in a sane range.
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.45;
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  // Far enough to contain the ocean and sky dome.
  camera = new THREE.PerspectiveCamera(70, 4 / 3, 5, 45000);

  arenaCase = new THREE.Group();
  arenaPivot = new THREE.Group();
  arenaPivot.add(
    groups.solid,
    groups.cleared,
    groups.falling,
    groups.ghost,
    groups.floor,
  );
  // Centre the grid on the origin so the case spins about the board's middle.
  arenaPivot.position.set(-CUBE_DIM * 2.5, 0, -CUBE_DIM * 2.5);
  arenaCase.add(arenaPivot);
  arenaCase.rotation.y = Math.PI / 4;
  scene.add(arenaCase);

  groups.cleared.visible = false;

  // Scenery first: it produces the environment map and the sun direction that
  // the key light is then aimed along.
  const { sunDirection } = scenery.create(scene, renderer);
  addLights(sunDirection);
  addFloor();
  applyCameraView(0);
  resize();

  window.addEventListener('resize', resize);
}

function addLights(sunDirection) {
  // Warm, low sun matching the sky's own sun position.
  const key = new THREE.DirectionalLight(0xfff0d8, 3.0);
  key.position.copy(sunDirection).multiplyScalar(4000);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 100;
  key.shadow.camera.far = 9000;
  // A full stack is 12 cubes tall and the sun is low, so its shadow is thrown
  // a long way across the sand; the frustum has to be wide enough to hold it.
  const extent = 32 * CUBE_DIM;
  key.shadow.camera.left = -extent;
  key.shadow.camera.right = extent;
  key.shadow.camera.top = extent;
  key.shadow.camera.bottom = -extent;
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 2;
  scene.add(key);

  // Sky above, warm sand bounce below.
  const fill = new THREE.HemisphereLight(0xbfd8ff, 0xc9ab7d, 0.8);
  scene.add(fill);
}

function addFloor() {
  const geometry = new THREE.BoxGeometry(X_LEN * CUBE_DIM, 6, Z_LEN * CUBE_DIM);
  // Damp, packed sand: darker and glossier than the dry beach around it, so
  // the playfield still reads as a distinct platform.
  const material = new THREE.MeshStandardMaterial({
    color: 0xa08a63,
    roughness: 0.55,
    metalness: 0.05,
    envMapIntensity: 0.8,
  });
  const floor = new THREE.Mesh(geometry, material);
  floor.receiveShadow = true;
  groups.floor.add(floor);
  groups.floor.position.set(CUBE_DIM * 2.5, -CUBE_DIM / 2 - 3, CUBE_DIM * 2.5);
}

function clearGroup(group) {
  // Geometry and materials are shared and cached, so the meshes themselves are
  // all that need releasing here.
  group.clear();
}

function addCube(group, x, y, z, material, castShadow = true) {
  const mesh = new THREE.Mesh(cubeGeometry, material);
  mesh.position.set(x * CUBE_DIM, y * CUBE_DIM, z * CUBE_DIM);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = castShadow;
  group.add(mesh);
  return mesh;
}

/** Rebuilds one of the arena groups from a grid. */
export function syncArena(group, arena) {
  clearGroup(group);
  for (let x = 0; x < X_LEN; x++) {
    for (let y = 0; y < Y_LEN; y++) {
      for (let z = 0; z < Z_LEN; z++) {
        const color = arena[x][y][z];
        if (color === EMPTY) continue;
        addCube(group, x, y, z, materialFor(color));
      }
    }
  }
}

export function syncPiece(cells, color) {
  clearGroup(groups.falling);
  const material = materialFor(color);
  for (const c of cells) {
    addCube(groups.falling, c.x, c.y, c.z, material);
  }
}

export function syncGhost(cells) {
  clearGroup(groups.ghost);
  for (const c of cells) {
    addCube(groups.ghost, c.x, c.y, c.z, ghostMaterial, false);
  }
}

export function clearPiece() {
  clearGroup(groups.falling);
  clearGroup(groups.ghost);
}

/** Which arena variant is on screen: 'solid' or 'cleared'. */
export function showArenaVariant(which) {
  groups.solid.visible = which === 'solid';
  groups.cleared.visible = which === 'cleared';
}

export function cycleCameraView() {
  applyCameraView((cameraViewIndex + 1) % CAMERA_VIEWS.length);
}

function applyCameraView(index) {
  cameraViewIndex = index;
  const view = CAMERA_VIEWS[index];
  camera.position.set(...view.position);
  camera.lookAt(new THREE.Vector3(...view.target));
}

const turnStep = THREE.MathUtils.degToRad(90) / ARENA_TURN_FRAMES;

/** Advances an in-progress quarter turn of the board. */
export function stepArenaTurn() {
  arenaCase.rotation.y += turnStep;
}

/** Snaps the board to an exact quarter-turn multiple once a turn finishes. */
export function settleArenaTurn(quarterTurns) {
  arenaCase.rotation.y = Math.PI / 4 + (quarterTurns * Math.PI) / 2;
}

/** The settled cubes, used by the game-over animation. */
export function solidCubes() {
  return groups.solid.children;
}

export function resize() {
  const height = window.innerHeight * 0.8;
  const width = (height * 4) / 3;
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  renderer.setSize(width, height);
  // The original resized the renderer but left the camera's aspect at its
  // initial 4/3, so any non-4:3 window rendered distorted.
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

let lastFrameAt = 0;

export function render(now = 0) {
  // Seconds, and clamped so a backgrounded tab does not resume with one huge
  // step that jumps the waves and clouds forward.
  const delta = lastFrameAt ? Math.min((now - lastFrameAt) / 1000, 0.1) : 0;
  lastFrameAt = now;
  scenery.update(now / 1000, delta);
  renderer.render(scene, camera);
}
