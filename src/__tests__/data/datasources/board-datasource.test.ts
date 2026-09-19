import MockAdapter from 'axios-mock-adapter';

import { BoardDataSource } from '@/data/datasources/board-datasource';
import { Board, BoardInput } from '@/domain/models/board';
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

const board: Board = {
  id: 1,
  name: 'Sprint board',
  description: 'Board for the current sprint',
  userId: 7,
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-01T00:00:00Z',
};

describe('BoardDataSource', () => {
  let dataSource: BoardDataSource;

  beforeEach(() => {
    apiMock.reset();
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
    dataSource = new BoardDataSource();
  });

  // ── fetchBoards ────────────────────────────────────────────────────────────

  describe('fetchBoards', () => {
    it('should return the full paginated response', async () => {
      const paginated: PaginatedResponse<Board> = {
        count: 1,
        next: null,
        previous: null,
        results: [board],
      };
      apiMock.onAny().reply(200, paginated);

      const result = await dataSource.fetchBoards(1);

      expect(result).toEqual(paginated);
    });

    it('should request the boards endpoint with the page query param', async () => {
      apiMock.onAny().reply(200, { count: 0, next: null, previous: null, results: [] });

      await dataSource.fetchBoards(2);

      expect(apiMock.history.get[0].url).toContain('/boards/?page=2');
    });

    it('should throw with the server detail message on error', async () => {
      apiMock.onAny().reply(401, { detail: 'Authentication credentials were not provided.' });

      await expect(dataSource.fetchBoards(1)).rejects.toThrow(
        'Authentication credentials were not provided.'
      );
    });

    it('should throw a default message when no detail is provided', async () => {
      apiMock.onAny().reply(500, {});

      await expect(dataSource.fetchBoards(1)).rejects.toThrow(
        'El servidor tuvo un problema. Intentá de nuevo en unos minutos.'
      );
    });
  });

  // ── fetchBoard ─────────────────────────────────────────────────────────────

  describe('fetchBoard', () => {
    it('should return the board on success', async () => {
      apiMock.onAny().reply(200, board);

      const result = await dataSource.fetchBoard(1);

      expect(result).toEqual(board);
    });

    it('should request the board detail endpoint', async () => {
      apiMock.onAny().reply(200, board);

      await dataSource.fetchBoard(1);

      expect(apiMock.history.get[0].url).toContain('/boards/1/');
    });

    it('should throw when the board does not exist', async () => {
      apiMock.onAny().reply(404, { detail: 'Not found.' });

      await expect(dataSource.fetchBoard(999)).rejects.toThrow('Not found.');
    });
  });

  // ── createBoard ────────────────────────────────────────────────────────────

  describe('createBoard', () => {
    const input: BoardInput = { name: 'New board', description: 'A description' };

    it('should return the created board', async () => {
      apiMock.onAny().reply(201, board);

      const result = await dataSource.createBoard(input);

      expect(result).toEqual(board);
    });

    it('should send a POST request with the board input', async () => {
      apiMock.onAny().reply(201, board);

      await dataSource.createBoard(input);

      const request = apiMock.history.post[0];
      expect(request.url).toContain('/boards/');
      expect(request.headers?.['Content-Type']).toContain('application/json');
      expect(request.data).toBe(JSON.stringify(input));
    });

    it('should throw with the field error message when present', async () => {
      apiMock.onAny().reply(400, { name: ['This field may not be blank.'] });

      await expect(dataSource.createBoard(input)).rejects.toThrow(
        'This field may not be blank.'
      );
    });

    it('should throw a default message when no specific error is provided', async () => {
      apiMock.onAny().reply(500, {});

      await expect(dataSource.createBoard(input)).rejects.toThrow(
        'El servidor tuvo un problema. Intentá de nuevo en unos minutos.'
      );
    });
  });

  // ── updateBoard ────────────────────────────────────────────────────────────

  describe('updateBoard', () => {
    const input: BoardInput = { name: 'Updated board', description: 'Updated description' };

    it('should return the updated board', async () => {
      apiMock.onAny().reply(200, { ...board, ...input });

      const result = await dataSource.updateBoard(1, input);

      expect(result).toEqual({ ...board, ...input });
    });

    it('should send a PATCH request to the board detail endpoint', async () => {
      apiMock.onAny().reply(200, board);

      await dataSource.updateBoard(1, input);

      const request = apiMock.history.patch[0];
      expect(request.url).toContain('/boards/1/');
      expect(request.data).toBe(JSON.stringify(input));
    });

    it('should throw when the user is not allowed to update the board', async () => {
      apiMock.onAny().reply(403, { detail: 'You do not have permission to perform this action.' });

      await expect(dataSource.updateBoard(1, input)).rejects.toThrow(
        'You do not have permission to perform this action.'
      );
    });
  });

  // ── deleteBoard ────────────────────────────────────────────────────────────

  describe('deleteBoard', () => {
    it('should resolve when the deletion succeeds', async () => {
      apiMock.onAny().reply(204);

      await expect(dataSource.deleteBoard(1)).resolves.toBeUndefined();
    });

    it('should send a DELETE request to the board detail endpoint', async () => {
      apiMock.onAny().reply(204);

      await dataSource.deleteBoard(1);

      expect(apiMock.history.delete[0].url).toContain('/boards/1/');
    });

    it('should throw a default message when the deletion fails', async () => {
      apiMock.onAny().reply(500, {});

      await expect(dataSource.deleteBoard(1)).rejects.toThrow(
        'El servidor tuvo un problema. Intentá de nuevo en unos minutos.'
      );
    });
  });
});
