import MockAdapter from 'axios-mock-adapter';

import { TaskDataSource } from '@/data/datasources/task-datasource';
import { Task, TaskInput } from '@/domain/models/task';
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

const task: Task = {
  id: 1,
  boardId: 1,
  sprint: null,
  status: null,
  userId: 7,
  assignedToId: null,
  title: 'Fix the bug',
  description: 'Steps to reproduce...',
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-01T00:00:00Z',
};

describe('TaskDataSource', () => {
  let dataSource: TaskDataSource;

  beforeEach(() => {
    apiMock.reset();
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
    dataSource = new TaskDataSource();
  });

  // ── fetchTasks ─────────────────────────────────────────────────────────────

  describe('fetchTasks', () => {
    it('should return the full paginated response', async () => {
      const paginated: PaginatedResponse<Task> = {
        count: 1,
        next: null,
        previous: null,
        results: [task],
      };
      apiMock.onAny().reply(200, paginated);

      const result = await dataSource.fetchTasks(1, 1);

      expect(result).toEqual(paginated);
    });

    it('should request the tasks endpoint with the page query param', async () => {
      apiMock.onAny().reply(200, { count: 0, next: null, previous: null, results: [] });

      await dataSource.fetchTasks(1, 2);

      expect(apiMock.history.get[0].url).toContain('/boards/1/tasks/?page=2');
    });

    it('should append status/sprint/assigned_to filters when provided', async () => {
      apiMock.onAny().reply(200, { count: 0, next: null, previous: null, results: [] });

      await dataSource.fetchTasks(1, 1, { status: 5, sprint: 9, assignedTo: 3 });

      const calledUrl = apiMock.history.get[0].url;
      expect(calledUrl).toContain('page=1');
      expect(calledUrl).toContain('status=5');
      expect(calledUrl).toContain('sprint=9');
      expect(calledUrl).toContain('assigned_to=3');
    });

    it('should throw a default message when the request fails', async () => {
      apiMock.onAny().reply(500, {});

      await expect(dataSource.fetchTasks(1, 1)).rejects.toThrow(
        'El servidor tuvo un problema. Intentá de nuevo en unos minutos.'
      );
    });
  });

  // ── fetchTask ──────────────────────────────────────────────────────────────

  describe('fetchTask', () => {
    it('should return the task on success', async () => {
      apiMock.onAny().reply(200, task);

      const result = await dataSource.fetchTask(1);

      expect(result).toEqual(task);
    });

    it('should request the task detail endpoint', async () => {
      apiMock.onAny().reply(200, task);

      await dataSource.fetchTask(1);

      expect(apiMock.history.get[0].url).toContain('/tasks/1/');
    });

    it('should throw when the task does not exist', async () => {
      apiMock.onAny().reply(404, {});

      await expect(dataSource.fetchTask(999)).rejects.toThrow(
        'No existe o no tenés acceso a este recurso.'
      );
    });
  });

  // ── createTask ─────────────────────────────────────────────────────────────

  describe('createTask', () => {
    const input: TaskInput = {
      title: 'New task',
      description: '',
      statusId: null,
      sprintId: null,
      assignedToId: null,
    };

    it('should return the created task', async () => {
      apiMock.onAny().reply(201, task);

      const result = await dataSource.createTask(1, input);

      expect(result).toEqual(task);
    });

    it('should send a POST request with the task input', async () => {
      apiMock.onAny().reply(201, task);

      await dataSource.createTask(1, input);

      const request = apiMock.history.post[0];
      expect(request.url).toContain('/boards/1/tasks/');
      expect(request.headers?.['Content-Type']).toContain('application/json');
      expect(request.data).toBe(JSON.stringify(deepKeysToSnake(input)));
    });

    it('should throw with the field error message when present', async () => {
      apiMock.onAny().reply(400, { title: ['This field may not be blank.'] });

      await expect(dataSource.createTask(1, input)).rejects.toThrow(
        'This field may not be blank.'
      );
    });
  });

  // ── updateTask ─────────────────────────────────────────────────────────────

  describe('updateTask', () => {
    const input: TaskInput = {
      title: 'Updated title',
      description: 'Updated description',
      statusId: 2,
      sprintId: null,
      assignedToId: null,
    };

    it('should return the updated task', async () => {
      apiMock.onAny().reply(200, { ...task, title: 'Updated title' });

      const result = await dataSource.updateTask(1, input);

      expect(result).toEqual({ ...task, title: 'Updated title' });
    });

    it('should send a PATCH request to the task detail endpoint', async () => {
      apiMock.onAny().reply(200, task);

      await dataSource.updateTask(1, input);

      const request = apiMock.history.patch[0];
      expect(request.url).toContain('/tasks/1/');
      expect(request.data).toBe(JSON.stringify(deepKeysToSnake(input)));
    });

    it('should throw a permission error when the user cannot update the task', async () => {
      apiMock.onAny().reply(403, { detail: 'You do not have permission to perform this action.' });

      await expect(dataSource.updateTask(1, input)).rejects.toThrow(
        'You do not have permission to perform this action.'
      );
    });
  });

  // ── deleteTask ─────────────────────────────────────────────────────────────

  describe('deleteTask', () => {
    it('should resolve when the deletion succeeds', async () => {
      apiMock.onAny().reply(204);

      await expect(dataSource.deleteTask(1)).resolves.toBeUndefined();
    });

    it('should send a DELETE request to the task detail endpoint', async () => {
      apiMock.onAny().reply(204);

      await dataSource.deleteTask(1);

      expect(apiMock.history.delete[0].url).toContain('/tasks/1/');
    });
  });
});
