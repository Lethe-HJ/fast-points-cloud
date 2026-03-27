# Monorepo 管理方式

本文档描述当前仓库的多包结构与统一管理方式。

## 目录结构

```text
mini-three/
├── package.json                # 根 package：仅仓库级工具和 check 占位
├── pnpm-workspace.yaml         # workspace 包匹配规则
├── pnpm-lock.yaml              # 全仓唯一 lockfile
├── .husky/                     # 全仓统一 Git hooks
├── docs/
│   └── monorepo.md
├── packages/
│   ├── webgl/                  # WebGL 子项目
│   ├── webgpu/                 # WebGPU 子项目（当前为占位实现）
│   └── types/                  # 跨子项目共享类型
└── apps/
    └── example/                # 独立示例应用
```

## 包职责

- `@mini-three/webgl`
  - 对外提供 WebGL 能力入口。
  - 依赖 `@mini-three/types` 的共享接口定义。
- `@mini-three/webgpu`
  - 对外提供 WebGPU 能力入口（目前仍是占位导出）。
  - 依赖 `@mini-three/types` 的共享接口定义。
- `@mini-three/types`
  - 存放跨渲染后端复用的公共类型。
  - 目前包含最小公共集合：`RendererConfig`、`ObjectType`。
- `@mini-three/example`
  - 示例应用，独立于引擎包维护。
  - 依赖 `@mini-three/webgl` 展示引擎效果与 Three.js 对比。

## 管理原则

### 根目录（仓库级）

- 仅放全仓共享配置与工具，不放业务实现。
- 根 `package.json`：
  - `prepare` 用于安装 Husky。
  - `check` 为 no-op（`true`），用于统一递归检查入口。
- 根 `.husky/pre-commit` 只执行统一命令：

```sh
#!/usr/bin/env sh
pnpm -r run check
```

### 子包（业务级）

- 每个包都必须提供统一 `check` 脚本。
- 每个包的 `check` 通过本包 `scripts/check.sh` 串联：
  - `typecheck`
  - `lint`
  - `format:check`
- 子包不安装 Husky，不维护独立 lockfile。

## workspace 规则

`pnpm-workspace.yaml` 当前规则：

- `packages/*`
- `apps/*`

新增子包时，只需在对应目录下创建包并提供 `check` 脚本，无需改根 pre-commit。

## 常用命令

| 场景 | 建议命令 |
| --- | --- |
| 安装依赖 | 根目录执行 `pnpm install` |
| 全仓检查 | 根目录执行 `pnpm -r run check` |
| 检查 webgl | 根目录执行 `pnpm --filter @mini-three/webgl run check` |
| 检查 webgpu | 根目录执行 `pnpm --filter @mini-three/webgpu run check` |
| 检查 types | 根目录执行 `pnpm --filter @mini-three/types run check` |
| 启动示例 app | 根目录执行 `pnpm --filter @mini-three/example run dev` |
