import { GetUsersUseCase } from '@/domain/usecases/get-users';
import { UserRepository } from '@/domain/repositories/user-repository';
import { User } from '@/domain/models/user';

const mockUserRepository: jest.Mocked<UserRepository> = {
  fetchUsers: jest.fn(),
};

const mockUsers: User[] = [
  {
    id: 1,
    username: 'john',
    email: 'john@example.com',
    first_name: 'John',
    last_name: 'Doe',
    date_joined: '2024-01-01',
    profile: { bio: 'Developer' },
  },
  {
    id: 2,
    username: 'jane',
    email: 'jane@example.com',
    profile: { bio: '' },
  },
];

describe('GetUsersUseCase', () => {
  let useCase: GetUsersUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetUsersUseCase(mockUserRepository);
  });

  it('should call userRepository.fetchUsers with the given token', async () => {
    const token = 'valid-access-token';
    mockUserRepository.fetchUsers.mockResolvedValue(mockUsers);

    await useCase.execute(token);

    expect(mockUserRepository.fetchUsers).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.fetchUsers).toHaveBeenCalledWith(token);
  });

  it('should return the list of users from the repository', async () => {
    mockUserRepository.fetchUsers.mockResolvedValue(mockUsers);

    const result = await useCase.execute('valid-access-token');

    expect(result).toEqual(mockUsers);
    expect(result).toHaveLength(2);
  });

  it('should return an empty array when there are no users', async () => {
    mockUserRepository.fetchUsers.mockResolvedValue([]);

    const result = await useCase.execute('valid-access-token');

    expect(result).toEqual([]);
  });

  it('should propagate errors thrown by the repository', async () => {
    mockUserRepository.fetchUsers.mockRejectedValue(new Error('Unauthorized'));

    await expect(useCase.execute('invalid-token')).rejects.toThrow('Unauthorized');
  });
});
