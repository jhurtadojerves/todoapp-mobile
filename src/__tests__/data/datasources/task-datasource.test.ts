import { TaskDataSource } from '@/data/datasources/task-datasource';
import { Task, TaskInput } from '@/domain/models/task';
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

const task: Task = {
  id: 1,
  board_id: 1,
  sprint: null,
  status: null,
  user_id: 7,
  assigned_to_id: null,
  title: 'Fix the bug',
  description: 'Steps to reproduce...',
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-01T00:00:00Z',
};

describe('TaskDataSource', () => {
  let dataSource: TaskDataSource;

  beforeEach(() => {
    jest.clearAllMocks();
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
      mockFetch.mockResolvedValue(mockResponse(200, paginated));

      const result = await dataSource.fetchTasks('valid-token', 1, 1);

      expect(result).toEqual(paginated);
    });

    it('should request the tasks endpoint with the page query param', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, { count: 0, next: null, previous: null, results: [] }));

      await dataSource.fetchTasks('valid-token', 1, 2);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/boards/1/tasks/?page=2'),
        expect.objectContaining({ headers: { Authorization: 'Bearer valid-token' } })
      );
    });

    it('should append status/sprint/assigned_to filters when provided', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, { count: 0, next: null, previous: null, results: [] }));

      await dataSource.fetchTasks('valid-token', 1, 1, { status: 5, sprint: 9, assigned_to: 3 });

      const [calledUrl] = mockFetch.mock.calls[0];
      expect(calledUrl).toContain('page=1');
      expect(calledUrl).toContain('status=5');
      expect(calledUrl).toContain('sprint=9');
      expect(calledUrl).toContain('assigned_to=3');
    });

    it('should throw a default message when the request fails', async () => {
      mockFetch.mockResolvedValue(mockResponse(500, {}));

      await expect(dataSource.fetchTasks('valid-token', 1, 1)).rejects.toThrow(
        'Ocurrió un error inesperado. Intentá de nuevo.'
      );
    });
  });

  // ── fetchTask ──────────────────────────────────────────────────────────────

  describe('fetchTask', () => {
    it('should return the task on success', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, task));

      const result = await dataSource.fetchTask('valid-token', 1);

      expect(result).toEqual(task);
    });

    it('should request the task detail endpoint', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, task));

      await dataSource.fetchTask('valid-token', 1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/1/'),
        expect.objectContaining({ headers: { Authorization: 'Bearer valid-token' } })
      );
    });

    it('should throw when the task does not exist', async () => {
      mockFetch.mockResolvedValue(mockResponse(404, {}));

      await expect(dataSource.fetchTask('valid-token', 999)).rejects.toThrow(
        'No existe o no tenés acceso a este recurso.'
      );
    });
  });

  // ── createTask ─────────────────────────────────────────────────────────────

  describe('createTask', () => {
    const input: TaskInput = {
      title: 'New task',
      description: '',
      status_id: null,
      sprint_id: null,
      assigned_to_id: null,
    };

    it('should return the created task', async () => {
      mockFetch.mockResolvedValue(mockResponse(201, task));

      const result = await dataSource.createTask('valid-token', 1, input);

      expect(result).toEqual(task);
    });

    it('should send a POST request with the task input', async () => {
      mockFetch.mockResolvedValue(mockResponse(201, task));

      await dataSource.createTask('valid-token', 1, input);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/boards/1/tasks/'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer valid-token' },
          body: JSON.stringify(input),
        })
      );
    });

    it('should throw with the field error message when present', async () => {
      mockFetch.mockResolvedValue(mockResponse(400, { title: ['This field may not be blank.'] }));

      await expect(dataSource.createTask('valid-token', 1, input)).rejects.toThrow(
        'This field may not be blank.'
      );
    });
  });

  // ── updateTask ─────────────────────────────────────────────────────────────

  describe('updateTask', () => {
    const input: TaskInput = {
      title: 'Updated title',
      description: 'Updated description',
      status_id: 2,
      sprint_id: null,
      assigned_to_id: null,
    };

    it('should return the updated task', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, { ...task, title: 'Updated title' }));

      const result = await dataSource.updateTask('valid-token', 1, input);

      expect(result).toEqual({ ...task, title: 'Updated title' });
    });

    it('should send a PATCH request to the task detail endpoint', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, task));

      await dataSource.updateTask('valid-token', 1, input);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/1/'),
        expect.objectContaining({ method: 'PATCH', body: JSON.stringify(input) })
      );
    });

    it('should throw a permission error when the user cannot update the task', async () => {
      mockFetch.mockResolvedValue(
        mockResponse(403, { detail: 'You do not have permission to perform this action.' })
      );

      await expect(dataSource.updateTask('valid-token', 1, input)).rejects.toThrow(
        'You do not have permission to perform this action.'
      );
    });
  });

  // ── deleteTask ─────────────────────────────────────────────────────────────

  describe('deleteTask', () => {
    it('should resolve when the deletion succeeds', async () => {
      mockFetch.mockResolvedValue(mockResponse(204, null));

      await expect(dataSource.deleteTask('valid-token', 1)).resolves.toBeUndefined();
    });

    it('should send a DELETE request to the task detail endpoint', async () => {
      mockFetch.mockResolvedValue(mockResponse(204, null));

      await dataSource.deleteTask('valid-token', 1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/1/'),
        expect.objectContaining({ method: 'DELETE', headers: { Authorization: 'Bearer valid-token' } })
      );
    });
  });
});
