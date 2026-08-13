// Procedurally generated textures, built on a canvas at load time.
//
// Everything the beach needs is generated here rather than shipped as image
// files: it keeps the repo free of more binary assets and lets the look be
// tuned by changing numbers instead of re-exporting art.

import * as THREE from 'three';

/** Deterministic PRNG so the scenery looks the same on every load. */
function makeRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Tiling value-noise lattice with smoothstep interpolation. */
function makeValueNoise(size, seed) {
  const random = makeRandom(seed);
  const grid = new Float32Array(size * size);
  for (let i = 0; i < grid.length; i++) grid[i] = random();

  return (x, y) => {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;
    // Smoothstep keeps the lattice from showing as a diamond grid.
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);

    const wrap = (v) => ((v % size) + size) % size;
    const ix0 = wrap(x0);
    const iy0 = wrap(y0);
    const ix1 = wrap(x0 + 1);
    const iy1 = wrap(y0 + 1);

    const v00 = grid[iy0 * size + ix0];
    const v10 = grid[iy0 * size + ix1];
    const v01 = grid[iy1 * size + ix0];
    const v11 = grid[iy1 * size + ix1];

    return (
      v00 * (1 - sx) * (1 - sy) +
      v10 * sx * (1 - sy) +
      v01 * (1 - sx) * sy +
      v11 * sx * sy
    );
  };
}

/**
 * Fractal noise heightfield, tiling seamlessly at `resolution`.
 * `octaves` layers doubling frequency at halving amplitude.
 */
function makeHeightfield(
  resolution,
  { octaves = 4, baseFrequency = 4, seed = 1, stretchY = 1 } = {},
) {
  const noises = [];
  for (let o = 0; o < octaves; o++) {
    noises.push(makeValueNoise(baseFrequency << o, seed + o * 977));
  }

  const height = new Float32Array(resolution * resolution);
  let min = Infinity;
  let max = -Infinity;

  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      let value = 0;
      let amplitude = 1;
      for (let o = 0; o < octaves; o++) {
        const frequency = (baseFrequency << o) / resolution;
        // stretchY < 1 elongates features along y, turning isotropic blobs
        // into directional swell. Kept to simple fractions so the lattice
        // still tiles seamlessly.
        value += noises[o](x * frequency, y * frequency * stretchY) * amplitude;
        amplitude *= 0.5;
      }
      height[y * resolution + x] = value;
      if (value < min) min = value;
      if (value > max) max = value;
    }
  }

  // Normalise to 0..1
  const range = max - min || 1;
  for (let i = 0; i < height.length; i++) {
    height[i] = (height[i] - min) / range;
  }
  return height;
}

/** Converts a heightfield into a tangent-space normal map via Sobel slopes. */
function heightfieldToNormalTexture(height, resolution, strength) {
  const canvas = document.createElement('canvas');
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(resolution, resolution);

  const at = (x, y) => {
    const wx = ((x % resolution) + resolution) % resolution;
    const wy = ((y % resolution) + resolution) % resolution;
    return height[wy * resolution + wx];
  };

  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;

      // Normal of the surface described by those slopes.
      let nx = -dx;
      let ny = -dy;
      let nz = 1;
      const length = Math.hypot(nx, ny, nz);
      nx /= length;
      ny /= length;
      nz /= length;

      const i = (y * resolution + x) * 4;
      image.data[i] = (nx * 0.5 + 0.5) * 255;
      image.data[i + 1] = (ny * 0.5 + 0.5) * 255;
      image.data[i + 2] = (nz * 0.5 + 0.5) * 255;
      image.data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Wave normal map for the ocean. Long, low-frequency swell with finer chop
 * layered over it, stretched along one axis so it reads as travelling waves
 * rather than a bumpy field.
 */
export function createWaterNormalMap(resolution = 512) {
  const swell = makeHeightfield(resolution, {
    octaves: 3,
    baseFrequency: 4,
    seed: 20250813,
    stretchY: 0.25,
  });
  const chop = makeHeightfield(resolution, {
    octaves: 4,
    baseFrequency: 12,
    seed: 555,
    stretchY: 0.5,
  });

  const combined = new Float32Array(swell.length);
  for (let i = 0; i < swell.length; i++) {
    combined[i] = swell[i] * 0.75 + chop[i] * 0.25;
  }
  return heightfieldToNormalTexture(combined, resolution, 45);
}

/** Grainy colour + normal maps for sand. */
export function createSandTextures(resolution = 512) {
  const grain = makeHeightfield(resolution, {
    octaves: 5,
    baseFrequency: 16,
    seed: 7,
  });
  const dunes = makeHeightfield(resolution, {
    octaves: 3,
    baseFrequency: 3,
    seed: 4242,
  });

  const canvas = document.createElement('canvas');
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(resolution, resolution);

  // Kept close together on purpose. Strong large-scale blotches in a colour
  // map are the single most visible cue that a texture is tiling, so the
  // contrast lives in the normal map's ripples instead.
  const light = { r: 221, g: 199, b: 158 };
  const dark = { r: 197, g: 172, b: 130 };

  for (let i = 0; i < grain.length; i++) {
    // Mostly fine grain, with only a hint of broad dune shading.
    const t = THREE.MathUtils.clamp(dunes[i] * 0.35 + grain[i] * 0.65, 0, 1);
    const j = i * 4;
    image.data[j] = THREE.MathUtils.lerp(dark.r, light.r, t);
    image.data[j + 1] = THREE.MathUtils.lerp(dark.g, light.g, t);
    image.data[j + 2] = THREE.MathUtils.lerp(dark.b, light.b, t);
    image.data[j + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;

  // Ripples come mostly from the fine grain.
  const combined = new Float32Array(grain.length);
  for (let i = 0; i < grain.length; i++) {
    combined[i] = grain[i] * 0.7 + dunes[i] * 0.3;
  }
  const normalMap = heightfieldToNormalTexture(combined, resolution, 12);

  return { map, normalMap };
}

/** Soft, puffy alpha texture for cloud billboards. */
export function createCloudTexture(resolution = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext('2d');
  const random = makeRandom(99);

  ctx.clearRect(0, 0, resolution, resolution);

  // A cluster of soft radial blobs reads as a cumulus puff.
  const blobs = 18;
  for (let i = 0; i < blobs; i++) {
    const angle = random() * Math.PI * 2;
    const spread = Math.pow(random(), 0.6);
    const cx = resolution / 2 + Math.cos(angle) * spread * resolution * 0.28;
    // Flatten the cluster vertically so it sits like a cloud, not a ball.
    const cy = resolution / 2 + Math.sin(angle) * spread * resolution * 0.13;
    const radius = resolution * (0.10 + random() * 0.13);

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, 'rgba(255,255,255,0.55)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.22)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
