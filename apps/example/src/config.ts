export const demos = ["demo1", "demo2", "demo3"];

/** 与各 `demoN/index.ts` 中 `demoInfo` 的静态字段一致，供首屏占位；新增 demo 时需同步更新 */
export type DemoShellEntry = {
  id: string;
  name: string;
  description: string;
  showInMenu: boolean;
};

export const demoShellManifest: readonly DemoShellEntry[] = [
  {
    id: "demo1",
    name: "phong与lambert材质",
    description: "第一个演示：基本的phong材质和lambert材质旋转展示",
    showInMenu: true,
  },
  {
    id: "demo2",
    name: "1万立方体",
    description: "第二个演示：10000个正方体的旋转场景渲染",
    showInMenu: true,
  },
  {
    id: "demo3",
    name: "视锥体剔除对照",
    description: "第三个演示：关闭 frustumCulling，与开启 frustumCulling。",
    showInMenu: true,
  },
];

/**
 * 仓库内 `apps/example/src` 在 GitHub 上的 blob 根路径（无末尾斜杠）。
 * Fork 后可设环境变量 `VITE_GITHUB_SOURCE_APPS_EXAMPLE_SRC` 覆盖。
 */
export const GITHUB_SOURCE_APPS_EXAMPLE_SRC =
  import.meta.env.VITE_GITHUB_SOURCE_APPS_EXAMPLE_SRC ??
  "https://github.com/Lethe-HJ/mini-three/blob/main/apps/example/src";
