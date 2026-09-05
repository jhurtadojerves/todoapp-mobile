import { MembershipDataSource } from '@/data/datasources/membership-datasource';
import { BoardMembership, BoardMembershipInput } from '@/domain/models/membership';
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

const membership: BoardMembership = {
  id: 5,
  board_id: 1,
  user: { id: 2, username: 'jane', email: 'jane@example.com' },
  role: 'member',
  created: '2026-01-01T00:00:00Z',
};

describe('MembershipDataSource', () => {
  let dataSource: MembershipDataSource;

  beforeEach(() => {
    jest.clearAllMocks();
    dataSource = new MembershipDataSource();
  });

  // ── fetchMembers ───────────────────────────────────────────────────────────

  describe('fetchMembers', () => {
    it('should return the results array from a paginated response', async () => {
      const paginated: PaginatedResponse<BoardMembership> = {
        count: 1,
        next: null,
        previous: null,
        results: [membership],
      };
      mockFetch.mockResolvedValue(mockResponse(200, paginated));

      const result = await dataSource.fetchMembers('valid-token', 1);

      expect(result).toEqual([membership]);
    });

    it('should request the members endpoint for the given board', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, { count: 0, next: null, previous: null, results: [] }));

      await dataSource.fetchMembers('valid-token', 1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/boards/1/members/'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer valid-token' },
        })
      );
    });

    it('should throw with the server detail message on error', async () => {
      mockFetch.mockResolvedValue(mockResponse(403, { detail: 'You do not have permission to perform this action.' }));

      await expect(dataSource.fetchMembers('valid-token', 1)).rejects.toThrow(
        'You do not have permission to perform this action.'
      );
    });

    it('should throw a default message when no detail is provided', async () => {
      mockFetch.mockResolvedValue(mockResponse(500, {}));

      await expect(dataSource.fetchMembers('valid-token', 1)).rejects.toThrow(
        'Ocurrió un error inesperado. Intentá de nuevo.'
      );
    });
  });

  // ── addMember ──────────────────────────────────────────────────────────────

  describe('addMember', () => {
    const input: BoardMembershipInput = { email: 'jane@example.com' };

    it('should return the created membership', async () => {
      mockFetch.mockResolvedValue(mockResponse(201, membership));

      const result = await dataSource.addMember('valid-token', 1, input);

      expect(result).toEqual(membership);
    });

    it('should send a POST request with the invite input', async () => {
      mockFetch.mockResolvedValue(mockResponse(201, membership));

      await dataSource.addMember('valid-token', 1, input);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/boards/1/members/'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid-token',
          },
          body: JSON.stringify(input),
        })
      );
    });

    it('should throw with the email field error when present', async () => {
      mockFetch.mockResolvedValue(mockResponse(400, { email: ['No user found with that email.'] }));

      await expect(dataSource.addMember('valid-token', 1, input)).rejects.toThrow(
        'No user found with that email.'
      );
    });

    it('should throw a default message when no specific error is provided', async () => {
      mockFetch.mockResolvedValue(mockResponse(500, {}));

      await expect(dataSource.addMember('valid-token', 1, input)).rejects.toThrow(
        'Ocurrió un error inesperado. Intentá de nuevo.'
      );
    });
  });

  // ── removeMember ───────────────────────────────────────────────────────────

  describe('removeMember', () => {
    it('should resolve when the removal succeeds', async () => {
      mockFetch.mockResolvedValue(mockResponse(204, null));

      await expect(dataSource.removeMember('valid-token', 1, 5)).resolves.toBeUndefined();
    });

    it('should send a DELETE request to the member detail endpoint', async () => {
      mockFetch.mockResolvedValue(mockResponse(204, null));

      await dataSource.removeMember('valid-token', 1, 5);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/boards/1/members/5/'),
        expect.objectContaining({
          method: 'DELETE',
          headers: { Authorization: 'Bearer valid-token' },
        })
      );
    });

    it('should throw a default message when the removal fails', async () => {
      mockFetch.mockResolvedValue(mockResponse(500, {}));

      await expect(dataSource.removeMember('valid-token', 1, 5)).rejects.toThrow(
        'Ocurrió un error inesperado. Intentá de nuevo.'
      );
    });
  });
});
