import { TokenPair, UserCredentials } from '@/domain/models/token';
import { API_BASE_URL } from '@/shared/config/api';

const AUTH_ENDPOINT = `${API_BASE_URL}/api/v1/auth/token/`;
const REFRESH_ENDPOINT = `${API_BASE_URL}/api/v1/auth/token/refresh/`;

export class AuthDataSource {
  async requestToken(credentials: UserCredentials): Promise<TokenPair> {
    const response = await fetch(AUTH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as
        | { detail?: string }
        | null;
      throw new Error(
        errorPayload?.detail ?? 'No se pudo iniciar sesión. Revisa tus credenciales.'
      );
    }

    return response.json();
  }

  async refreshToken(refresh: string): Promise<TokenPair> {
    const response = await fetch(REFRESH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
      throw new Error('No se pudo refrescar la sesión.');
    }

    const data = (await response.json()) as Partial<TokenPair>;
    return {
      access: data.access ?? '',
      refresh: data.refresh ?? refresh,
    };
  }
}
