// src/utils/loading-bar.ts
import { useLoadingBar } from 'naive-ui';

let loadingBar: ReturnType<typeof useLoadingBar>;

export const setLoadingBarInstance = (instance: ReturnType<typeof useLoadingBar>) => {
  loadingBar = instance;
};

export const getLoadingBarInstance = () => {
  if (!loadingBar) {
    console.warn('Loading bar instance has not been set yet.');
  }
  return loadingBar;
};
