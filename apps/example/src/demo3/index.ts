export const demoInfo = {
  id: "demo3",
  name: "视锥体剔除对照",
  description: "第三个演示：左侧关闭 frustumCulling，右侧开启 frustumCulling。",
  showInMenu: true,
  leftFile: "webgl1.ts",
  rightFile: "webgl2.ts",
  init: async () => {
    await Promise.all([import("./webgl1"), import("./webgl2")]);
  },
};
