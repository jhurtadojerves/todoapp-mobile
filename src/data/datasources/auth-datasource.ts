import { PasswordValidationResult, RegisterCredentials } from '@/domain/models/register';
import { TokenPair, UserCredentials } from '@/domain/models/token';
import { API_BASE_URL } from '@/shared/config/api';

const AUTH_ENDPOINT = `${API_BASE_URL}/api/v1/auth/token/`;
const REFRESH_ENDPOINT = `${API_BASE_URL}/api/v1/auth/token/refresh/`;
const REGISTER_ENDPOINT = `${API_BASE_URL}/api/v1/users/register/`;
const VALIDATE_PASSWORD_ENDPOINT = `${API_BASE_URL}/api/v1/auth/password/validate/`;

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

  async register(credentials: RegisterCredentials): Promise<TokenPair> {
    const response = await fetch(REGISTER_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as
        | { detail?: string; email?: string[]; password?: string[] }
        | null;
      
      let errorMessage = 'No se pudo completar el registro.';
      if (errorPayload?.detail) {
        errorMessage = errorPayload.detail;
      } else if (errorPayload?.email) {
        errorMessage = errorPayload.email[0];
      } else if (errorPayload?.password) {
        errorMessage = errorPayload.password[0];
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async validatePassword(password: string): Promise<PasswordValidationResult> {
    const response = await fetch(VALIDATE_PASSWORD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      const result = await response.json();
      const errors = result.password || ['Error al validar la contraseña'];
      return {
        is_valid: false,
        errors: errors,
      };
    }

    return {
      is_valid: true,
      errors: [],
    };
  }
}
