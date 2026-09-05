import { UserDataSource } from '@/data/datasources/user-datasource';
import { User } from '@/domain/models/user';

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

const mockUsers: User[] = [
  {
    id: 1,
    username: 'john',
    email: 'john@example.com',
    first_name: 'John',
    last_name: 'Doe',
    profile: { bio: 'Dev' },
  },
];

describe('UserDataSource', () => {
  let dataSource: UserDataSource;

  beforeEach(() => {
    jest.clearAllMocks();
    dataSource = new UserDataSource();
  });

  it('should return a list of users on success', async () => {
    mockFetch.mockResolvedValue(mockResponse(200, mockUsers));

    const result = await dataSource.fetchUsers('valid-token');

    expect(result).toEqual(mockUsers);
  });

  it('should send the Authorization header with the Bearer token', async () => {
    const token = 'my-access-token';
    mockFetch.mockResolvedValue(mockResponse(200, mockUsers));

    await dataSource.fetchUsers(token);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/'),
      expect.objectContaining({
        headers: { Authorization: `Bearer ${token}` },
      })
    );
  });

  it('should throw with the server detail message on error', async () => {
    mockFetch.mockResolvedValue(
      mockResponse(401, { detail: 'Authentication credentials were not provided.' })
    );

    await expect(dataSource.fetchUsers('bad-token')).rejects.toThrow(
      'Authentication credentials were not provided.'
    );
  });

  it('should throw a default message when no detail is in the error response', async () => {
    mockFetch.mockResolvedValue(mockResponse(500, {}));

    await expect(dataSource.fetchUsers('some-token')).rejects.toThrow(
      'Ocurrió un error inesperado. Intentá de nuevo.'
    );
  });
});
