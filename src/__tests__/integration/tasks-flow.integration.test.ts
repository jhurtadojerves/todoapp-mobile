/**
 * Integration tests: Task usecases → TaskRepositoryImpl → TaskDataSource
 * Only `fetch` is mocked (the real external boundary).
 */
import { TaskDataSource } from '@/data/datasources/task-datasource';
import { TaskRepositoryImpl } from '@/data/repositories/task-repository-impl';
import { CreateTaskUseCase } from '@/domain/usecases/create-task';
import { DeleteTaskUseCase } from '@/domain/usecases/delete-task';
import { GetTaskUseCase } from '@/domain/usecases/get-task';
import { GetTasksUseCase } from '@/domain/usecases/get-tasks';
import { UpdateTaskUseCase } from '@/domain/usecases/update-task';
import { Task } from '@/domain/models/task';

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

function buildDependencies() {
  const dataSource = new TaskDataSource();
  const repository = new TaskRepositoryImpl(dataSource);
  return {
    getTasksUseCase: new GetTasksUseCase(repository),
    getTaskUseCase: new GetTaskUseCase(repository),
    createTaskUseCase: new CreateTaskUseCase(repository),
    updateTaskUseCase: new UpdateTaskUseCase(repository),
    deleteTaskUseCase: new DeleteTaskUseCase(repository),
  };
}

const task1: Task = {
  id: 1,
  board_id: 1,
  sprint: null,
  status: { id: 1, name: 'To Do', color: '#64748b' },
  user_id: 7,
  assigned_to_id: null,
  title: 'Fix the login bug',
  description: '',
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-01T00:00:00Z',
};

const task2: Task = {
  id: 2,
  board_id: 1,
  sprint: { id: 1, name: 'Sprint 1' },
  status: null,
  user_id: 7,
  assigned_to_id: 3,
  title: 'Write onboarding docs',
  description: 'Cover the register flow',
  created: '2026-01-02T00:00:00Z',
  modified: '2026-01-02T00:00:00Z',
};

describe('Tasks flow (integration)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should list the first page of tasks', async () => {
    const { getTasksUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(
      mockResponse(200, { count: 2, next: 'http://api/tasks/?page=2', previous: null, results: [task1, task2] })
    );

    const result = await getTasksUseCase.execute('valid-token', 1, 1);

    expect(result.results).toEqual([task1, task2]);
    expect(result.next).toBe('http://api/tasks/?page=2');
  });

  it('should filter tasks by status/sprint/assigned_to', async () => {
    const { getTasksUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(
      mockResponse(200, { count: 1, next: null, previous: null, results: [task1] })
    );

    const result = await getTasksUseCase.execute('valid-token', 1, 1, { status: 1 });

    expect(result.results).toEqual([task1]);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('status=1'),
      expect.anything()
    );
  });

  it('should create a task with only a title', async () => {
    const { createTaskUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(mockResponse(201, task1));

    const result = await createTaskUseCase.execute('valid-token', 1, {
      title: task1.title,
      description: '',
      status_id: null,
      sprint_id: null,
      assigned_to_id: null,
    });

    expect(result).toEqual(task1);
  });

  it('should fetch a single task by id', async () => {
    const { getTaskUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(mockResponse(200, task2));

    const result = await getTaskUseCase.execute('valid-token', 2);

    expect(result).toEqual(task2);
  });

  it('should update a task', async () => {
    const { updateTaskUseCase } = buildDependencies();
    const updated = { ...task1, title: 'Fix the login bug (urgent)' };
    mockFetch.mockResolvedValue(mockResponse(200, updated));

    const result = await updateTaskUseCase.execute('valid-token', 1, {
      title: 'Fix the login bug (urgent)',
      description: '',
      status_id: 1,
      sprint_id: null,
      assigned_to_id: null,
    });

    expect(result).toEqual(updated);
  });

  it('should delete a task', async () => {
    const { deleteTaskUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(mockResponse(204, null));

    await expect(deleteTaskUseCase.execute('valid-token', 1)).resolves.toBeUndefined();
  });
});
