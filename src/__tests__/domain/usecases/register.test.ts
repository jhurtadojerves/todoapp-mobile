import { RegisterUseCase } from '@/domain/usecases/register';
import { AuthRepository } from '@/domain/repositories/auth-repository';
import { RegisterCredentials } from '@/domain/models/register';
import { TokenPair } from '@/domain/models/token';

const mockAuthRepository: jest.Mocked<AuthRepository> = {
  signIn: jest.fn(),
  refreshToken: jest.fn(),
  register: jest.fn(),
  validatePassword: jest.fn(),
};

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RegisterUseCase(mockAuthRepository);
  });

  it('should call authRepository.register with the given credentials', async () => {
    const credentials: RegisterCredentials = {
      email: 'new@example.com',
      password: 'StrongPass1!',
      password2: 'StrongPass1!',
      first_name: 'John',
      last_name: 'Doe',
    };
    const tokenPair: TokenPair = { access: 'access-token', refresh: 'refresh-token' };
    mockAuthRepository.register.mockResolvedValue(tokenPair);

    await useCase.execute(credentials);

    expect(mockAuthRepository.register).toHaveBeenCalledTimes(1);
    expect(mockAuthRepository.register).toHaveBeenCalledWith(credentials);
  });

  it('should return the TokenPair on successful registration', async () => {
    const credentials: RegisterCredentials = {
      email: 'new@example.com',
      password: 'StrongPass1!',
      password2: 'StrongPass1!',
      first_name: 'Jane',
      last_name: 'Doe',
    };
    const tokenPair: TokenPair = { access: 'access-token', refresh: 'refresh-token' };
    mockAuthRepository.register.mockResolvedValue(tokenPair);

    const result = await useCase.execute(credentials);

    expect(result).toEqual(tokenPair);
  });

  it('should propagate errors thrown by the repository', async () => {
    const credentials: RegisterCredentials = {
      email: 'duplicate@example.com',
      password: 'pass',
      password2: 'pass',
      first_name: 'A',
      last_name: 'B',
    };
    mockAuthRepository.register.mockRejectedValue(new Error('Email already in use'));

    await expect(useCase.execute(credentials)).rejects.toThrow('Email already in use');
  });
});
