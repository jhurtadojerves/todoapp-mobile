import { SprintDataSource } from '@/data/datasources/sprint-datasource';
import { Sprint, SprintInput } from '@/domain/models/sprint';
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

const sprint: Sprint = {
  id: 1,
  name: 'Sprint 1',
  start_date: '2026-01-01',
  end_date: '2026-01-14',
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-01T00:00:00Z',
};

describe('SprintDataSource', () => {
  let dataSource: SprintDataSource;

  beforeEach(() => {
    jest.clearAllMocks();
    dataSource = new SprintDataSource();
  });

  // ── fetchSprints ───────────────────────────────────────────────────────────

  describe('fetchSprints', () => {
    it('should return the results array from a paginated response', async () => {
      const paginated: PaginatedResponse<Sprint> = {
        count: 1,
        next: null,
        previous: null,
        results: [sprint],
      };
      mockFetch.mockResolvedValue(mockResponse(200, paginated));

      const result = await dataSource.fetchSprints('valid-token', 1);

      expect(result).toEqual([sprint]);
    });

    it('should request the sprints endpoint for the given board', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, { count: 0, next: null, previous: null, results: [] }));

      await dataSource.fetchSprints('valid-token', 1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/boards/1/sprints/'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer valid-token' },
        })
      );
    });

    it('should throw a default message when no detail is provided', async () => {
      mockFetch.mockResolvedValue(mockResponse(500, {}));

      await expect(dataSource.fetchSprints('valid-token', 1)).rejects.toThrow(
        'Ocurrió un error inesperado. Intentá de nuevo.'
      );
    });
  });

  // ── createSprint ───────────────────────────────────────────────────────────

  describe('createSprint', () => {
    const input: SprintInput = { name: 'Sprint 1', start_date: '2026-01-01', end_date: '2026-01-14' };

    it('should return the created sprint', async () => {
      mockFetch.mockResolvedValue(mockResponse(201, sprint));

      const result = await dataSource.createSprint('valid-token', 1, input);

      expect(result).toEqual(sprint);
    });

    it('should send a POST request with the sprint input', async () => {
      mockFetch.mockResolvedValue(mockResponse(201, sprint));

      await dataSource.createSprint('valid-token', 1, input);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/boards/1/sprints/'),
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

      await expect(dataSource.createSprint('valid-token', 1, input)).rejects.toThrow(
        'This field may not be blank.'
      );
    });
  });

  // ── updateSprint ───────────────────────────────────────────────────────────

  describe('updateSprint', () => {
    const input: SprintInput = { name: 'Sprint 1 renamed', start_date: null, end_date: null };

    it('should return the updated sprint', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, { ...sprint, ...input }));

      const result = await dataSource.updateSprint('valid-token', 1, 1, input);

      expect(result).toEqual({ ...sprint, ...input });
    });

    it('should send a PATCH request to the sprint detail endpoint', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, sprint));

      await dataSource.updateSprint('valid-token', 1, 1, input);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/boards/1/sprints/1/'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(input),
        })
      );
    });

    it('should throw when the user is not allowed to update the sprint', async () => {
      mockFetch.mockResolvedValue(
        mockResponse(403, { detail: 'You do not have permission to perform this action.' })
      );

      await expect(dataSource.updateSprint('valid-token', 1, 1, input)).rejects.toThrow(
        'You do not have permission to perform this action.'
      );
    });
  });

  // ── deleteSprint ───────────────────────────────────────────────────────────

  describe('deleteSprint', () => {
    it('should resolve when the deletion succeeds', async () => {
      mockFetch.mockResolvedValue(mockResponse(204, null));

      await expect(dataSource.deleteSprint('valid-token', 1, 1)).resolves.toBeUndefined();
    });

    it('should send a DELETE request to the sprint detail endpoint', async () => {
      mockFetch.mockResolvedValue(mockResponse(204, null));

      await dataSource.deleteSprint('valid-token', 1, 1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/boards/1/sprints/1/'),
        expect.objectContaining({
          method: 'DELETE',
          headers: { Authorization: 'Bearer valid-token' },
        })
      );
    });

    it('should throw a default message when the deletion fails', async () => {
      mockFetch.mockResolvedValue(mockResponse(500, {}));

      await expect(dataSource.deleteSprint('valid-token', 1, 1)).rejects.toThrow(
        'Ocurrió un error inesperado. Intentá de nuevo.'
      );
    });
  });
});
