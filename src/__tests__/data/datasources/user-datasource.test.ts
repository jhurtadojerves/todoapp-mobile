import MockAdapter from 'axios-mock-adapter';

import { UserDataSource } from '@/data/datasources/user-datasource';
import { User } from '@/domain/models/user';
import { PaginatedResponse } from '@/domain/models/pagination';
import { apiClient } from '@/shared/api/http-client';
import { storage } from '@/shared/utils/storage';

jest.mock('@/shared/utils/storage', () => ({
  storage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    deleteItem: jest.fn(),
  },
}));

const apiMock = new MockAdapter(apiClient);

const mockGetItem = storage.getItem as jest.Mock;

const user: User = {
  id: 1,
  username: 'john',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  profile: { bio: 'Dev' },
};

describe('UserDataSource', () => {
  let dataSource: UserDataSource;

  beforeEach(() => {
    apiMock.reset();
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
    dataSource = new UserDataSource();
  });

  it('should return the full paginated response on success', async () => {
    const paginated: PaginatedResponse<User> = { count: 1, next: null, previous: null, results: [user] };
    apiMock.onAny().reply(200, paginated);

    const result = await dataSource.fetchUsers(1);

    expect(result).toEqual(paginated);
  });

  it('should send a request to the users endpoint with the page query param', async () => {
    apiMock.onAny().reply(200, { count: 0, next: null, previous: null, results: [] });

    await dataSource.fetchUsers(2);

    expect(apiMock.history.get[0].url).toContain('/users/?page=2');
  });

  it('should throw with the server detail message on error', async () => {
    apiMock.onAny().reply(401, { detail: 'Authentication credentials were not provided.' });

    await expect(dataSource.fetchUsers(1)).rejects.toThrow(
      'Authentication credentials were not provided.'
    );
  });

  it('should throw a default message when no detail is in the error response', async () => {
    apiMock.onAny().reply(500, {});

    await expect(dataSource.fetchUsers(1)).rejects.toThrow(
      'El servidor tuvo un problema. Intentá de nuevo en unos minutos.'
    );
  });
});
