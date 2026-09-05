import { RegisterUseCase } from '@/domain/usecases/register';
import { AuthRepository } from '@/domain/repositories/auth-repository';
import { RegisterCredentials, RegisteredUser } from '@/domain/models/register';

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
      username: 'johndoe',
      email: 'new@example.com',
      password: 'StrongPass1!',
      password2: 'StrongPass1!',
      first_name: 'John',
      last_name: 'Doe',
    };
    const registeredUser: RegisteredUser = {
      username: 'johndoe',
      email: 'new@example.com',
      first_name: 'John',
      last_name: 'Doe',
    };
    mockAuthRepository.register.mockResolvedValue(registeredUser);

    await useCase.execute(credentials);

    expect(mockAuthRepository.register).toHaveBeenCalledTimes(1);
    expect(mockAuthRepository.register).toHaveBeenCalledWith(credentials);
  });

  it('should return the created user on successful registration', async () => {
    const credentials: RegisterCredentials = {
      username: 'janedoe',
      email: 'new@example.com',
      password: 'StrongPass1!',
      password2: 'StrongPass1!',
      first_name: 'Jane',
      last_name: 'Doe',
    };
    const registeredUser: RegisteredUser = {
      username: 'janedoe',
      email: 'new@example.com',
      first_name: 'Jane',
      last_name: 'Doe',
    };
    mockAuthRepository.register.mockResolvedValue(registeredUser);

    const result = await useCase.execute(credentials);

    expect(result).toEqual(registeredUser);
  });

  it('should propagate errors thrown by the repository', async () => {
    const credentials: RegisterCredentials = {
      username: 'dup',
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
