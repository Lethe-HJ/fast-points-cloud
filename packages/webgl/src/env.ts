declare global {
  interface Window {
    __DEBUG__: boolean;
    __DEV__: boolean;
  }
  const __DEBUG__: boolean;
  const __DEV__: boolean;
}

window.__DEBUG__ = import.meta.env.DEV;
window.__DEV__ = import.meta.env.DEV;

export {};
