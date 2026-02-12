import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js";

const root = document.getElementById("scene");
const info = document.getElementById("scene-info");

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(root.clientWidth, root.clientHeight);
root.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, root.clientWidth / root.clientHeight, 0.1, 300);
camera.position.set(22, 16, 24);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 10, 0);

function createBuildingFromSpec(spec) {
  const group = new THREE.Group();

  const groundGeo = new THREE.BoxGeometry(spec.ground.width, spec.ground.height, spec.ground.depth);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = spec.ground.height / 2;
  group.add(ground);

  const b = spec.building;
  const w = spec.windows;
  let width = b.width;
  let depth = b.depth;

  const wallMat = new THREE.MeshStandardMaterial({ color: b.wallColor, roughness: 0.35, metalness: 0.1 });
  const glassMat = new THREE.MeshStandardMaterial({ color: b.glassColor, emissive: b.glassColor, emissiveIntensity: 0.16, roughness: 0.18, metalness: 0.3 });

  for (let floor = 0; floor < b.floors; floor += 1) {
    if (floor > 0 && floor % b.setbackEvery === 0) {
      width = Math.max(width - b.setbackAmount, 4.5);
      depth = Math.max(depth - b.setbackAmount, 4);
    }

    const floorGeo = new THREE.BoxGeometry(width, b.floorHeight, depth);
    const floorMesh = new THREE.Mesh(floorGeo, wallMat);
    floorMesh.position.y = spec.ground.height + b.floorHeight * (floor + 0.5);
    group.add(floorMesh);

    const zFront = depth / 2 + w.inset;
    const zBack = -depth / 2 - w.inset;
    const xRight = width / 2 + w.inset;
    const xLeft = -width / 2 - w.inset;

    for (let r = 0; r < w.rowsPerFloor; r += 1) {
      const y = spec.ground.height + b.floorHeight * floor + 0.7 + r * 1.1;

      for (let c = 0; c < w.columnsFront; c += 1) {
        const x = -width / 2 + (c + 1) * (width / (w.columnsFront + 1));
        const paneGeo = new THREE.PlaneGeometry(w.windowWidth, w.windowHeight);

        const frontPane = new THREE.Mesh(paneGeo, glassMat);
        frontPane.position.set(x, y, zFront);
        group.add(frontPane);

        const backPane = new THREE.Mesh(paneGeo, glassMat);
        backPane.position.set(x, y, zBack);
        backPane.rotation.y = Math.PI;
        group.add(backPane);
      }

      for (let c = 0; c < w.columnsSide; c += 1) {
        const z = -depth / 2 + (c + 1) * (depth / (w.columnsSide + 1));
        const paneGeo = new THREE.PlaneGeometry(w.windowWidth, w.windowHeight);

        const rightPane = new THREE.Mesh(paneGeo, glassMat);
        rightPane.position.set(xRight, y, z);
        rightPane.rotation.y = -Math.PI / 2;
        group.add(rightPane);

        const leftPane = new THREE.Mesh(paneGeo, glassMat);
        leftPane.position.set(xLeft, y, z);
        leftPane.rotation.y = Math.PI / 2;
        group.add(leftPane);
      }
    }
  }

  const roofGeo = new THREE.BoxGeometry(width + 0.3, 0.35, depth + 0.3);
  const roofMat = new THREE.MeshStandardMaterial({ color: b.roofColor, roughness: 0.55 });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = spec.ground.height + b.floors * b.floorHeight + 0.2;
  group.add(roof);

  return group;
}

async function init() {
  const response = await fetch("./assets/building.json");
  const spec = await response.json();

  const ambient = new THREE.AmbientLight(0xffffff, spec.lights.ambient);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xffffff, spec.lights.directional);
  sun.position.set(18, 35, 12);
  scene.add(sun);

  const building = createBuildingFromSpec(spec);
  scene.add(building);

  info.textContent = `${spec.name}: ${spec.building.floors} floors, JSON-driven`;
}

function onResize() {
  const width = root.clientWidth;
  const height = root.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

window.addEventListener("resize", onResize);

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

init();
animate();
