export {};

declare module "axios" {
  interface AxiosRequestConfig {
    /** When true, the 401 handler will not try to refresh the access token. */
    skipAuthRefresh?: boolean;
  }
}
