import { TaskRepositoryImpl } from '@/data/repositories/task-repository-impl';
import { TaskDataSource } from '@/data/datasources/task-datasource';
import { Task, TaskInput } from '@/domain/models/task';
import { PaginatedResponse } from '@/domain/models/pagination';

const mockDataSource: jest.Mocked<TaskDataSource> = {
  fetchTasks: jest.fn(),
  fetchTask: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
};

const task: Task = {
  id: 1,
  board_id: 1,
  sprint: null,
  status: null,
  user_id: 7,
  assigned_to_id: null,
  title: 'Fix the bug',
  description: '',
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-01T00:00:00Z',
};

describe('TaskRepositoryImpl', () => {
  let repository: TaskRepositoryImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new TaskRepositoryImpl(mockDataSource);
  });

  it('should delegate fetchTasks to the data source', async () => {
    const page: PaginatedResponse<Task> = { count: 1, next: null, previous: null, results: [task] };
    mockDataSource.fetchTasks.mockResolvedValue(page);

    const result = await repository.fetchTasks('valid-token', 1, 1, { status: 2 });

    expect(mockDataSource.fetchTasks).toHaveBeenCalledWith('valid-token', 1, 1, { status: 2 });
    expect(result).toEqual(page);
  });

  it('should delegate fetchTask to the data source', async () => {
    mockDataSource.fetchTask.mockResolvedValue(task);

    const result = await repository.fetchTask('valid-token', 1);

    expect(mockDataSource.fetchTask).toHaveBeenCalledWith('valid-token', 1);
    expect(result).toEqual(task);
  });

  it('should delegate createTask to the data source', async () => {
    const input: TaskInput = {
      title: 'New task',
      description: '',
      status_id: null,
      sprint_id: null,
      assigned_to_id: null,
    };
    mockDataSource.createTask.mockResolvedValue(task);

    const result = await repository.createTask('valid-token', 1, input);

    expect(mockDataSource.createTask).toHaveBeenCalledWith('valid-token', 1, input);
    expect(result).toEqual(task);
  });

  it('should delegate updateTask to the data source', async () => {
    const input: TaskInput = {
      title: 'Updated',
      description: '',
      status_id: null,
      sprint_id: null,
      assigned_to_id: null,
    };
    mockDataSource.updateTask.mockResolvedValue(task);

    const result = await repository.updateTask('valid-token', 1, input);

    expect(mockDataSource.updateTask).toHaveBeenCalledWith('valid-token', 1, input);
    expect(result).toEqual(task);
  });

  it('should delegate deleteTask to the data source', async () => {
    mockDataSource.deleteTask.mockResolvedValue(undefined);

    await repository.deleteTask('valid-token', 1);

    expect(mockDataSource.deleteTask).toHaveBeenCalledWith('valid-token', 1);
  });

  it('should propagate errors from the data source', async () => {
    mockDataSource.fetchTasks.mockRejectedValue(new Error('Network error'));

    await expect(repository.fetchTasks('some-token', 1, 1)).rejects.toThrow('Network error');
  });
});
