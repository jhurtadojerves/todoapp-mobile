import { AuthDataSource } from '@/data/datasources/auth-datasource';
import { UserCredentials, TokenPair } from '@/domain/models/token';
import { RegisterCredentials, RegisteredUser } from '@/domain/models/register';

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}
describe('AuthDataSource', () => {
  let dataSource: AuthDataSource;

  beforeEach(() => {
    jest.clearAllMocks();
    dataSource = new AuthDataSource();
  });

  // ── requestToken ──────────────────────────────────────────────────────────

  describe('requestToken', () => {
    const credentials: UserCredentials = { email: 'user@example.com', password: '123456' };
    const tokenPair: TokenPair = { access: 'access-token', refresh: 'refresh-token' };

    it('should return a TokenPair on success', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, tokenPair));

      const result = await dataSource.requestToken(credentials);

      expect(result).toEqual(tokenPair);
    });

    it('should send a POST request with JSON credentials', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, tokenPair));

      await dataSource.requestToken(credentials);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/token/'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        })
      );
    });

    it('should throw with server detail message on 401', async () => {
      mockFetch.mockResolvedValue(mockResponse(401, { detail: 'No active account found.' }));

      await expect(dataSource.requestToken(credentials)).rejects.toThrow('No active account found.');
    });

    it('should throw a default message when no detail is provided', async () => {
      mockFetch.mockResolvedValue(mockResponse(400, {}));

      await expect(dataSource.requestToken(credentials)).rejects.toThrow(
        'No se pudo iniciar sesión. Revisa tus credenciales.'
      );
    });
  });

  // ── refreshToken ──────────────────────────────────────────────────────────

  describe('refreshToken', () => {
    it('should return a new TokenPair on success', async () => {
      const refreshToken = 'old-refresh';
      const newTokenPair: TokenPair = { access: 'new-access', refresh: 'new-refresh' };
      mockFetch.mockResolvedValue(mockResponse(200, newTokenPair));

      const result = await dataSource.refreshToken(refreshToken);

      expect(result).toEqual(newTokenPair);
    });

    it('should keep the original refresh token when the response omits it', async () => {
      const refreshToken = 'old-refresh';
      mockFetch.mockResolvedValue(mockResponse(200, { access: 'new-access' }));

      const result = await dataSource.refreshToken(refreshToken);

      expect(result.access).toBe('new-access');
      expect(result.refresh).toBe(refreshToken);
    });

    it('should throw when the refresh request fails', async () => {
      mockFetch.mockResolvedValue(mockResponse(401, {}));

      await expect(dataSource.refreshToken('bad-token')).rejects.toThrow(
        'No se pudo refrescar la sesión.'
      );
    });
  });

  // ── register ──────────────────────────────────────────────────────────────

  describe('register', () => {
    const credentials: RegisterCredentials = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'StrongPass1!',
      password2: 'StrongPass1!',
      first_name: 'John',
      last_name: 'Doe',
    };
    const registeredUser: RegisteredUser = {
      username: 'newuser',
      email: 'new@example.com',
      first_name: 'John',
      last_name: 'Doe',
    };

    it('should return the created user on successful registration', async () => {
      mockFetch.mockResolvedValue(mockResponse(201, registeredUser));

      const result = await dataSource.register(credentials);

      expect(result).toEqual(registeredUser);
    });

    it('should not send password2 in the request body', async () => {
      mockFetch.mockResolvedValue(mockResponse(201, registeredUser));

      await dataSource.register(credentials);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/register/'),
        expect.objectContaining({
          body: JSON.stringify({
            username: 'newuser',
            email: 'new@example.com',
            password: 'StrongPass1!',
            first_name: 'John',
            last_name: 'Doe',
          }),
        })
      );
    });

    it('should throw with the username field error when present', async () => {
      mockFetch.mockResolvedValue(
        mockResponse(400, { username: ['A user with that username already exists.'] })
      );

      await expect(dataSource.register(credentials)).rejects.toThrow(
        'A user with that username already exists.'
      );
    });

    it('should throw with detail message on error', async () => {
      mockFetch.mockResolvedValue(mockResponse(400, { detail: 'User already exists.' }));

      await expect(dataSource.register(credentials)).rejects.toThrow('User already exists.');
    });

    it('should throw with email error message when present', async () => {
      mockFetch.mockResolvedValue(
        mockResponse(400, { email: ['A user with that email already exists.'] })
      );

      await expect(dataSource.register(credentials)).rejects.toThrow(
        'A user with that email already exists.'
      );
    });

    it('should throw with password error message when present', async () => {
      mockFetch.mockResolvedValue(
        mockResponse(400, { password: ['This password is too short.'] })
      );

      await expect(dataSource.register(credentials)).rejects.toThrow(
        'This password is too short.'
      );
    });

    it('should throw a default message when no specific error is provided', async () => {
      mockFetch.mockResolvedValue(mockResponse(500, {}));

      await expect(dataSource.register(credentials)).rejects.toThrow(
        'No se pudo completar el registro.'
      );
    });
  });

  // ── validatePassword ──────────────────────────────────────────────────────

  describe('validatePassword', () => {
    it('should return is_valid true on a 200 response', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, {}));

      const result = await dataSource.validatePassword('StrongPass1!');

      expect(result.is_valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return is_valid false with password errors on a non-200 response', async () => {
      mockFetch.mockResolvedValue(
        mockResponse(400, { password: ['Password is too common.'] })
      );

      const result = await dataSource.validatePassword('password');

      expect(result.is_valid).toBe(false);
      expect(result.errors).toEqual(['Password is too common.']);
    });

    it('should return a default error message when no password errors are provided', async () => {
      mockFetch.mockResolvedValue(mockResponse(400, {}));

      const result = await dataSource.validatePassword('password');

      expect(result.is_valid).toBe(false);
      expect(result.errors).toEqual(['Error al validar la contraseña']);
    });
  });
});
