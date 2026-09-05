import { GetTasksUseCase } from '@/domain/usecases/get-tasks';
import { TaskRepository } from '@/domain/repositories/task-repository';
import { Task } from '@/domain/models/task';
import { PaginatedResponse } from '@/domain/models/pagination';

const mockTaskRepository: jest.Mocked<TaskRepository> = {
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
const page: PaginatedResponse<Task> = { count: 1, next: null, previous: null, results: [task] };

describe('GetTasksUseCase', () => {
  let useCase: GetTasksUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetTasksUseCase(mockTaskRepository);
  });

  it('should call taskRepository.fetchTasks with the given token, board id, page and filters', async () => {
    mockTaskRepository.fetchTasks.mockResolvedValue(page);

    await useCase.execute('valid-token', 1, 1, { status: 2 });

    expect(mockTaskRepository.fetchTasks).toHaveBeenCalledWith('valid-token', 1, 1, { status: 2 });
  });

  it('should return the paginated response from the repository', async () => {
    mockTaskRepository.fetchTasks.mockResolvedValue(page);

    const result = await useCase.execute('valid-token', 1, 1);

    expect(result).toEqual(page);
  });

  it('should propagate errors thrown by the repository', async () => {
    mockTaskRepository.fetchTasks.mockRejectedValue(new Error('Token is expired.'));

    await expect(useCase.execute('expired-token', 1, 1)).rejects.toThrow('Token is expired.');
  });
});
