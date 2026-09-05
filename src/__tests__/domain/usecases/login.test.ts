import { LoginUseCase } from '@/domain/usecases/login';
import { AuthRepository } from '@/domain/repositories/auth-repository';
import { TokenPair, UserCredentials } from '@/domain/models/token';

const mockAuthRepository: jest.Mocked<AuthRepository> = {
  signIn: jest.fn(),
  refreshToken: jest.fn(),
  register: jest.fn(),
  validatePassword: jest.fn(),
};

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new LoginUseCase(mockAuthRepository);
  });

  it('should call authRepository.signIn with the given credentials', async () => {
    const credentials: UserCredentials = { email: 'user@example.com', password: '123456' };
    const tokenPair: TokenPair = { access: 'access-token', refresh: 'refresh-token' };
    mockAuthRepository.signIn.mockResolvedValue(tokenPair);

    await useCase.execute(credentials);

    expect(mockAuthRepository.signIn).toHaveBeenCalledTimes(1);
    expect(mockAuthRepository.signIn).toHaveBeenCalledWith(credentials);
  });

  it('should return the TokenPair from the repository', async () => {
    const credentials: UserCredentials = { email: 'user@example.com', password: '123456' };
    const tokenPair: TokenPair = { access: 'access-token', refresh: 'refresh-token' };
    mockAuthRepository.signIn.mockResolvedValue(tokenPair);

    const result = await useCase.execute(credentials);

    expect(result).toEqual(tokenPair);
  });

  it('should propagate errors thrown by the repository', async () => {
    const credentials: UserCredentials = { email: 'wrong@example.com', password: 'wrong' };
    mockAuthRepository.signIn.mockRejectedValue(new Error('Invalid credentials'));

    await expect(useCase.execute(credentials)).rejects.toThrow('Invalid credentials');
  });
});
