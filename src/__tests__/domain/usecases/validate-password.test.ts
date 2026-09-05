import { ValidatePasswordUseCase } from '@/domain/usecases/validate-password';
import { AuthRepository } from '@/domain/repositories/auth-repository';
import { PasswordValidationResult } from '@/domain/models/register';

const mockAuthRepository: jest.Mocked<AuthRepository> = {
  signIn: jest.fn(),
  refreshToken: jest.fn(),
  register: jest.fn(),
  validatePassword: jest.fn(),
};

describe('ValidatePasswordUseCase', () => {
  let useCase: ValidatePasswordUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ValidatePasswordUseCase(mockAuthRepository);
  });

  it('should call authRepository.validatePassword with the given password', async () => {
    const password = 'StrongPass1!';
    const result: PasswordValidationResult = { is_valid: true, errors: [] };
    mockAuthRepository.validatePassword.mockResolvedValue(result);

    await useCase.execute(password);

    expect(mockAuthRepository.validatePassword).toHaveBeenCalledTimes(1);
    expect(mockAuthRepository.validatePassword).toHaveBeenCalledWith(password);
  });

  it('should return is_valid true and empty errors for a strong password', async () => {
    mockAuthRepository.validatePassword.mockResolvedValue({ is_valid: true, errors: [] });

    const result = await useCase.execute('StrongPass1!');

    expect(result.is_valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should return is_valid false and error messages for a weak password', async () => {
    const validationResult: PasswordValidationResult = {
      is_valid: false,
      errors: ['Password is too short.', 'Password must contain at least one number.'],
    };
    mockAuthRepository.validatePassword.mockResolvedValue(validationResult);

    const result = await useCase.execute('weak');

    expect(result.is_valid).toBe(false);
    expect(result.errors).toEqual(['Password is too short.', 'Password must contain at least one number.']);
  });

  it('should propagate errors thrown by the repository', async () => {
    mockAuthRepository.validatePassword.mockRejectedValue(new Error('Service unavailable'));

    await expect(useCase.execute('somepassword')).rejects.toThrow('Service unavailable');
  });
});
