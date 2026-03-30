declare global {
  interface Window {
    __DEBUG__: boolean;
    __DEV__: boolean;
    __LOG__: boolean;
  }
  const __DEBUG__: boolean;
  const __DEV__: boolean;
  const __LOG__: boolean;
}

/** `.env` 里为 `VITE_*`，且值为字符串；与 `true` 比较得到 boolean */
window.__DEBUG__ = import.meta.env.VITE_DEBUG === "true";
window.__DEV__ = import.meta.env.DEV;
window.__LOG__ = import.meta.env.VITE_LOG === "true";
export {};
