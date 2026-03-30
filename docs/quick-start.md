# 快速开始

以下示例演示如何创建场景、相机、光照、网格并进入渲染循环。

```typescript
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
} from "@mini-three/webgl";

// 创建场景
const scene = new Scene();
scene.background = new Color(0xffffffff);

// 创建相机
const camera = new PerspectiveCamera(60, width / height, 0.1, 1000);
camera.position.set(30, 30, 30);
camera.lookAt(0, 0, 0);

// 添加光照
const ambient = new AmbientLight(0x494949);
scene.add(ambient);

const pointLight = new PointLight(0xffffff, 1.5, 0, 0);
pointLight.position.set(50, 50, 50);
scene.add(pointLight);

// 创建网格
const geometry = new BoxGeometry(0.2, 0.2, 0.2);
const material = new MeshPhongMaterial({
  color: 0x00ff00,
  specular: 0xffffff,
  shininess: 30,
});
const mesh = new Mesh(geometry, material);
scene.add(mesh);

// 渲染
const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.setSize(width, height);

function animate() {
  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.02;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
```

交互式示例见 [示例与 Demo](./demos.md)。
