import { GetUsersUseCase } from '@/domain/usecases/get-users';
import { UserRepository } from '@/domain/repositories/user-repository';
import { User } from '@/domain/models/user';
import { PaginatedResponse } from '@/domain/models/pagination';

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
const page: PaginatedResponse<User> = { count: 2, next: null, previous: null, results: mockUsers };
const emptyPage: PaginatedResponse<User> = { count: 0, next: null, previous: null, results: [] };

describe('GetUsersUseCase', () => {
  let useCase: GetUsersUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetUsersUseCase(mockUserRepository);
  });

  it('should call userRepository.fetchUsers with the given token and page', async () => {
    const token = 'valid-access-token';
    mockUserRepository.fetchUsers.mockResolvedValue(page);

    await useCase.execute(token, 1);

    expect(mockUserRepository.fetchUsers).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.fetchUsers).toHaveBeenCalledWith(token, 1);
  });

  it('should return the paginated response from the repository', async () => {
    mockUserRepository.fetchUsers.mockResolvedValue(page);

    const result = await useCase.execute('valid-access-token', 1);

    expect(result.results).toEqual(mockUsers);
    expect(result.results).toHaveLength(2);
  });

  it('should return an empty results array when there are no users', async () => {
    mockUserRepository.fetchUsers.mockResolvedValue(emptyPage);

    const result = await useCase.execute('valid-access-token', 1);

    expect(result.results).toEqual([]);
  });

  it('should propagate errors thrown by the repository', async () => {
    mockUserRepository.fetchUsers.mockRejectedValue(new Error('Unauthorized'));

    await expect(useCase.execute('invalid-token', 1)).rejects.toThrow('Unauthorized');
  });
});
