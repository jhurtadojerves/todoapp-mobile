import { PasswordValidationResult, RegisterCredentials, RegisteredUser } from '@/domain/models/register';
import { TokenPair, UserCredentials } from '@/domain/models/token';
import { API_BASE_URL } from '@/shared/config/api';
import { apiFetch } from '@/shared/api/http-client';

const VALIDATE_PASSWORD_ENDPOINT = `${API_BASE_URL}/api/v1/auth/password/validate/`;

export class AuthDataSource {
  requestToken(credentials: UserCredentials): Promise<TokenPair> {
    return apiFetch<TokenPair>('/api/v1/auth/token/', { method: 'POST', body: credentials });
  }

  async refreshToken(refresh: string): Promise<TokenPair> {
    const data = await apiFetch<Partial<TokenPair>>('/api/v1/auth/token/refresh/', {
      method: 'POST',
      body: { refresh },
    });
    return {
      access: data.access ?? '',
      refresh: data.refresh ?? refresh,
    };
  }

  register(credentials: RegisterCredentials): Promise<RegisteredUser> {
    const { username, email, password, first_name, last_name } = credentials;
    return apiFetch<RegisteredUser>('/api/v1/users/register/', {
      method: 'POST',
      body: { username, email, password, first_name, last_name },
    });
  }

  // Reports validation results rather than throwing, so it stays on raw fetch
  // instead of apiFetch's throw-on-error contract.
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
