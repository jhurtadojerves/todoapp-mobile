import { UserDataSource } from '@/data/datasources/user-datasource';
import { User } from '@/domain/models/user';
import { PaginatedResponse } from '@/domain/models/pagination';

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

const user: User = {
  id: 1,
  username: 'john',
  email: 'john@example.com',
  first_name: 'John',
  last_name: 'Doe',
  profile: { bio: 'Dev' },
};

describe('UserDataSource', () => {
  let dataSource: UserDataSource;

  beforeEach(() => {
    jest.clearAllMocks();
    dataSource = new UserDataSource();
  });

  it('should return the full paginated response on success', async () => {
    const paginated: PaginatedResponse<User> = { count: 1, next: null, previous: null, results: [user] };
    mockFetch.mockResolvedValue(mockResponse(200, paginated));

    const result = await dataSource.fetchUsers('valid-token', 1);

    expect(result).toEqual(paginated);
  });

  it('should send the Authorization header and the page query param', async () => {
    const token = 'my-access-token';
    mockFetch.mockResolvedValue(mockResponse(200, { count: 0, next: null, previous: null, results: [] }));

    await dataSource.fetchUsers(token, 2);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/?page=2'),
      expect.objectContaining({
        headers: { Authorization: `Bearer ${token}` },
      })
    );
  });

  it('should throw with the server detail message on error', async () => {
    mockFetch.mockResolvedValue(
      mockResponse(401, { detail: 'Authentication credentials were not provided.' })
    );

    await expect(dataSource.fetchUsers('bad-token', 1)).rejects.toThrow(
      'Authentication credentials were not provided.'
    );
  });

  it('should throw a default message when no detail is in the error response', async () => {
    mockFetch.mockResolvedValue(mockResponse(500, {}));

    await expect(dataSource.fetchUsers('some-token', 1)).rejects.toThrow(
      'Ocurrió un error inesperado. Intentá de nuevo.'
    );
  });
});
