interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_GATEWAY_URL?: string;
  readonly VITE_GATEWAY_ONLY?: string;
  readonly VITE_DEV_NOTIFICATIONS_ORIGIN?: string;
  readonly VITE_DEV_TRACKING_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
