import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: resolve(__dirname, "example"),
  resolve: {
    alias: {
      "points-cloud-engine": resolve(__dirname, "src/core/index.ts"),
    },
  },
});
