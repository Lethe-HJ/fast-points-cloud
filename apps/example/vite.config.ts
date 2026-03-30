import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type ESBuildOptions, type Plugin } from "vite";

const root = dirname(fileURLToPath(import.meta.url));

type RollupOutputChunk = {
  type: "chunk";
  facadeModuleId?: string | null;
  fileName: string;
  code: string;
};

/** iframe 的 script 需要打包后的 chunk URL；`new URL("./foo.ts", indexChunk)` 会错成不存在的 `assets/foo.ts` */
function injectExperimentChunkUrlMap(): Plugin {
  return {
    name: "inject-experiment-chunk-url-map",
    apply: "build",
    generateBundle(_options, bundle) {
      const map = buildExperimentChunkUrlMap(bundle);
      const preamble =
        `globalThis.__MINI_THREE_EXP_CHUNK_URLS__=${JSON.stringify(map)};`;
      const chunks: RollupOutputChunk[] = [];
      for (const o of Object.values(bundle)) {
        if (isOutputChunk(o)) chunks.push(o);
      }
      const layoutEntry = chunks.find((c) => {
        const fac = c.facadeModuleId?.replace(/\\/g, "/") ?? "";
        return /(^|\/)layout\.ts$/.test(fac);
      });
      const target =
        layoutEntry ??
        chunks.find((c) => /\/index-[^/]+\.js$/.test(c.fileName));
      if (target) {
        target.code = preamble + target.code;
      }
    },
  };
}

function isOutputChunk(o: unknown): o is RollupOutputChunk {
  return (
    typeof o === "object" &&
    o !== null &&
    (o as RollupOutputChunk).type === "chunk" &&
    typeof (o as RollupOutputChunk).code === "string"
  );
}

function buildExperimentChunkUrlMap(bundle: Record<string, unknown>) {
  const map: Record<string, Record<string, string>> = {};
  for (const output of Object.values(bundle)) {
    if (!isOutputChunk(output) || !output.facadeModuleId) continue;
    const id = output.facadeModuleId.replace(/\\/g, "/");
    const m = id.match(/\/(demo\d+)\/([^/]+\.ts)$/);
    if (!m || m[2] === "index.ts") continue;
    const demo = m[1];
    const key = `./${m[2]}`;
    if (!map[demo]) map[demo] = {};
    map[demo][key] = "/" + output.fileName;
  }
  return map;
}

export default defineConfig(({ mode }) => ({
  /** 与 `.env` 放在 `src/` 下一致，否则默认只从 `apps/example/` 根目录加载 */
  envDir: resolve(root, "src"),
  plugins: [injectExperimentChunkUrlMap()],
  esbuild: {
    legalComments: "none",
    ...(mode === "production" ? { drop: ["console", "debugger"] } : {}),
  } as ESBuildOptions,
  build: {
    /** 与 tsconfig 一致，避免多余转译与 helper */
    target: "es2022",
    /** Vite 8 默认；显式写出便于后续对比 terser 等 */
    minify: "oxc",
    cssMinify: "lightningcss",
    /** 现代浏览器不需要 modulepreload polyfill，可省一截脚本 */
    modulePreload: { polyfill: false },
    /** 不把小于 4KB 的资源打进 JS（base64），避免主包膨胀 */
    assetsInlineLimit: 0,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 2000,
  },
}));
