import MockAdapter from 'axios-mock-adapter';

import { SprintDataSource } from '@/data/datasources/sprint-datasource';
import { Sprint, SprintInput } from '@/domain/models/sprint';
import { PaginatedResponse } from '@/domain/models/pagination';
import { apiClient } from '@/shared/api/http-client';
import { storage } from '@/shared/utils/storage';
import { deepKeysToSnake } from '@/shared/utils/case-convert';

jest.mock('@/shared/utils/storage', () => ({
  storage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    deleteItem: jest.fn(),
  },
}));

const apiMock = new MockAdapter(apiClient);

const mockGetItem = storage.getItem as jest.Mock;

const sprint: Sprint = {
  id: 1,
  name: 'Sprint 1',
  startDate: '2026-01-01',
  endDate: '2026-01-14',
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-01T00:00:00Z',
};

describe('SprintDataSource', () => {
  let dataSource: SprintDataSource;

  beforeEach(() => {
    apiMock.reset();
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
    dataSource = new SprintDataSource();
  });

  // ── fetchSprints ───────────────────────────────────────────────────────────

  describe('fetchSprints', () => {
    it('should return the full paginated response', async () => {
      const paginated: PaginatedResponse<Sprint> = {
        count: 1,
        next: null,
        previous: null,
        results: [sprint],
      };
      apiMock.onAny().reply(200, paginated);

      const result = await dataSource.fetchSprints(1, 1);

      expect(result).toEqual(paginated);
    });

    it('should request the sprints endpoint with the page query param', async () => {
      apiMock.onAny().reply(200, { count: 0, next: null, previous: null, results: [] });

      await dataSource.fetchSprints(1, 2);

      expect(apiMock.history.get[0].url).toContain('/boards/1/sprints/?page=2');
    });

    it('should throw a default message when no detail is provided', async () => {
      apiMock.onAny().reply(500, {});

      await expect(dataSource.fetchSprints(1, 1)).rejects.toThrow(
        'El servidor tuvo un problema. Intentá de nuevo en unos minutos.'
      );
    });
  });

  // ── createSprint ───────────────────────────────────────────────────────────

  describe('createSprint', () => {
    const input: SprintInput = { name: 'Sprint 1', startDate: '2026-01-01', endDate: '2026-01-14' };

    it('should return the created sprint', async () => {
      apiMock.onAny().reply(201, sprint);

      const result = await dataSource.createSprint(1, input);

      expect(result).toEqual(sprint);
    });

    it('should send a POST request with the sprint input', async () => {
      apiMock.onAny().reply(201, sprint);

      await dataSource.createSprint(1, input);

      const request = apiMock.history.post[0];
      expect(request.url).toContain('/boards/1/sprints/');
      expect(request.headers?.['Content-Type']).toContain('application/json');
      expect(request.data).toBe(JSON.stringify(deepKeysToSnake(input)));
    });

    it('should throw with the field error message when present', async () => {
      apiMock.onAny().reply(400, { name: ['This field may not be blank.'] });

      await expect(dataSource.createSprint(1, input)).rejects.toThrow(
        'This field may not be blank.'
      );
    });
  });

  // ── updateSprint ───────────────────────────────────────────────────────────

  describe('updateSprint', () => {
    const input: SprintInput = { name: 'Sprint 1 renamed', startDate: null, endDate: null };

    it('should return the updated sprint', async () => {
      apiMock.onAny().reply(200, { ...sprint, ...input });

      const result = await dataSource.updateSprint(1, 1, input);

      expect(result).toEqual({ ...sprint, ...input });
    });

    it('should send a PATCH request to the sprint detail endpoint', async () => {
      apiMock.onAny().reply(200, sprint);

      await dataSource.updateSprint(1, 1, input);

      const request = apiMock.history.patch[0];
      expect(request.url).toContain('/boards/1/sprints/1/');
      expect(request.data).toBe(JSON.stringify(deepKeysToSnake(input)));
    });

    it('should throw when the user is not allowed to update the sprint', async () => {
      apiMock.onAny().reply(403, { detail: 'You do not have permission to perform this action.' });

      await expect(dataSource.updateSprint(1, 1, input)).rejects.toThrow(
        'You do not have permission to perform this action.'
      );
    });
  });

  // ── deleteSprint ───────────────────────────────────────────────────────────

  describe('deleteSprint', () => {
    it('should resolve when the deletion succeeds', async () => {
      apiMock.onAny().reply(204);

      await expect(dataSource.deleteSprint(1, 1)).resolves.toBeUndefined();
    });

    it('should send a DELETE request to the sprint detail endpoint', async () => {
      apiMock.onAny().reply(204);

      await dataSource.deleteSprint(1, 1);

      expect(apiMock.history.delete[0].url).toContain('/boards/1/sprints/1/');
    });

    it('should throw a default message when the deletion fails', async () => {
      apiMock.onAny().reply(500, {});

      await expect(dataSource.deleteSprint(1, 1)).rejects.toThrow(
        'El servidor tuvo un problema. Intentá de nuevo en unos minutos.'
      );
    });
  });
});
