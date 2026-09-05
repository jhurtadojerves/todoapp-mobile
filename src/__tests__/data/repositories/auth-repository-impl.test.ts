import { AuthRepositoryImpl } from '@/data/repositories/auth-repository-impl';
import { AuthDataSource } from '@/data/datasources/auth-datasource';
import { UserCredentials, TokenPair } from '@/domain/models/token';
import { RegisterCredentials, PasswordValidationResult } from '@/domain/models/register';

const mockDataSource: jest.Mocked<AuthDataSource> = {
  requestToken: jest.fn(),
  refreshToken: jest.fn(),
  register: jest.fn(),
  validatePassword: jest.fn(),
};

describe('AuthRepositoryImpl', () => {
  let repository: AuthRepositoryImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new AuthRepositoryImpl(mockDataSource);
  });

  describe('signIn', () => {
    it('should delegate to dataSource.requestToken', async () => {
      const credentials: UserCredentials = { email: 'user@example.com', password: '123456' };
      const tokenPair: TokenPair = { access: 'access', refresh: 'refresh' };
      mockDataSource.requestToken.mockResolvedValue(tokenPair);

      const result = await repository.signIn(credentials);

      expect(mockDataSource.requestToken).toHaveBeenCalledWith(credentials);
      expect(result).toEqual(tokenPair);
    });
  });

  describe('refreshToken', () => {
    it('should delegate to dataSource.refreshToken', async () => {
      const tokenPair: TokenPair = { access: 'new-access', refresh: 'new-refresh' };
      mockDataSource.refreshToken.mockResolvedValue(tokenPair);

      const result = await repository.refreshToken('old-refresh');

      expect(mockDataSource.refreshToken).toHaveBeenCalledWith('old-refresh');
      expect(result).toEqual(tokenPair);
    });
  });

  describe('register', () => {
    it('should delegate to dataSource.register', async () => {
      const credentials: RegisterCredentials = {
        email: 'new@example.com',
        password: 'pass',
        password2: 'pass',
        first_name: 'A',
        last_name: 'B',
      };
      const tokenPair: TokenPair = { access: 'access', refresh: 'refresh' };
      mockDataSource.register.mockResolvedValue(tokenPair);

      const result = await repository.register(credentials);

      expect(mockDataSource.register).toHaveBeenCalledWith(credentials);
      expect(result).toEqual(tokenPair);
    });
  });

  describe('validatePassword', () => {
    it('should delegate to dataSource.validatePassword', async () => {
      const validationResult: PasswordValidationResult = { is_valid: true, errors: [] };
      mockDataSource.validatePassword.mockResolvedValue(validationResult);

      const result = await repository.validatePassword('StrongPass1!');

      expect(mockDataSource.validatePassword).toHaveBeenCalledWith('StrongPass1!');
      expect(result).toEqual(validationResult);
    });
  });
});
