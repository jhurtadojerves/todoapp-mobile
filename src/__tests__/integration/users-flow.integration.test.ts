/**
 * Integration tests: GetUsersUseCase → UserRepositoryImpl → UserDataSource
 * Only `fetch` is mocked (the real external boundary), plus secure storage
 * (the Bearer token is now attached by the http-client's auth interceptor,
 * which reads it from storage rather than having it threaded in manually).
 */
import MockAdapter from 'axios-mock-adapter';

import { UserDataSource } from '@/data/datasources/user-datasource';
import { UserRepositoryImpl } from '@/data/repositories/user-repository-impl';
import { GetUsersUseCase } from '@/domain/usecases/get-users';
import { User } from '@/domain/models/user';
import { storage } from '@/shared/utils/storage';
import { apiClient } from '@/shared/api/http-client';

jest.mock('@/shared/utils/storage', () => ({
  storage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    deleteItem: jest.fn(),
  },
}));

const apiMock = new MockAdapter(apiClient);

const mockGetItem = storage.getItem as jest.Mock;

function buildDependencies() {
  const dataSource = new UserDataSource();
  const repository = new UserRepositoryImpl(dataSource);
  return new GetUsersUseCase(repository);
}

const apiUsers: User[] = [
  { id: 1, username: 'john', email: 'john@example.com', firstName: 'John', lastName: 'Doe', profile: { bio: 'Dev' } },
  { id: 2, username: 'jane', email: 'jane@example.com', profile: { bio: '' } },
];

describe('Get users flow (integration)', () => {
  beforeEach(() => {
    apiMock.reset();
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
  });

  it('should return the first page of users with a valid session', async () => {
    const useCase = buildDependencies();
    apiMock.onAny().reply(200, { count: 2, next: null, previous: null, results: apiUsers });

    const result = await useCase.execute(1);

    expect(result.results).toHaveLength(2);
    expect(result.results[0]).toMatchObject({ id: 1, username: 'john', email: 'john@example.com' });
    expect(result.results[1]).toMatchObject({ id: 2, username: 'jane' });
  });

  it('should send the Bearer token read from storage and the page query param', async () => {
    const useCase = buildDependencies();
    apiMock.onAny().reply(200, { count: 2, next: null, previous: null, results: apiUsers });
    mockGetItem.mockResolvedValue('my-jwt-token');

    await useCase.execute(1);

    expect(apiMock.history.get[0].url).toContain('/users/?page=1');
    expect(apiMock.history.get[0].headers?.Authorization).toBe('Bearer my-jwt-token');
  });

  it('should throw when the token is expired or invalid', async () => {
    const useCase = buildDependencies();
    apiMock.onAny().reply(401, { detail: 'Token is expired.' });

    await expect(useCase.execute(1)).rejects.toThrow('Token is expired.');
  });
});
