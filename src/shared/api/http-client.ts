import { API_BASE_URL } from '@/shared/config/api';

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

type AuthHooks = {
  /** Attempts to refresh the access token; returns the new token, or null if the refresh itself failed. */
  refreshAccessToken: () => Promise<string | null>;
  /** Called once a request is confirmed unauthorized even after a refresh attempt. */
  onUnauthorized: () => void;
};

let authHooks: AuthHooks | null = null;

export function registerAuthHooks(hooks: AuthHooks | null): void {
  authHooks = hooks;
}

type ApiFetchOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Access token for this request. Omit for endpoints that don't require auth (login, register, refresh). */
  token?: string;
};

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

async function parseErrorBody(
  response: Response
): Promise<{ message: string; fieldErrors?: Record<string, string[]> }> {
  const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!payload) {
    return { message: defaultMessageFor(response.status) };
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

  return { message: defaultMessageFor(response.status) };
}

function performRequest(path: string, options: ApiFetchOptions): Promise<Response> {
  const { method = 'GET', body, token } = options;
  const headers: Record<string, string> = {};
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/**
 * Centralized fetch wrapper: attaches the Bearer token, parses DRF error
 * shapes consistently ({"campo": [...]} on 400, {"detail": "..."} on
 * 401/403/404/429), and on a 401 tries a single token refresh + retry
 * before giving up and notifying onUnauthorized.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  let response = await performRequest(path, options);

  if (response.status === 401 && options.token && authHooks) {
    const newToken = await authHooks.refreshAccessToken();
    if (newToken) {
      response = await performRequest(path, { ...options, token: newToken });
    }
  }

  if (!response.ok) {
    if (response.status === 401 && options.token) {
      authHooks?.onUnauthorized();
    }
    const { message, fieldErrors } = await parseErrorBody(response);
    throw new ApiError(message, response.status, fieldErrors);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
