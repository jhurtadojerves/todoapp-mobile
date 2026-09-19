import MockAdapter from 'axios-mock-adapter';

import { StatusDataSource } from '@/data/datasources/status-datasource';
import { BoardStatus, BoardStatusInput } from '@/domain/models/status';
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

const boardStatus: BoardStatus = { id: 1, name: 'To Do', order: 0, color: '#64748b' };

describe('StatusDataSource', () => {
  let dataSource: StatusDataSource;

  beforeEach(() => {
    apiMock.reset();
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
    dataSource = new StatusDataSource();
  });

  // ── fetchStatuses ──────────────────────────────────────────────────────────

  describe('fetchStatuses', () => {
    it('should return the full paginated response', async () => {
      const paginated: PaginatedResponse<BoardStatus> = {
        count: 1,
        next: null,
        previous: null,
        results: [boardStatus],
      };
      apiMock.onAny().reply(200, paginated);

      const result = await dataSource.fetchStatuses(1, 1);

      expect(result).toEqual(paginated);
    });

    it('should request the statuses endpoint with the page query param', async () => {
      apiMock.onAny().reply(200, { count: 0, next: null, previous: null, results: [] });

      await dataSource.fetchStatuses(1, 2);

      expect(apiMock.history.get[0].url).toContain('/boards/1/statuses/?page=2');
    });

    it('should throw a default message when no detail is provided', async () => {
      apiMock.onAny().reply(500, {});

      await expect(dataSource.fetchStatuses(1, 1)).rejects.toThrow(
        'El servidor tuvo un problema. Intentá de nuevo en unos minutos.'
      );
    });
  });

  // ── createStatus ───────────────────────────────────────────────────────────

  describe('createStatus', () => {
    const input: BoardStatusInput = { name: 'To Do', order: 0, color: '#64748b' };

    it('should return the created status', async () => {
      apiMock.onAny().reply(201, boardStatus);

      const result = await dataSource.createStatus(1, input);

      expect(result).toEqual(boardStatus);
    });

    it('should send a POST request with the status input', async () => {
      apiMock.onAny().reply(201, boardStatus);

      await dataSource.createStatus(1, input);

      const request = apiMock.history.post[0];
      expect(request.url).toContain('/boards/1/statuses/');
      expect(request.headers?.['Content-Type']).toContain('application/json');
      expect(request.data).toBe(JSON.stringify(input));
    });

    it('should throw with the field error message when present', async () => {
      apiMock.onAny().reply(400, { name: ['This field may not be blank.'] });

      await expect(dataSource.createStatus(1, input)).rejects.toThrow(
        'This field may not be blank.'
      );
    });
  });

  // ── updateStatus ───────────────────────────────────────────────────────────

  describe('updateStatus', () => {
    const input: BoardStatusInput = { name: 'In Progress', order: 1, color: '#3b82f6' };

    it('should return the updated status', async () => {
      apiMock.onAny().reply(200, { ...boardStatus, ...input });

      const result = await dataSource.updateStatus(1, 1, input);

      expect(result).toEqual({ ...boardStatus, ...input });
    });

    it('should send a PATCH request to the status detail endpoint', async () => {
      apiMock.onAny().reply(200, boardStatus);

      await dataSource.updateStatus(1, 1, input);

      const request = apiMock.history.patch[0];
      expect(request.url).toContain('/boards/1/statuses/1/');
      expect(request.data).toBe(JSON.stringify(input));
    });

    it('should throw when the user is not allowed to update the status', async () => {
      apiMock.onAny().reply(403, { detail: 'You do not have permission to perform this action.' });

      await expect(dataSource.updateStatus(1, 1, input)).rejects.toThrow(
        'You do not have permission to perform this action.'
      );
    });
  });

  // ── deleteStatus ───────────────────────────────────────────────────────────

  describe('deleteStatus', () => {
    it('should resolve when the deletion succeeds', async () => {
      apiMock.onAny().reply(204);

      await expect(dataSource.deleteStatus(1, 1)).resolves.toBeUndefined();
    });

    it('should send a DELETE request to the status detail endpoint', async () => {
      apiMock.onAny().reply(204);

      await dataSource.deleteStatus(1, 1);

      expect(apiMock.history.delete[0].url).toContain('/boards/1/statuses/1/');
    });

    it('should throw a default message when the deletion fails', async () => {
      apiMock.onAny().reply(500, {});

      await expect(dataSource.deleteStatus(1, 1)).rejects.toThrow(
        'El servidor tuvo un problema. Intentá de nuevo en unos minutos.'
      );
    });
  });
});
