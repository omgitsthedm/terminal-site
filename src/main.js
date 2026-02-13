import "./styles.css";
import * as THREE from "three";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GUI from "lil-gui";
import {
  EffectComposer,
  RenderPass,
  EffectPass,
  BloomEffect,
  NoiseEffect,
  VignetteEffect,
} from "postprocessing";

gsap.registerPlugin(ScrollTrigger);

const sceneRoot = document.getElementById("scene");

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0b1320, 16, 72);

const camera = new THREE.PerspectiveCamera(
  48,
  sceneRoot.clientWidth / sceneRoot.clientHeight,
  0.1,
  200,
);
camera.position.set(18, 14, 22);

const ambient = new THREE.AmbientLight(0x89c5ff, 0.6);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xc7f2ff, 1.25);
key.position.set(14, 22, 10);
scene.add(key);

const rim = new THREE.DirectionalLight(0x36b6ff, 0.75);
rim.position.set(-18, 10, -16);
scene.add(rim);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(34, 80),
  new THREE.MeshStandardMaterial({
    color: 0x0a1623,
    roughness: 0.9,
    metalness: 0.08,
  }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.02;
scene.add(floor);

let renderer = null;
let composer = null;
let bloom = null;
let noise = null;
let hasWebGL = true;

try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(sceneRoot.clientWidth, sceneRoot.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  sceneRoot.appendChild(renderer.domElement);

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  bloom = new BloomEffect({
    intensity: 0.65,
    luminanceThreshold: 0.22,
    mipmapBlur: true,
  });
  noise = new NoiseEffect({ premultiply: true, blendFunction: 1 });
  const vignette = new VignetteEffect({
    eskil: false,
    offset: 0.28,
    darkness: 0.5,
  });
  composer.addPass(new EffectPass(camera, bloom, noise, vignette));
} catch {
  hasWebGL = false;
  sceneRoot.classList.add("scene-fallback");
  sceneRoot.innerHTML =
    '<div class="fallback-note">WebGL unavailable in this browser context.</div>';
}

const towerGroup = new THREE.Group();
scene.add(towerGroup);

function createTower(spec) {
  const group = new THREE.Group();
  const building = spec.building;
  const windows = spec.windows;

  const podium = new THREE.Mesh(
    new THREE.BoxGeometry(
      spec.ground.width,
      spec.ground.height,
      spec.ground.depth,
    ),
    new THREE.MeshStandardMaterial({
      color: 0x102338,
      roughness: 0.7,
      metalness: 0.2,
    }),
  );
  podium.position.y = spec.ground.height / 2;
  group.add(podium);

  const shellMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(building.wallColor),
    roughness: 0.22,
    metalness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.2,
    transmission: 0.08,
  });
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(building.glassColor),
    emissive: new THREE.Color(building.glassColor),
    emissiveIntensity: 0.16,
    roughness: 0.1,
    metalness: 0.6,
  });

  let width = building.width;
  let depth = building.depth;

  for (let floorIndex = 0; floorIndex < building.floors; floorIndex += 1) {
    if (floorIndex > 0 && floorIndex % building.setbackEvery === 0) {
      width = Math.max(width - building.setbackAmount, 4.6);
      depth = Math.max(depth - building.setbackAmount, 4.2);
    }

    const y = spec.ground.height + building.floorHeight * (floorIndex + 0.5);
    const shell = new THREE.Mesh(
      new THREE.BoxGeometry(width, building.floorHeight, depth),
      shellMaterial,
    );
    shell.position.set(0, y, 0);
    group.add(shell);

    const frontZ = depth / 2 + windows.inset;
    const backZ = -depth / 2 - windows.inset;

    for (let row = 0; row < windows.rowsPerFloor; row += 1) {
      const wy =
        spec.ground.height +
        building.floorHeight * floorIndex +
        0.68 +
        row * 1.08;

      for (let col = 0; col < windows.columnsFront; col += 1) {
        const wx =
          -width / 2 + ((col + 1) * width) / (windows.columnsFront + 1);
        const pane = new THREE.PlaneGeometry(
          windows.windowWidth,
          windows.windowHeight,
        );

        const front = new THREE.Mesh(pane, windowMaterial);
        front.position.set(wx, wy, frontZ);
        group.add(front);

        const back = new THREE.Mesh(pane, windowMaterial);
        back.position.set(wx, wy, backZ);
        back.rotation.y = Math.PI;
        group.add(back);
      }
    }
  }

  const roof = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 2.4, 4.6, 20),
    new THREE.MeshStandardMaterial({
      color: 0x4cc9ff,
      emissive: 0x1b6db2,
      emissiveIntensity: 0.5,
    }),
  );
  roof.position.y =
    spec.ground.height + building.floors * building.floorHeight + 2.1;
  group.add(roof);

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(2.4, 0.08, 18, 50),
    new THREE.MeshBasicMaterial({ color: 0x7dd3fc }),
  );
  halo.rotation.x = Math.PI / 2;
  halo.position.y = roof.position.y - 1.4;
  group.add(halo);

  return group;
}

async function setupScene() {
  const response = await fetch("/data/building.json");
  const spec = await response.json();
  towerGroup.add(createTower(spec));

  const heroTimeline = gsap.timeline({ defaults: { ease: "power2.out" } });
  heroTimeline
    .from(".site-header", { y: -24, opacity: 0, duration: 0.7 })
    .from(
      ".eyebrow",
      { y: 12, opacity: 0, stagger: 0.12, duration: 0.6 },
      "-=0.35",
    )
    .from("h1", { y: 18, opacity: 0, duration: 0.8 }, "-=0.3")
    .from(".lead", { y: 18, opacity: 0, duration: 0.6 }, "-=0.45")
    .from("#scene", { scale: 0.98, opacity: 0, duration: 0.9 }, "-=0.45");

  gsap.to(towerGroup.rotation, {
    y: Math.PI * 0.82,
    ease: "none",
    scrollTrigger: {
      trigger: "#story-3",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
    },
  });

  gsap.to(camera.position, {
    x: 8,
    y: 16,
    z: 14,
    ease: "none",
    scrollTrigger: {
      trigger: "#story-2",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
    },
  });

  gsap.to(".split", {
    opacity: 1,
    y: 0,
    stagger: 0.16,
    ease: "power2.out",
    scrollTrigger: {
      trigger: "#story-1",
      start: "top 80%",
    },
  });
}

function onResize() {
  if (!hasWebGL) {
    return;
  }

  const width = sceneRoot.clientWidth;
  const height = sceneRoot.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  composer.setSize(width, height);
}

const lenis = new Lenis({
  duration: 1.05,
  smoothWheel: true,
  wheelMultiplier: 0.95,
});
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((t) => {
  lenis.raf(t * 1000);
});
gsap.ticker.lagSmoothing(0);

const pointer = { x: 0, y: 0 };
window.addEventListener("pointermove", (event) => {
  pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
  pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
});

const params = {
  bloomIntensity: 0.65,
  sceneSpin: 0.08,
  grain: 0.15,
};

const gui = new GUI({ width: 260, title: "Creative Tuning" });
if (hasWebGL) {
  gui.add(params, "bloomIntensity", 0, 1.5, 0.01).onChange((v) => {
    bloom.intensity = v;
  });
  gui.add(params, "sceneSpin", 0, 0.6, 0.01);
  gui.add(params, "grain", 0, 0.6, 0.01).onChange((v) => {
    noise.blendMode.opacity.value = v;
  });
} else {
  gui.hide();
}

function animate() {
  const t = performance.now() * 0.001;
  towerGroup.rotation.y += params.sceneSpin * 0.0018;
  towerGroup.rotation.x = pointer.y * 0.03;
  towerGroup.position.x = pointer.x * 0.4;

  key.intensity = 1 + Math.sin(t * 0.7) * 0.12;
  if (hasWebGL) {
    composer.render();
  }
  requestAnimationFrame(animate);
}

window.addEventListener("resize", onResize);

gsap.set(".split", { opacity: 0, y: 36 });
setupScene();
animate();
