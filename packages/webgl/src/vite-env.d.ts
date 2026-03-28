/** 与 Vite 注入的 `import.meta.env` 对齐；库包不直接依赖 `vite/client` 时用此声明通过类型检查 */
interface ImportMetaEnv {
  readonly BASE_URL: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
