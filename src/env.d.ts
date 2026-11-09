/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SANITY_PROJECT_ID?: string;
  readonly PUBLIC_SANITY_DATASET?: string;
  /** GA4 measurement ID, e.g. G-XXXXXXXX. Banner still ships if empty; GA4 load is gated. */
  readonly PUBLIC_GA4_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  dataLayer: unknown[];
  gtag: (...args: unknown[]) => void;
  __THI_GA4_ID?: string;
  __THI_openCookiePrefs?: () => void;
  __THI_ga4Loaded?: boolean;
}
