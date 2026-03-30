import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type ESBuildOptions } from "vite";
import dts from "vite-plugin-dts";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
  plugins: [
    dts({
      root,
      /** 避免 monorepo 下 d.ts 落到 dist/webgl/src/... */
      entryRoot: resolve(root, "src"),
      insertTypesEntry: true,
    }),
  ],
  esbuild: {
    legalComments: "none",
    ...(mode === "production" ? { drop: ["console", "debugger"] } : {}),
  } as ESBuildOptions,
  build: {
    target: "es2022",
    minify: "oxc",
    cssMinify: "lightningcss",
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 2000,
    emptyOutDir: true,
    lib: {
      entry: resolve(root, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [
        "@mini-three/types",
        /^@plutotcool\/glsl-bundler(\/.*)?$/,
      ],
    },
  },
}));
