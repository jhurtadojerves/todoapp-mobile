/**
 * Integration tests: GetUsersUseCase → UserRepositoryImpl → UserDataSource
 * Only `fetch` is mocked (the real external boundary).
 */
import { UserDataSource } from '@/data/datasources/user-datasource';
import { UserRepositoryImpl } from '@/data/repositories/user-repository-impl';
import { GetUsersUseCase } from '@/domain/usecases/get-users';
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

function buildDependencies() {
  const dataSource = new UserDataSource();
  const repository = new UserRepositoryImpl(dataSource);
  return new GetUsersUseCase(repository);
}

const apiUsers: User[] = [
  { id: 1, username: 'john', email: 'john@example.com', first_name: 'John', last_name: 'Doe', profile: { bio: 'Dev' } },
  { id: 2, username: 'jane', email: 'jane@example.com', profile: { bio: '' } },
];

describe('Get users flow (integration)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return the full list of users with a valid token', async () => {
    const useCase = buildDependencies();
    mockFetch.mockResolvedValue(mockResponse(200, apiUsers));

    const result = await useCase.execute('valid-token');

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ id: 1, username: 'john', email: 'john@example.com' });
    expect(result[1]).toMatchObject({ id: 2, username: 'jane' });
  });

  it('should send the Bearer token in the Authorization header', async () => {
    const useCase = buildDependencies();
    mockFetch.mockResolvedValue(mockResponse(200, apiUsers));
    const token = 'my-jwt-token';

    await useCase.execute(token);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/'),
      expect.objectContaining({
        headers: { Authorization: `Bearer ${token}` },
      })
    );
  });

  it('should throw when the token is expired or invalid', async () => {
    const useCase = buildDependencies();
    mockFetch.mockResolvedValue(
      mockResponse(401, { detail: 'Token is expired.' })
    );

    await expect(useCase.execute('expired-token')).rejects.toThrow('Token is expired.');
  });
});
