import { BoardDataSource } from '@/data/datasources/board-datasource';
import { Board, BoardInput } from '@/domain/models/board';
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

const board: Board = {
  id: 1,
  name: 'Sprint board',
  description: 'Board for the current sprint',
  user_id: 7,
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-01T00:00:00Z',
};

describe('BoardDataSource', () => {
  let dataSource: BoardDataSource;

  beforeEach(() => {
    jest.clearAllMocks();
    dataSource = new BoardDataSource();
  });

  // ── fetchBoards ────────────────────────────────────────────────────────────

  describe('fetchBoards', () => {
    it('should return the results array from a paginated response', async () => {
      const paginated: PaginatedResponse<Board> = {
        count: 1,
        next: null,
        previous: null,
        results: [board],
      };
      mockFetch.mockResolvedValue(mockResponse(200, paginated));

      const result = await dataSource.fetchBoards('valid-token');

      expect(result).toEqual([board]);
    });

    it('should return the array directly when the response is not paginated', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, [board]));

      const result = await dataSource.fetchBoards('valid-token');

      expect(result).toEqual([board]);
    });

    it('should send the Bearer token in the Authorization header', async () => {
      const token = 'my-token';
      mockFetch.mockResolvedValue(mockResponse(200, { count: 0, next: null, previous: null, results: [] }));

      await dataSource.fetchBoards(token);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/boards/'),
        expect.objectContaining({
          headers: { Authorization: `Bearer ${token}` },
        })
      );
    });

    it('should throw with the server detail message on error', async () => {
      mockFetch.mockResolvedValue(mockResponse(401, { detail: 'Authentication credentials were not provided.' }));

      await expect(dataSource.fetchBoards('bad-token')).rejects.toThrow(
        'Authentication credentials were not provided.'
      );
    });

    it('should throw a default message when no detail is provided', async () => {
      mockFetch.mockResolvedValue(mockResponse(500, {}));

      await expect(dataSource.fetchBoards('some-token')).rejects.toThrow(
        'No se pudieron cargar los tableros.'
      );
    });
  });

  // ── fetchBoard ─────────────────────────────────────────────────────────────

  describe('fetchBoard', () => {
    it('should return the board on success', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, board));

      const result = await dataSource.fetchBoard('valid-token', 1);

      expect(result).toEqual(board);
    });

    it('should request the board detail endpoint', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, board));

      await dataSource.fetchBoard('valid-token', 1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/boards/1/'),
        expect.objectContaining({
          headers: { Authorization: `Bearer valid-token` },
        })
      );
    });

    it('should throw when the board does not exist', async () => {
      mockFetch.mockResolvedValue(mockResponse(404, { detail: 'Not found.' }));

      await expect(dataSource.fetchBoard('valid-token', 999)).rejects.toThrow('Not found.');
    });
  });

  // ── createBoard ────────────────────────────────────────────────────────────

  describe('createBoard', () => {
    const input: BoardInput = { name: 'New board', description: 'A description' };

    it('should return the created board', async () => {
      mockFetch.mockResolvedValue(mockResponse(201, board));

      const result = await dataSource.createBoard('valid-token', input);

      expect(result).toEqual(board);
    });

    it('should send a POST request with the board input', async () => {
      mockFetch.mockResolvedValue(mockResponse(201, board));

      await dataSource.createBoard('valid-token', input);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/boards/'),
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

      await expect(dataSource.createBoard('valid-token', input)).rejects.toThrow(
        'This field may not be blank.'
      );
    });

    it('should throw a default message when no specific error is provided', async () => {
      mockFetch.mockResolvedValue(mockResponse(500, {}));

      await expect(dataSource.createBoard('valid-token', input)).rejects.toThrow(
        'No se pudo crear el tablero.'
      );
    });
  });

  // ── updateBoard ────────────────────────────────────────────────────────────

  describe('updateBoard', () => {
    const input: BoardInput = { name: 'Updated board', description: 'Updated description' };

    it('should return the updated board', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, { ...board, ...input }));

      const result = await dataSource.updateBoard('valid-token', 1, input);

      expect(result).toEqual({ ...board, ...input });
    });

    it('should send a PATCH request to the board detail endpoint', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, board));

      await dataSource.updateBoard('valid-token', 1, input);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/boards/1/'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(input),
        })
      );
    });

    it('should throw when the user is not allowed to update the board', async () => {
      mockFetch.mockResolvedValue(mockResponse(403, { detail: 'You do not have permission to perform this action.' }));

      await expect(dataSource.updateBoard('valid-token', 1, input)).rejects.toThrow(
        'You do not have permission to perform this action.'
      );
    });
  });

  // ── deleteBoard ────────────────────────────────────────────────────────────

  describe('deleteBoard', () => {
    it('should resolve when the deletion succeeds', async () => {
      mockFetch.mockResolvedValue(mockResponse(204, null));

      await expect(dataSource.deleteBoard('valid-token', 1)).resolves.toBeUndefined();
    });

    it('should send a DELETE request to the board detail endpoint', async () => {
      mockFetch.mockResolvedValue(mockResponse(204, null));

      await dataSource.deleteBoard('valid-token', 1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/boards/1/'),
        expect.objectContaining({
          method: 'DELETE',
          headers: { Authorization: 'Bearer valid-token' },
        })
      );
    });

    it('should throw a default message when the deletion fails', async () => {
      mockFetch.mockResolvedValue(mockResponse(500, {}));

      await expect(dataSource.deleteBoard('valid-token', 1)).rejects.toThrow(
        'No se pudo eliminar el tablero.'
      );
    });
  });
});
