// The beach: atmospheric sky, sun, sand shelf, ocean and clouds.
//
// All of this is decoration and lives directly on the scene, not inside the
// arena pivot, so spinning the board with "q" leaves the world still.

import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { Water } from 'three/addons/objects/Water.js';
import {
  createWaterNormalMap,
  createSandTextures,
  createCloudTexture,
} from './textures.js';
import { CUBE_DIM, FLOOR_TOP } from './config.js';
import { isIOS, isMobile, envOverride } from './device.js';

/**
 * World heights, derived from the board so the beach follows if the cube size
 * changes. The sand sits just under the floor slab's lip; the sea is roughly
 * one cube below that.
 */
const BEACH_Y = FLOOR_TOP - 1;
const WATER_Y = FLOOR_TOP - CUBE_DIM * 0.8;

/**
 * The sand is a wide rectangle rather than a disc, so the shoreline is a
 * straight line running left to right, parallel to the horizon, instead of
 * curving around the board.
 *
 * It is flat out to SHORE_DISTANCE (away from the camera), then eases down
 * over SHORE_SLOPE and continues below the sea. BEACH_DROP has to exceed the
 * beach-to-water distance or the slope never reaches the sea and there is no
 * shoreline at all.
 */
const BEACH_WIDTH = 170 * CUBE_DIM;
const BEACH_DEPTH = 170 * CUBE_DIM;
const SHORE_DISTANCE = 11 * CUBE_DIM;
const SHORE_SLOPE = 9 * CUBE_DIM;
const BEACH_DROP = CUBE_DIM * 2.6;

/**
 * Wavelengths and amplitudes for the meandering of the shoreline, in world
 * units. Three summed sine waves at unrelated periods never visibly repeat
 * over the width of the beach, which a single wave or a tiled noise would.
 */
const SHORE_WAVES = [
  { wavelength: 3900, amplitude: 3.2 * CUBE_DIM, phase: 1.7 },
  { wavelength: 1530, amplitude: 1.4 * CUBE_DIM, phase: 4.2 },
  { wavelength: 640, amplitude: 0.55 * CUBE_DIM, phase: 0.6 },
];

/** How far the shoreline bulges in or out at a given position along it. */
function shoreOffset(x) {
  let offset = 0;
  for (const { wavelength, amplitude, phase } of SHORE_WAVES) {
    offset += Math.sin((x / wavelength) * Math.PI * 2 + phase) * amplitude;
  }
  return offset;
}

/**
 * Smooth, non-repeating patchiness across the beach, in the range 0..1.
 *
 * Summed sine products at unrelated periods and orientations. Because this is
 * evaluated per vertex over a single large mesh rather than sampled from a
 * tiled texture, it cannot repeat at all — which is precisely what makes it
 * effective at hiding the repetition of the texture underneath it.
 */
function patchiness(x, z) {
  const terms = [
    { fx: 1 / 2600, fz: 1 / 3300, weight: 0.5, phase: 0.0 },
    { fx: 1 / 1450, fz: 1 / 1100, weight: 0.3, phase: 2.1 },
    { fx: 1 / 700, fz: 1 / 890, weight: 0.2, phase: 4.7 },
  ];
  let value = 0;
  for (const { fx, fz, weight, phase } of terms) {
    value +=
      Math.sin(x * fx * Math.PI * 2 + phase) *
      Math.cos(z * fz * Math.PI * 2 + phase * 0.7) *
      weight;
  }
  return value * 0.5 + 0.5;
}

const SKY_SCALE = 20000;
const OCEAN_SIZE = 14000;

/**
 * Sun placement, in degrees.
 *
 * Azimuth 300 puts the sun behind and to the left of the default camera, so it
 * is out of frame and its glare is not aimed back at the viewer. At 145 it sat
 * front-right, which blew out that side of both the sky and the water. The
 * elevation is high enough to avoid the thick, hazy band near the horizon
 * while still raking the cubes for long shadows.
 */
export const SUN = { elevation: 24, azimuth: 300 };

/** Wave animation rate, in Water's time units per second. */
const WAVE_SPEED = 0.35;

/**
 * Cloud orbit rate, in radians per second at drift 1.0 — a full circuit takes
 * roughly ten minutes. (The first version multiplied by a delta in
 * milliseconds, which ran the sky about 200x too fast.)
 */
const CLOUD_SPEED = 0.01;

let water;
let clouds = [];
let sunDirection = new THREE.Vector3();

/**
 * Builds the scenery and returns the sun direction so the key light can be
 * aimed to match the sky.
 */
export function create(scene, renderer) {
  sunDirection = computeSunDirection();

  // Haze only reaches the far ocean; the board sits well inside it. Fog has to
  // reach full strength by the edge of the water plane, otherwise that edge
  // shows as a hard seam against the sky instead of a horizon. Set before the
  // water is built, which needs to know whether the scene is fogged.
  scene.fog = new THREE.Fog(0xbcd4e0, OCEAN_SIZE * 0.25, OCEAN_SIZE * 0.5);

  const sky = createSky(scene);
  const hasEnvironment = applyEnvironment(scene, renderer, sky);
  createBeach(scene, renderer);
  createOcean(scene);
  createClouds(scene);

  return { sunDirection, hasEnvironment };
}

function computeSunDirection() {
  // Sky wants the sun as a direction on the unit sphere.
  const phi = THREE.MathUtils.degToRad(90 - SUN.elevation);
  const theta = THREE.MathUtils.degToRad(SUN.azimuth);
  return new THREE.Vector3().setFromSphericalCoords(1, phi, theta);
}

function createSky(scene) {
  const sky = new Sky();
  sky.scale.setScalar(SKY_SCALE);

  const uniforms = sky.material.uniforms;
  // Lower turbidity and Mie scattering keep the halo around the sun tight
  // instead of washing a whole quadrant of sky to white.
  uniforms.turbidity.value = 3.5;
  uniforms.rayleigh.value = 1.2;
  uniforms.mieCoefficient.value = 0.0025;
  uniforms.mieDirectionalG.value = 0.7;
  uniforms.sunPosition.value.copy(sunDirection);

  scene.add(sky);
  return sky;
}

/**
 * Renders the sky into an environment map so cubes and water pick up real
 * sky reflections instead of being lit by lights alone.
 */
function applyEnvironment(scene, renderer, sky) {
  const override = envOverride();

  // PMREM renders into a half-float target and filters it. On iOS/WebKit that
  // combination is unreliable — the capture comes back black, which leaves
  // every MeshStandardMaterial in the scene unlit no matter what the lights
  // do. Skip it there and light the scene analytically instead.
  // `?env=on` forces it back on to check whether a given device still needs
  // this; `?env=off` reproduces the fallback anywhere.
  const wanted = override ?? !isIOS;
  if (!wanted) {
    scene.add(sky);
    return false;
  }

  try {
    const pmrem = new THREE.PMREMGenerator(renderer);

    // The sky has to be alone in a scene for the capture, then handed back.
    const captureScene = new THREE.Scene();
    captureScene.add(sky);
    const target = pmrem.fromScene(captureScene);
    scene.add(sky);

    scene.environment = target.texture;
    pmrem.dispose();
    return true;
  } catch (error) {
    // A driver that refuses the half-float target throws rather than
    // returning something unusable; either way the fallback lighting applies.
    console.warn('Environment capture failed; using lights only.', error);
    scene.add(sky);
    scene.environment = null;
    return false;
  }
}

/**
 * Patches a material to sample its colour map twice at unrelated scales and
 * orientations, blending between them with a very low-frequency mask taken
 * from the map itself.
 *
 * No amount of tuning repeat counts removes tiling, because the pattern really
 * is repeating; this makes the repeat period effectively the product of two
 * incommensurate scales, which is far larger than the visible beach.
 */
function makeNonRepeating(material) {
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      /* glsl */ `
      #ifdef USE_MAP
        // Second sample: rotated, and scaled by an irrational-ish factor so
        // the two grids never come back into alignment.
        mat2 detailRotation = mat2( 0.8, -0.6, 0.6, 0.8 );
        vec2 uvDetail = detailRotation * vMapUv * 0.413 + vec2( 0.37, 0.11 );

        vec4 sampleBase = texture2D( map, vMapUv );
        vec4 sampleDetail = texture2D( map, uvDetail );

        // Reuse the map at a very low frequency as the blend mask, so no
        // extra texture is needed.
        float blendMask = texture2D( map, vMapUv * 0.037 ).g;
        blendMask = smoothstep( 0.35, 0.65, blendMask );

        vec4 sampledDiffuseColor = mix( sampleBase, sampleDetail, blendMask );
        diffuseColor *= sampledDiffuseColor;
      #endif
      `,
    );
  };

  // Without this, three could reuse a cached program compiled for an
  // unpatched MeshStandardMaterial.
  material.customProgramCacheKey = () => 'sand-non-repeating';
}

/**
 * A wide sheet of sand, flat under the board and sloping into the sea along a
 * straight shoreline. Height depends only on distance away from the camera, so
 * the waterline is a straight edge rather than a curve.
 */
function createBeach(scene, renderer) {
  // Enough width segments to resolve the meander along the shoreline.
  const geometry = new THREE.PlaneGeometry(BEACH_WIDTH, BEACH_DEPTH, 256, 192);
  const position = geometry.attributes.position;

  const colors = new Float32Array(position.count * 3);

  for (let i = 0; i < position.count; i++) {
    // After the -90 degree rotation below, local +y points away from the
    // camera and local +z points up.
    const x = position.getX(i);
    const rawAway = position.getY(i);
    const away = rawAway + shoreOffset(x);

    const t = THREE.MathUtils.clamp((away - SHORE_DISTANCE) / SHORE_SLOPE, 0, 1);
    // Smoothstep keeps the top of the slope from reading as a hard crease.
    const height = -BEACH_DROP * t * t * (3 - 2 * t);
    position.setZ(i, height);

    // Broad dry-sand patchiness, which never repeats.
    let shade = 0.86 + patchiness(x, rawAway) * 0.28;

    // Sand darkens as it approaches and passes below the waterline.
    const worldY = BEACH_Y + height;
    // smoothstep runs low-to-high, so invert it: wet is *below* the waterline.
    const wetness =
      1 -
      THREE.MathUtils.smoothstep(
        worldY,
        WATER_Y - CUBE_DIM * 0.2,
        WATER_Y + CUBE_DIM * 0.5,
      );
    shade *= THREE.MathUtils.lerp(1, 0.58, wetness);

    colors[i * 3] = shade;
    colors[i * 3 + 1] = shade * 0.99;
    colors[i * 3 + 2] = shade * 0.96;
  }
  position.needsUpdate = true;
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  const { map, normalMap } = createSandTextures();
  // Deliberately mismatched, and not multiples of one another: the colour
  // tiles across large patches while the ripples tile much faster, so the two
  // patterns only line up once across the whole beach instead of at every
  // tile boundary. Matching repeats are what make tiling obvious.
  map.repeat.set(23, 23);
  normalMap.repeat.set(107, 107);

  // The sand is seen at a grazing angle, where anisotropic filtering matters
  // far more than resolution.
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  map.anisotropy = Math.min(8, maxAnisotropy);
  normalMap.anisotropy = Math.min(8, maxAnisotropy);

  const material = new THREE.MeshStandardMaterial({
    map,
    normalMap,
    normalScale: new THREE.Vector2(0.8, 0.8),
    roughness: 0.95,
    metalness: 0,
    envMapIntensity: 0.5,
    vertexColors: true,
  });
  makeNonRepeating(material);

  const sand = new THREE.Mesh(geometry, material);
  sand.rotation.x = -Math.PI / 2;
  sand.position.y = BEACH_Y;
  sand.receiveShadow = true;
  scene.add(sand);
}

/**
 * Uses three's Water object rather than a normal-mapped plane. It renders the
 * scene into a reflection buffer each frame and distorts both the reflection
 * and the refracted depth by the wave normals, which is what actually makes a
 * surface read as water — a static plane never will, however good its normals.
 */
function createOcean(scene) {
  const waterNormals = createWaterNormalMap();
  waterNormals.wrapS = THREE.RepeatWrapping;
  waterNormals.wrapT = THREE.RepeatWrapping;

  // Water renders the whole scene into its reflection buffer every frame; on
  // a phone that buffer is a real cost, and half the resolution is invisible
  // at this distance.
  const reflectionSize = isMobile ? 512 : 1024;

  water = new Water(new THREE.PlaneGeometry(OCEAN_SIZE, OCEAN_SIZE), {
    textureWidth: reflectionSize,
    textureHeight: reflectionSize,
    waterNormals,
    sunDirection: sunDirection.clone(),
    sunColor: 0xe8dcc4,
    waterColor: 0x0e3d55,
    distortionScale: 4.0,
    fog: scene.fog !== undefined,
  });
  water.rotation.x = -Math.PI / 2;
  water.position.y = WATER_Y;

  // The default 1:1 mapping tiles the waves far too large at this scale.
  water.material.uniforms.size.value = 8.0;

  scene.add(water);
}

function createClouds(scene) {
  const texture = createCloudTexture();
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    opacity: 0.85,
    fog: false,
  });

  const count = 16;
  for (let i = 0; i < count; i++) {
    const sprite = new THREE.Sprite(material.clone());
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
    const distance = 4200 + Math.random() * 3200;
    const scale = 1500 + Math.random() * 2200;

    sprite.position.set(
      Math.cos(angle) * distance,
      900 + Math.random() * 900,
      Math.sin(angle) * distance,
    );
    sprite.scale.set(scale, scale * 0.45, 1);
    sprite.material.opacity = 0.5 + Math.random() * 0.35;
    // Drift speed varies so the sky never looks like one rigid layer.
    sprite.userData.drift = 0.6 + Math.random() * 1.1;

    clouds.push(sprite);
    scene.add(sprite);
  }
}

/**
 * Advances the waves and cloud drift.
 * `elapsed` is total seconds, `delta` is seconds since the previous frame.
 */
export function update(elapsed, delta) {
  if (water) {
    water.material.uniforms.time.value += delta * WAVE_SPEED;
  }

  for (const cloud of clouds) {
    // Orbit the board slowly rather than drifting off to infinity.
    const { x, z } = cloud.position;
    const angle = cloud.userData.drift * delta * CLOUD_SPEED;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    cloud.position.x = x * cos - z * sin;
    cloud.position.z = x * sin + z * cos;
  }
}
