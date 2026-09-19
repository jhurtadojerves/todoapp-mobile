/**
 * Integration tests: LoginUseCase → AuthRepositoryImpl → AuthDataSource
 * Only `fetch` is mocked (the real external boundary).
 */
import MockAdapter from 'axios-mock-adapter';

import { AuthDataSource } from '@/data/datasources/auth-datasource';
import { AuthRepositoryImpl } from '@/data/repositories/auth-repository-impl';
import { LoginUseCase } from '@/domain/usecases/login';
import { RegisterUseCase } from '@/domain/usecases/register';
import { ValidatePasswordUseCase } from '@/domain/usecases/validate-password';
import { apiClient } from '@/shared/api/http-client';

const apiMock = new MockAdapter(apiClient);

function buildDependencies() {
  const dataSource = new AuthDataSource();
  const repository = new AuthRepositoryImpl(dataSource);
  return {
    loginUseCase: new LoginUseCase(repository),
    registerUseCase: new RegisterUseCase(repository),
    validatePasswordUseCase: new ValidatePasswordUseCase(repository),
  };
}

describe('Auth flow (integration)', () => {
  beforeEach(() => {
    apiMock.reset();
    jest.clearAllMocks();
  });

  describe('Login', () => {
    it('should return a TokenPair when credentials are valid', async () => {
      const { loginUseCase } = buildDependencies();
      apiMock.onAny().reply(200, { access: 'access-token', refresh: 'refresh-token' });

      const result = await loginUseCase.execute({
        email: 'user@example.com',
        password: 'correctpass',
      });

      expect(result).toEqual({ access: 'access-token', refresh: 'refresh-token' });
    });

    it('should throw the server error message when credentials are invalid', async () => {
      const { loginUseCase } = buildDependencies();
      apiMock.onAny().reply(401, { detail: 'No active account found with the given credentials.' });

      await expect(
        loginUseCase.execute({ email: 'user@example.com', password: 'wrong' })
      ).rejects.toThrow('No active account found with the given credentials.');
    });
  });

  describe('Register + ValidatePassword', () => {
    it('should validate password and then register successfully', async () => {
      const { validatePasswordUseCase, registerUseCase } = buildDependencies();

      // Step 1: validate password
      apiMock.onAny().replyOnce(200, {});
      const validation = await validatePasswordUseCase.execute('StrongPass1!');
      expect(validation.isValid).toBe(true);

      // Step 2: register with valid credentials
      apiMock
        .onAny()
        .replyOnce(201, { username: 'johndoe', email: 'new@example.com', firstName: 'John', lastName: 'Doe' });
      const registeredUser = await registerUseCase.execute({
        username: 'johndoe',
        email: 'new@example.com',
        password: 'StrongPass1!',
        password2: 'StrongPass1!',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(registeredUser).toEqual({
        username: 'johndoe',
        email: 'new@example.com',
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(apiMock.history.post).toHaveLength(2);
    });

    it('should report weak password errors before attempting registration', async () => {
      const { validatePasswordUseCase } = buildDependencies();
      apiMock.onAny().reply(400, { password: ['This password is too short.', 'This password is too common.'] });

      const validation = await validatePasswordUseCase.execute('abc');

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('This password is too short.');
      // Registration should never be called
      expect(apiMock.history.post).toHaveLength(1);
    });
  });
});
