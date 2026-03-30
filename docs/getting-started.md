# 环境与安装

## 环境准备

```bash
# 安装 Node.js 22.12.0
nvm install 22.12.0
nvm use 22.12.0

# 配置 npm 镜像（推荐）
npm config set registry https://registry.npmmirror.com/

# 安装 pnpm
npm install pnpm -g
pnpm config set registry https://registry.npmmirror.com/
```

## 安装依赖

```bash
# 在仓库根目录安装（推荐）
pnpm install

# 单独检查某个子包（示例）
pnpm --filter @mini-three/webgl run check
```

## 常用命令

### 开发命令

```bash
# 在仓库根目录执行全仓检查
pnpm -r run check

# 运行 webgl 包类型检查
pnpm --filter @mini-three/webgl run typecheck

# 运行 webgpu 包类型检查
pnpm --filter @mini-three/webgpu run typecheck

# 运行 types 包类型检查
pnpm --filter @mini-three/types run typecheck

# 启动独立示例应用
pnpm --filter @mini-three/example run dev
```

### 代码质量

```bash
# 执行某个子包完整检查
pnpm --filter @mini-three/webgl run check
pnpm --filter @mini-three/webgpu run check
pnpm --filter @mini-three/types run check
pnpm --filter @mini-three/example run check
```

## 仓库目录（与示例相关）

```text
packages/
├── webgl/              # WebGL 子项目入口
├── webgpu/             # WebGPU 子项目入口（占位）
└── types/              # 跨渲染后端共享类型

apps/
└── example/            # 独立示例应用（Lit + iframe 分栏对比）

mini-three/             # 现阶段保留的历史实现目录（供迁移期复用）
└── src/core/
```

更完整的多包说明见 [monorepo.md](./monorepo.md)。
