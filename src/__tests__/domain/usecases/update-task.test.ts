import { UpdateTaskUseCase } from '@/domain/usecases/update-task';
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
  boardId: 1,
  sprint: null,
  status: { id: 2, name: 'Done', color: '#22c55e' },
  userId: 7,
  assignedToId: null,
  title: 'Updated title',
  description: '',
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-02T00:00:00Z',
};

describe('UpdateTaskUseCase', () => {
  let useCase: UpdateTaskUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateTaskUseCase(mockTaskRepository);
  });

  it('should call taskRepository.updateTask with the given id and input', async () => {
    const input: TaskInput = {
      title: 'Updated title',
      description: '',
      statusId: 2,
      sprintId: null,
      assignedToId: null,
    };
    mockTaskRepository.updateTask.mockResolvedValue(task);

    await useCase.execute(1, input);

    expect(mockTaskRepository.updateTask).toHaveBeenCalledWith(1, input);
  });

  it('should return the updated task from the repository', async () => {
    const input: TaskInput = {
      title: 'Updated title',
      description: '',
      statusId: 2,
      sprintId: null,
      assignedToId: null,
    };
    mockTaskRepository.updateTask.mockResolvedValue(task);

    const result = await useCase.execute(1, input);

    expect(result).toEqual(task);
  });

  it('should propagate errors thrown by the repository', async () => {
    const input: TaskInput = {
      title: 'Updated title',
      description: '',
      statusId: null,
      sprintId: null,
      assignedToId: null,
    };
    mockTaskRepository.updateTask.mockRejectedValue(
      new Error('You do not have permission to perform this action.')
    );

    await expect(useCase.execute(1, input)).rejects.toThrow(
      'You do not have permission to perform this action.'
    );
  });
});
