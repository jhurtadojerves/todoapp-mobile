import { CreateTaskUseCase } from '@/domain/usecases/create-task';
import { TaskRepository } from '@/domain/repositories/task-repository';
import { Task, TaskInput } from '@/domain/models/task';

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
  title: 'New task',
  description: '',
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-01T00:00:00Z',
};

describe('CreateTaskUseCase', () => {
  let useCase: CreateTaskUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateTaskUseCase(mockTaskRepository);
  });

  it('should call taskRepository.createTask with the given token, board id and input', async () => {
    const input: TaskInput = {
      title: 'New task',
      description: '',
      status_id: null,
      sprint_id: null,
      assigned_to_id: null,
    };
    mockTaskRepository.createTask.mockResolvedValue(task);

    await useCase.execute('valid-token', 1, input);

    expect(mockTaskRepository.createTask).toHaveBeenCalledWith('valid-token', 1, input);
  });

  it('should return the created task from the repository', async () => {
    const input: TaskInput = {
      title: 'New task',
      description: '',
      status_id: null,
      sprint_id: null,
      assigned_to_id: null,
    };
    mockTaskRepository.createTask.mockResolvedValue(task);

    const result = await useCase.execute('valid-token', 1, input);

    expect(result).toEqual(task);
  });

  it('should propagate errors thrown by the repository', async () => {
    const input: TaskInput = {
      title: '',
      description: '',
      status_id: null,
      sprint_id: null,
      assigned_to_id: null,
    };
    mockTaskRepository.createTask.mockRejectedValue(new Error('This field may not be blank.'));

    await expect(useCase.execute('valid-token', 1, input)).rejects.toThrow(
      'This field may not be blank.'
    );
  });
});
