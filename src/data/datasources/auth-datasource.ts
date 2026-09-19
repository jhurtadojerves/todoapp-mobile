import { isAxiosError } from 'axios';

import { PasswordValidationResult, RegisterCredentials, RegisteredUser, registeredUserSchema } from '@/domain/models/register';
import { TokenPair, UserCredentials, tokenPairSchema } from '@/domain/models/token';
import { apiClient, apiFetch } from '@/shared/api/http-client';

const VALIDATE_PASSWORD_PATH = '/api/v1/auth/password/validate/';

export class AuthDataSource {
  requestToken(credentials: UserCredentials): Promise<TokenPair> {
    return apiFetch('/api/v1/auth/token/', {
      method: 'POST',
      body: credentials,
      schema: tokenPairSchema,
      authenticated: false,
    });
  }

  // The refresh endpoint may omit `refresh` from its body (rotation is
  // disabled server-side), so this deliberately stays on a Partial<TokenPair>
  // shape without schema validation rather than tokenPairSchema, which would
  // reject that (valid) response as malformed.
  async refreshToken(refresh: string): Promise<TokenPair> {
    const data = await apiFetch<Partial<TokenPair>>('/api/v1/auth/token/refresh/', {
      method: 'POST',
      body: { refresh },
      authenticated: false,
    });
    return {
      access: data.access ?? '',
      refresh: data.refresh ?? refresh,
    };
  }

  register(credentials: RegisterCredentials): Promise<RegisteredUser> {
    const { username, email, password, firstName, lastName } = credentials;
    return apiFetch('/api/v1/users/register/', {
      method: 'POST',
      body: { username, email, password, firstName, lastName },
      schema: registeredUserSchema,
      authenticated: false,
    });
  }

  // Reports validation results rather than throwing, so it stays on the raw
  // apiClient instead of apiFetch's throw-on-error contract.
  async validatePassword(password: string): Promise<PasswordValidationResult> {
    try {
      await apiClient.post(VALIDATE_PASSWORD_PATH, { password }, { authenticated: false });
      return { isValid: true, errors: [] };
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        const errors = (error.response.data as { password?: string[] })?.password ?? [
          'Error al validar la contraseña',
        ];
        return { isValid: false, errors };
      }
      throw error;
    }
  }
}
