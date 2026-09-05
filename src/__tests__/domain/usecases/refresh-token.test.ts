import { RefreshTokenUseCase } from '@/domain/usecases/refresh-token';
import { AuthRepository } from '@/domain/repositories/auth-repository';
import { TokenPair } from '@/domain/models/token';

const mockAuthRepository: jest.Mocked<AuthRepository> = {
  signIn: jest.fn(),
  refreshToken: jest.fn(),
  register: jest.fn(),
  validatePassword: jest.fn(),
};

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RefreshTokenUseCase(mockAuthRepository);
  });

  it('should call authRepository.refreshToken with the given refresh token', async () => {
    const refreshToken = 'old-refresh-token';
    const tokenPair: TokenPair = { access: 'new-access', refresh: 'new-refresh' };
    mockAuthRepository.refreshToken.mockResolvedValue(tokenPair);

    await useCase.execute(refreshToken);

    expect(mockAuthRepository.refreshToken).toHaveBeenCalledTimes(1);
    expect(mockAuthRepository.refreshToken).toHaveBeenCalledWith(refreshToken);
  });

  it('should return a new TokenPair', async () => {
    const tokenPair: TokenPair = { access: 'new-access', refresh: 'new-refresh' };
    mockAuthRepository.refreshToken.mockResolvedValue(tokenPair);

    const result = await useCase.execute('old-refresh-token');

    expect(result).toEqual(tokenPair);
  });

  it('should propagate errors when the session cannot be refreshed', async () => {
    mockAuthRepository.refreshToken.mockRejectedValue(new Error('Could not refresh the session.'));

    await expect(useCase.execute('expired-token')).rejects.toThrow('Could not refresh the session.');
  });
});
