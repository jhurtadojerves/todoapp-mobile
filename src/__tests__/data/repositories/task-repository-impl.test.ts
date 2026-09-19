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
  boardId: 1,
  sprint: null,
  status: null,
  userId: 7,
  assignedToId: null,
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

    const result = await repository.fetchTasks(1, 1, { status: 2 });

    expect(mockDataSource.fetchTasks).toHaveBeenCalledWith(1, 1, { status: 2 });
    expect(result).toEqual(page);
  });

  it('should delegate fetchTask to the data source', async () => {
    mockDataSource.fetchTask.mockResolvedValue(task);

    const result = await repository.fetchTask(1);

    expect(mockDataSource.fetchTask).toHaveBeenCalledWith(1);
    expect(result).toEqual(task);
  });

  it('should delegate createTask to the data source', async () => {
    const input: TaskInput = {
      title: 'New task',
      description: '',
      statusId: null,
      sprintId: null,
      assignedToId: null,
    };
    mockDataSource.createTask.mockResolvedValue(task);

    const result = await repository.createTask(1, input);

    expect(mockDataSource.createTask).toHaveBeenCalledWith(1, input);
    expect(result).toEqual(task);
  });

  it('should delegate updateTask to the data source', async () => {
    const input: TaskInput = {
      title: 'Updated',
      description: '',
      statusId: null,
      sprintId: null,
      assignedToId: null,
    };
    mockDataSource.updateTask.mockResolvedValue(task);

    const result = await repository.updateTask(1, input);

    expect(mockDataSource.updateTask).toHaveBeenCalledWith(1, input);
    expect(result).toEqual(task);
  });

  it('should delegate deleteTask to the data source', async () => {
    mockDataSource.deleteTask.mockResolvedValue(undefined);

    await repository.deleteTask(1);

    expect(mockDataSource.deleteTask).toHaveBeenCalledWith(1);
  });

  it('should propagate errors from the data source', async () => {
    mockDataSource.fetchTasks.mockRejectedValue(new Error('Network error'));

    await expect(repository.fetchTasks(1, 1)).rejects.toThrow('Network error');
  });
});
