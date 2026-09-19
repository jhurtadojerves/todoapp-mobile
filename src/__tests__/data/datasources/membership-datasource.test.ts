import MockAdapter from 'axios-mock-adapter';

import { MembershipDataSource } from '@/data/datasources/membership-datasource';
import { BoardMembership, BoardMembershipInput } from '@/domain/models/membership';
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

const membership: BoardMembership = {
  id: 5,
  boardId: 1,
  user: { id: 2, username: 'jane', email: 'jane@example.com' },
  role: 'member',
  created: '2026-01-01T00:00:00Z',
};

describe('MembershipDataSource', () => {
  let dataSource: MembershipDataSource;

  beforeEach(() => {
    apiMock.reset();
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
    dataSource = new MembershipDataSource();
  });

  // ── fetchMembers ───────────────────────────────────────────────────────────

  describe('fetchMembers', () => {
    it('should return the full paginated response', async () => {
      const paginated: PaginatedResponse<BoardMembership> = {
        count: 1,
        next: null,
        previous: null,
        results: [membership],
      };
      apiMock.onAny().reply(200, paginated);

      const result = await dataSource.fetchMembers(1, 1);

      expect(result).toEqual(paginated);
    });

    it('should request the members endpoint with the page query param', async () => {
      apiMock.onAny().reply(200, { count: 0, next: null, previous: null, results: [] });

      await dataSource.fetchMembers(1, 2);

      expect(apiMock.history.get[0].url).toContain('/boards/1/members/?page=2');
    });

    it('should throw with the server detail message on error', async () => {
      apiMock.onAny().reply(403, { detail: 'You do not have permission to perform this action.' });

      await expect(dataSource.fetchMembers(1, 1)).rejects.toThrow(
        'You do not have permission to perform this action.'
      );
    });

    it('should throw a default message when no detail is provided', async () => {
      apiMock.onAny().reply(500, {});

      await expect(dataSource.fetchMembers(1, 1)).rejects.toThrow(
        'El servidor tuvo un problema. Intentá de nuevo en unos minutos.'
      );
    });
  });

  // ── addMember ──────────────────────────────────────────────────────────────

  describe('addMember', () => {
    const input: BoardMembershipInput = { email: 'jane@example.com' };

    it('should return the created membership', async () => {
      apiMock.onAny().reply(201, membership);

      const result = await dataSource.addMember(1, input);

      expect(result).toEqual(membership);
    });

    it('should send a POST request with the invite input', async () => {
      apiMock.onAny().reply(201, membership);

      await dataSource.addMember(1, input);

      const request = apiMock.history.post[0];
      expect(request.url).toContain('/boards/1/members/');
      expect(request.headers?.['Content-Type']).toContain('application/json');
      expect(request.data).toBe(JSON.stringify(input));
    });

    it('should throw with the email field error when present', async () => {
      apiMock.onAny().reply(400, { email: ['No user found with that email.'] });

      await expect(dataSource.addMember(1, input)).rejects.toThrow(
        'No user found with that email.'
      );
    });

    it('should throw a default message when no specific error is provided', async () => {
      apiMock.onAny().reply(500, {});

      await expect(dataSource.addMember(1, input)).rejects.toThrow(
        'El servidor tuvo un problema. Intentá de nuevo en unos minutos.'
      );
    });
  });

  // ── removeMember ───────────────────────────────────────────────────────────

  describe('removeMember', () => {
    it('should resolve when the removal succeeds', async () => {
      apiMock.onAny().reply(204);

      await expect(dataSource.removeMember(1, 5)).resolves.toBeUndefined();
    });

    it('should send a DELETE request to the member detail endpoint', async () => {
      apiMock.onAny().reply(204);

      await dataSource.removeMember(1, 5);

      expect(apiMock.history.delete[0].url).toContain('/boards/1/members/5/');
    });

    it('should throw a default message when the removal fails', async () => {
      apiMock.onAny().reply(500, {});

      await expect(dataSource.removeMember(1, 5)).rejects.toThrow(
        'El servidor tuvo un problema. Intentá de nuevo en unos minutos.'
      );
    });
  });
});
