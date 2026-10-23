/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional custom TikWM-compatible endpoint (for a self-hosted proxy). */
  readonly VITE_TIKWM_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
