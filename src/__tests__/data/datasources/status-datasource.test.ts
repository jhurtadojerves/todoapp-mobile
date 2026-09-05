import { StatusDataSource } from '@/data/datasources/status-datasource';
import { BoardStatus, BoardStatusInput } from '@/domain/models/status';
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

const boardStatus: BoardStatus = { id: 1, name: 'To Do', order: 0, color: '#64748b' };

describe('StatusDataSource', () => {
  let dataSource: StatusDataSource;

  beforeEach(() => {
    jest.clearAllMocks();
    dataSource = new StatusDataSource();
  });

  // ── fetchStatuses ──────────────────────────────────────────────────────────

  describe('fetchStatuses', () => {
    it('should return the results array from a paginated response', async () => {
      const paginated: PaginatedResponse<BoardStatus> = {
        count: 1,
        next: null,
        previous: null,
        results: [boardStatus],
      };
      mockFetch.mockResolvedValue(mockResponse(200, paginated));

      const result = await dataSource.fetchStatuses('valid-token', 1);

      expect(result).toEqual([boardStatus]);
    });

    it('should request the statuses endpoint for the given board', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, { count: 0, next: null, previous: null, results: [] }));

      await dataSource.fetchStatuses('valid-token', 1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/boards/1/statuses/'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer valid-token' },
        })
      );
    });

    it('should throw a default message when no detail is provided', async () => {
      mockFetch.mockResolvedValue(mockResponse(500, {}));

      await expect(dataSource.fetchStatuses('valid-token', 1)).rejects.toThrow(
        'No se pudieron cargar los estados.'
      );
    });
  });

  // ── createStatus ───────────────────────────────────────────────────────────

  describe('createStatus', () => {
    const input: BoardStatusInput = { name: 'To Do', order: 0, color: '#64748b' };

    it('should return the created status', async () => {
      mockFetch.mockResolvedValue(mockResponse(201, boardStatus));

      const result = await dataSource.createStatus('valid-token', 1, input);

      expect(result).toEqual(boardStatus);
    });

    it('should send a POST request with the status input', async () => {
      mockFetch.mockResolvedValue(mockResponse(201, boardStatus));

      await dataSource.createStatus('valid-token', 1, input);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/boards/1/statuses/'),
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

    it('should throw with the field error message when present', async () => {
      mockFetch.mockResolvedValue(mockResponse(400, { name: ['This field may not be blank.'] }));

      await expect(dataSource.createStatus('valid-token', 1, input)).rejects.toThrow(
        'This field may not be blank.'
      );
    });
  });

  // ── updateStatus ───────────────────────────────────────────────────────────

  describe('updateStatus', () => {
    const input: BoardStatusInput = { name: 'In Progress', order: 1, color: '#3b82f6' };

    it('should return the updated status', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, { ...boardStatus, ...input }));

      const result = await dataSource.updateStatus('valid-token', 1, 1, input);

      expect(result).toEqual({ ...boardStatus, ...input });
    });

    it('should send a PATCH request to the status detail endpoint', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, boardStatus));

      await dataSource.updateStatus('valid-token', 1, 1, input);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/boards/1/statuses/1/'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(input),
        })
      );
    });

    it('should throw when the user is not allowed to update the status', async () => {
      mockFetch.mockResolvedValue(
        mockResponse(403, { detail: 'You do not have permission to perform this action.' })
      );

      await expect(dataSource.updateStatus('valid-token', 1, 1, input)).rejects.toThrow(
        'You do not have permission to perform this action.'
      );
    });
  });

  // ── deleteStatus ───────────────────────────────────────────────────────────

  describe('deleteStatus', () => {
    it('should resolve when the deletion succeeds', async () => {
      mockFetch.mockResolvedValue(mockResponse(204, null));

      await expect(dataSource.deleteStatus('valid-token', 1, 1)).resolves.toBeUndefined();
    });

    it('should send a DELETE request to the status detail endpoint', async () => {
      mockFetch.mockResolvedValue(mockResponse(204, null));

      await dataSource.deleteStatus('valid-token', 1, 1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/boards/1/statuses/1/'),
        expect.objectContaining({
          method: 'DELETE',
          headers: { Authorization: 'Bearer valid-token' },
        })
      );
    });

    it('should throw a default message when the deletion fails', async () => {
      mockFetch.mockResolvedValue(mockResponse(500, {}));

      await expect(dataSource.deleteStatus('valid-token', 1, 1)).rejects.toThrow(
        'No se pudo eliminar el estado.'
      );
    });
  });
});
