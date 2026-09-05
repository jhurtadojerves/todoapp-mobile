import { UserRepositoryImpl } from '@/data/repositories/user-repository-impl';
import { UserDataSource } from '@/data/datasources/user-datasource';
import { User } from '@/domain/models/user';
import { PaginatedResponse } from '@/domain/models/pagination';

const mockDataSource: jest.Mocked<UserDataSource> = {
  fetchUsers: jest.fn(),
};

const mockUsers: User[] = [
  { id: 1, username: 'john', email: 'john@example.com', profile: { bio: '' } },
  { id: 2, username: 'jane', email: 'jane@example.com', profile: { bio: 'Designer' } },
];
const page: PaginatedResponse<User> = { count: 2, next: null, previous: null, results: mockUsers };

describe('UserRepositoryImpl', () => {
  let repository: UserRepositoryImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new UserRepositoryImpl(mockDataSource);
  });

  it('should delegate fetchUsers to the data source', async () => {
    const token = 'valid-token';
    mockDataSource.fetchUsers.mockResolvedValue(page);

    const result = await repository.fetchUsers(token, 1);

    expect(mockDataSource.fetchUsers).toHaveBeenCalledWith(token, 1);
    expect(result).toEqual(page);
  });

  it('should propagate errors from the data source', async () => {
    mockDataSource.fetchUsers.mockRejectedValue(new Error('Network error'));

    await expect(repository.fetchUsers('some-token', 1)).rejects.toThrow('Network error');
  });
});
