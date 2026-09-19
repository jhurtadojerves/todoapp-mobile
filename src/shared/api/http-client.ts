import { create, isAxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type { ZodType } from 'zod';

import { API_BASE_URL, API_TIMEOUT_MS } from '@/shared/config/api';
import { storage } from '@/shared/utils/storage';
import { deepKeysToCamel, deepKeysToSnake } from '@/shared/utils/case-convert';

/** Client/auth error: the server responded with a 4xx and a parsed body. */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/** The server responded, but with a 5xx (or an unparseable "success") — a server-side failure. */
export class ServerError extends Error {
  readonly status: number;

  constructor(status: number) {
    super('El servidor tuvo un problema. Intentá de nuevo en unos minutos.');
    this.name = 'ServerError';
    this.status = status;
  }
}

/** The request never reached a server: offline, DNS failure, connection refused, CORS, etc. */
export class NetworkError extends Error {
  constructor() {
    super('No hay conexión con el servidor. Revisa tu conexión a internet e intenta de nuevo.');
    this.name = 'NetworkError';
  }
}

/** The request was aborted because it exceeded the configured timeout. */
export class TimeoutError extends Error {
  constructor() {
    super('La solicitud tardó demasiado en responder. Intenta de nuevo.');
    this.name = 'TimeoutError';
  }
}

type AuthHooks = {
  /** Attempts to refresh the access token; returns the new token, or null if the refresh itself failed. */
  refreshAccessToken: () => Promise<string | null>;
  /** Called once a request is confirmed unauthorized even after every refresh attempt was exhausted. */
  onUnauthorized: () => void;
  /** Max refresh-and-retry attempts for a single request on repeated 401s. Defaults to 1. */
  maxRefreshRetries?: number;
};

let authHooks: AuthHooks | null = null;

export function registerAuthHooks(hooks: AuthHooks | null): void {
  authHooks = hooks;
}

// `authenticated` isn't sent over the wire — axios just carries it alongside
// the rest of a request's config so the interceptors below (and the retry
// loop in `requestWithAuthRetry`) know whether to attach a Bearer token and
// react to a 401 at all.
declare module 'axios' {
  interface AxiosRequestConfig {
    authenticated?: boolean;
  }
}

/**
 * The app's single axios instance. Talks to `API_BASE_URL`, enforces
 * `API_TIMEOUT_MS`, and — via the interceptors below — converts request/response
 * bodies between the app's camelCase domain shape and the backend's snake_case
 * wire format, and attaches the Bearer token for authenticated calls.
 */
export const apiClient = create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
});

apiClient.interceptors.request.use(async (config) => {
  if (config.data !== undefined) {
    config.data = deepKeysToSnake(config.data);
  }
  if (config.authenticated ?? true) {
    const token = await storage.getItem('accessToken');
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
  }
  return config;
});

apiClient.interceptors.response.use((response) => {
  if (response.status !== 204) {
    response.data = deepKeysToCamel(response.data);
  }
  return response;
});

function defaultMessageFor(status: number): string {
  switch (status) {
    case 401:
      return 'Tu sesión expiró. Iniciá sesión de nuevo.';
    case 403:
      return 'No tenés permiso para realizar esta acción.';
    case 404:
      return 'No existe o no tenés acceso a este recurso.';
    case 429:
      return 'Hiciste demasiadas solicitudes. Probá de nuevo en unos minutos.';
    default:
      return 'Ocurrió un error inesperado. Intentá de nuevo.';
  }
}

function parseErrorBody(
  rawPayload: unknown,
  status: number
): { message: string; fieldErrors?: Record<string, string[]> } {
  const payload =
    rawPayload && typeof rawPayload === 'object'
      ? (deepKeysToCamel(rawPayload) as Record<string, unknown>)
      : null;
  if (!payload) {
    return { message: defaultMessageFor(status) };
  }

  if (typeof payload.detail === 'string') {
    return { message: payload.detail };
  }

  const fieldErrors: Record<string, string[]> = {};
  let firstMessage: string | null = null;
  for (const [field, value] of Object.entries(payload)) {
    if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
      fieldErrors[field] = value as string[];
      firstMessage = firstMessage ?? (value[0] as string);
    }
  }

  if (firstMessage) {
    return { message: firstMessage, fieldErrors };
  }

  return { message: defaultMessageFor(status) };
}

/**
 * Sends the request and, on a 401 for an authenticated call, refreshes the
 * token and retries — up to `authHooks.maxRefreshRetries` times (default 1)
 * if the retry keeps coming back 401. `config` is mutated in place (via
 * `__refreshAttempt`) so the attempt count survives across recursive calls.
 */
async function requestWithAuthRetry(
  config: AxiosRequestConfig & { __refreshAttempt?: number }
): Promise<AxiosResponse> {
  try {
    return await apiClient.request(config);
  } catch (error) {
    if (!isAxiosError(error) || !error.response) {
      throw error;
    }

    const authenticated = config.authenticated ?? true;
    if (error.response.status === 401 && authenticated) {
      if (authHooks) {
        const attempt = config.__refreshAttempt ?? 0;
        const maxRetries = authHooks.maxRefreshRetries ?? 1;
        if (attempt < maxRetries) {
          const newToken = await authHooks.refreshAccessToken();
          if (newToken) {
            config.__refreshAttempt = attempt + 1;
            return requestWithAuthRetry(config);
          }
        }
        authHooks.onUnauthorized();
      }
    }

    throw error;
  }
}

function translateError(error: unknown): Error {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error : new Error(String(error));
  }
  if (!error.response) {
    return error.code === 'ECONNABORTED' ? new TimeoutError() : new NetworkError();
  }

  const { status, data } = error.response;
  if (status >= 500) {
    return new ServerError(status);
  }
  const { message, fieldErrors } = parseErrorBody(data, status);
  return new ApiError(message, status, fieldErrors);
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Whether this call needs a Bearer token. Defaults to true — set false for endpoints that don't require auth (login, register, refresh). */
  authenticated?: boolean;
};

type ApiFetchOptions<T> = RequestOptions & {
  /**
   * Validates & narrows the parsed response body against the domain model's
   * generated schema. A body that doesn't match — a contract drift the
   * OpenAPI types can't catch at compile time — is treated as a ServerError
   * rather than handed to the caller unchecked.
   */
  schema?: ZodType<T>;
};

/**
 * Centralized fetch wrapper — thin sugar over the app's single axios
 * instance (`apiClient`). Translates every failure into one of four
 * domain-facing families:
 *  - NetworkError:  the request never reached a server (offline, DNS, CORS).
 *  - TimeoutError:  the server didn't respond within API_TIMEOUT_MS.
 *  - ServerError:   the server responded but failed (5xx, or a malformed
 *                    "success" body it couldn't have meant to send).
 *  - ApiError:      the server rejected the request (4xx), with the DRF
 *                    error body ({"campo": [...]} on 400, {"detail": "..."}
 *                    on 401/403/404/429) parsed into a message + fieldErrors.
 * On a 401 for an authenticated request, it also tries a token refresh +
 * retry (via `requestWithAuthRetry`) before giving up and notifying
 * onUnauthorized. When a `schema` is given, the response body is parsed &
 * validated through it — a mismatch is itself a ServerError.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions<T> = {}
): Promise<T> {
  const { method = 'GET', body, authenticated = true } = options;

  let response;
  try {
    response = await requestWithAuthRetry({ url: path, method, data: body, authenticated });
  } catch (error) {
    throw translateError(error);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!options.schema) {
    return response.data as T;
  }

  const result = options.schema.safeParse(response.data);
  if (!result.success) {
    if (__DEV__) {
      console.warn(`[apiFetch] response from ${path} failed schema validation`, result.error.issues);
    }
    throw new ServerError(response.status);
  }
  return result.data;
}
