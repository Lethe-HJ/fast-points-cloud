import {
  PerspectiveCamera,
  Scene,
  AmbientLight,
  PointLight,
  BoxGeometry,
  MeshPhongMaterial,
  WebGLRenderer,
  Color,
  Mesh,
  Group,
} from "three";
import Stats from "stats.js";
import { CameraTransformController } from "../utils/transform";

const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
if (!canvas) throw new Error("Canvas #canvas not found");

const width = 600;
const height = 300;
const dpr = window.devicePixelRatio || 1;
canvas.width = width * dpr;
canvas.height = height * dpr;
canvas.style.width = `${width}px`;
canvas.style.height = `${height}px`;

const camera = new PerspectiveCamera(60, width / height, 0.1, 1000);
camera.up.set(0, 1, 0);
const cameraController = new CameraTransformController(camera, {
  initialDistance: 30,
  minDistance: 10,
  maxDistance: 100,
  rotationSpeed: 0.002,
  zoomSpeed: 0.01,
});
cameraController.bindEvents(canvas);

const scene = new Scene();
scene.background = new Color(0xffffffff);
const ambient = new AmbientLight(0x494949);
scene.add(ambient);
const pointLight = new PointLight(0xffffff, 1.5, 0, 0);
pointLight.position.set(50, 50, 50);
scene.add(pointLight);

const boxGeometry = new BoxGeometry(0.2, 0.2, 0.2);
const group = new Group();
scene.add(group);
const meshes: Mesh[] = [];
const count = 1000;
const spread = 20;
for (let i = 0; i < count; i++) {
  const color = new Color().setHSL(Math.random(), 0.7, 0.5);
  const material = new MeshPhongMaterial({
    color: color,
    specular: 0xffffff,
    shininess: 30,
  });
  const mesh = new Mesh(boxGeometry, material);
  group.add(mesh);
  mesh.position.set(
    (Math.random() - 0.5) * spread,
    (Math.random() - 0.5) * spread,
    (Math.random() - 0.5) * spread,
  );
  mesh.rotation.set(
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
  );
  const scale = 0.5 + Math.random();
  mesh.scale.setScalar(scale);
  meshes.push(mesh);
}

const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.setSize(width, height);
renderer.setPixelRatio(dpr);
renderer.setClearColor(0x000000);

const stats = new Stats();
document.body.appendChild(stats.dom);

function animate() {
  stats.begin();
  meshes.forEach((mesh, index) => {
    const speed = 0.5 + (index % 5) * 0.01;
    mesh.rotation.x += 0.01 * speed;
    mesh.rotation.y += 0.02 * speed;
    mesh.rotation.z += 0.005 * speed;
  });
  renderer.render(scene, camera);
  stats.end();
  requestAnimationFrame(animate);
}
animate();
