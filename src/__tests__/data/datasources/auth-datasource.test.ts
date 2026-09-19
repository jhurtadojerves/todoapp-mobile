import MockAdapter from 'axios-mock-adapter';

import { AuthDataSource } from '@/data/datasources/auth-datasource';
import { UserCredentials, TokenPair } from '@/domain/models/token';
import { RegisterCredentials, RegisteredUser } from '@/domain/models/register';
import { apiClient } from '@/shared/api/http-client';

const apiMock = new MockAdapter(apiClient);

describe('AuthDataSource', () => {
  let dataSource: AuthDataSource;

  beforeEach(() => {
    apiMock.reset();
    dataSource = new AuthDataSource();
  });

  // ── requestToken ──────────────────────────────────────────────────────────

  describe('requestToken', () => {
    const credentials: UserCredentials = { email: 'user@example.com', password: '123456' };
    const tokenPair: TokenPair = { access: 'access-token', refresh: 'refresh-token' };

    it('should return a TokenPair on success', async () => {
      apiMock.onAny().reply(200, tokenPair);

      const result = await dataSource.requestToken(credentials);

      expect(result).toEqual(tokenPair);
    });

    it('should send a POST request with JSON credentials', async () => {
      apiMock.onAny().reply(200, tokenPair);

      await dataSource.requestToken(credentials);

      const request = apiMock.history.post[0];
      expect(request.url).toContain('/auth/token/');
      expect(request.headers?.['Content-Type']).toContain('application/json');
      expect(request.data).toBe(JSON.stringify(credentials));
    });

    it('should throw with server detail message on 401', async () => {
      apiMock.onAny().reply(401, { detail: 'No active account found.' });

      await expect(dataSource.requestToken(credentials)).rejects.toThrow('No active account found.');
    });

    it('should throw a default message when no detail is provided', async () => {
      apiMock.onAny().reply(400, {});

      await expect(dataSource.requestToken(credentials)).rejects.toThrow(
        'Ocurrió un error inesperado. Intentá de nuevo.'
      );
    });
  });

  // ── refreshToken ──────────────────────────────────────────────────────────

  describe('refreshToken', () => {
    it('should return a new TokenPair on success', async () => {
      const refreshToken = 'old-refresh';
      const newTokenPair: TokenPair = { access: 'new-access', refresh: 'new-refresh' };
      apiMock.onAny().reply(200, newTokenPair);

      const result = await dataSource.refreshToken(refreshToken);

      expect(result).toEqual(newTokenPair);
    });

    it('should keep the original refresh token when the response omits it', async () => {
      const refreshToken = 'old-refresh';
      apiMock.onAny().reply(200, { access: 'new-access' });

      const result = await dataSource.refreshToken(refreshToken);

      expect(result.access).toBe('new-access');
      expect(result.refresh).toBe(refreshToken);
    });

    it('should throw when the refresh request fails', async () => {
      apiMock.onAny().reply(401, {});

      await expect(dataSource.refreshToken('bad-token')).rejects.toThrow(
        'Tu sesión expiró. Iniciá sesión de nuevo.'
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
      firstName: 'John',
      lastName: 'Doe',
    };
    const registeredUser: RegisteredUser = {
      username: 'newuser',
      email: 'new@example.com',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should return the created user on successful registration', async () => {
      apiMock.onAny().reply(201, registeredUser);

      const result = await dataSource.register(credentials);

      expect(result).toEqual(registeredUser);
    });

    it('should not send password2 in the request body', async () => {
      apiMock.onAny().reply(201, registeredUser);

      await dataSource.register(credentials);

      expect(apiMock.history.post[0].url).toContain('/users/register/');
      expect(apiMock.history.post[0].data).toBe(
        JSON.stringify({
          username: 'newuser',
          email: 'new@example.com',
          password: 'StrongPass1!',
          first_name: 'John',
          last_name: 'Doe',
        })
      );
    });

    it('should throw with the username field error when present', async () => {
      apiMock.onAny().reply(400, { username: ['A user with that username already exists.'] });

      await expect(dataSource.register(credentials)).rejects.toThrow(
        'A user with that username already exists.'
      );
    });

    it('should throw with detail message on error', async () => {
      apiMock.onAny().reply(400, { detail: 'User already exists.' });

      await expect(dataSource.register(credentials)).rejects.toThrow('User already exists.');
    });

    it('should throw with email error message when present', async () => {
      apiMock.onAny().reply(400, { email: ['A user with that email already exists.'] });

      await expect(dataSource.register(credentials)).rejects.toThrow(
        'A user with that email already exists.'
      );
    });

    it('should throw with password error message when present', async () => {
      apiMock.onAny().reply(400, { password: ['This password is too short.'] });

      await expect(dataSource.register(credentials)).rejects.toThrow('This password is too short.');
    });

    it('should throw a default message when no specific error is provided', async () => {
      apiMock.onAny().reply(500, {});

      await expect(dataSource.register(credentials)).rejects.toThrow(
        'El servidor tuvo un problema. Intentá de nuevo en unos minutos.'
      );
    });
  });

  // ── validatePassword ──────────────────────────────────────────────────────

  describe('validatePassword', () => {
    it('should return isValid true on a 200 response', async () => {
      apiMock.onAny().reply(200, {});

      const result = await dataSource.validatePassword('StrongPass1!');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return isValid false with password errors on a non-200 response', async () => {
      apiMock.onAny().reply(400, { password: ['Password is too common.'] });

      const result = await dataSource.validatePassword('password');

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(['Password is too common.']);
    });

    it('should return a default error message when no password errors are provided', async () => {
      apiMock.onAny().reply(400, {});

      const result = await dataSource.validatePassword('password');

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(['Error al validar la contraseña']);
    });
  });
});
