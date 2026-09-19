import Constants from 'expo-constants';

const legacyExtraBaseUrl = (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)
  ?.apiBaseUrl;

/**
 * Base URL for the backend, resolved per environment. `EXPO_PUBLIC_*` vars
 * are inlined at build time from `.env` (development) / `.env.production`
 * (production, loaded when NODE_ENV=production, as EAS Build does for
 * preview and production profiles) — see those files for how to point a
 * build at a different backend.
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? legacyExtraBaseUrl ?? 'http://localhost:8080';

/** Explicit request timeout, in ms. `fetch` has no default timeout on its own. */
export const API_TIMEOUT_MS = Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS ?? 15000);

if (!__DEV__ && !API_BASE_URL.startsWith('https://')) {
  throw new Error(
    `Configuración insegura: un build de producción debe apuntar a un backend HTTPS, pero API_BASE_URL es "${API_BASE_URL}".`
  );
}
