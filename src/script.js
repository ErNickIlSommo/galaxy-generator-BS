import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Galaxy
 */

const parameters = {
  count: 100000,
  size: 0.001,
  radius: 1,
  branches: 3,
  spin: -3.15,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: "#ff6030",
  outsideColor: "#1b3984",
};

let geometry = null;
let material = null;
let points = null;

gui
  .add(parameters, "count")
  .min(1)
  .max(100000)
  .step(1)
  .onFinishChange((newCount) => generateGalaxy());
gui
  .add(parameters, "size")
  .min(0.001)
  .max(1)
  .step(0.001)
  .onFinishChange((newParticleSize) => generateGalaxy());

gui
  .add(parameters, "radius")
  .min(0)
  .max(10)
  .step(0.01)
  .onFinishChange(() => generateGalaxy());

gui
  .add(parameters, "branches")
  .min(2)
  .max(20)
  .step(1)
  .onFinishChange(() => generateGalaxy());

gui
  .add(parameters, "spin")
  .min(-5)
  .max(5)
  .step(0.01)
  .onFinishChange(() => generateGalaxy());

gui
  .add(parameters, "randomness")
  .min(0)
  .max(2)
  .step(0.001)
  .onFinishChange(() => generateGalaxy());

gui
  .add(parameters, "randomnessPower")
  .min(1)
  .max(10)
  .step(0.001)
  .onFinishChange(() => generateGalaxy());

gui.addColor(parameters, "insideColor").onFinishChange(() => generateGalaxy());
gui.addColor(parameters, "outsideColor").onFinishChange(() => generateGalaxy());

const generateGalaxy = () => {
  if (points != null) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }
  geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);

  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < positions.length; i++) {
    const i3 = i * 3;

    // Position
    const radius = Math.random() * parameters.radius;
    const branchAngle =
      2 * Math.PI * ((i % parameters.branches) / parameters.branches);
    const spinAngle = radius * parameters.spin;

    const randomX =
      (Math.random() < 0.5 ? 1 : -1) *
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() - 0.5) *
      parameters.randomness;
    const randomY =
      (Math.random() < 0.5 ? 1 : -1) *
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() - 0.5) *
      parameters.randomness;
    const randomZ =
      (Math.random() < 0.5 ? 1 : -1) *
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() - 0.5) *
      parameters.randomness;

    positions[i3] = radius * Math.cos(branchAngle + spinAngle) + randomX; // x axis
    positions[i3 + 1] = 0 + randomY; // y axis
    positions[i3 + 2] = radius * Math.sin(branchAngle + spinAngle) + randomZ; // z axis

    // Colors
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius);

    colors[i3 + 0] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  material = new THREE.PointsMaterial({
    size: parameters.size,
    // sizeAttenuation: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);
};

generateGalaxy();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
