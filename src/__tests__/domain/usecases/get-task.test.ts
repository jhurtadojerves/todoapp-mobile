import { GetTaskUseCase } from '@/domain/usecases/get-task';
import { TaskRepository } from '@/domain/repositories/task-repository';
import { Task } from '@/domain/models/task';

const mockTaskRepository: jest.Mocked<TaskRepository> = {
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

describe('GetTaskUseCase', () => {
  let useCase: GetTaskUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetTaskUseCase(mockTaskRepository);
  });

  it('should call taskRepository.fetchTask with the given id', async () => {
    mockTaskRepository.fetchTask.mockResolvedValue(task);

    await useCase.execute(1);

    expect(mockTaskRepository.fetchTask).toHaveBeenCalledWith(1);
  });

  it('should return the task from the repository', async () => {
    mockTaskRepository.fetchTask.mockResolvedValue(task);

    const result = await useCase.execute(1);

    expect(result).toEqual(task);
  });

  it('should propagate errors thrown by the repository', async () => {
    mockTaskRepository.fetchTask.mockRejectedValue(new Error('Not found.'));

    await expect(useCase.execute(999)).rejects.toThrow('Not found.');
  });
});
