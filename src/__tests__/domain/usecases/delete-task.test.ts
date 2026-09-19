import { DeleteTaskUseCase } from '@/domain/usecases/delete-task';
import { TaskRepository } from '@/domain/repositories/task-repository';

const mockTaskRepository: jest.Mocked<TaskRepository> = {
  fetchTasks: jest.fn(),
  fetchTask: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
};

describe('DeleteTaskUseCase', () => {
  let useCase: DeleteTaskUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new DeleteTaskUseCase(mockTaskRepository);
  });

  it('should call taskRepository.deleteTask with the given id', async () => {
    mockTaskRepository.deleteTask.mockResolvedValue(undefined);

    await useCase.execute(1);

    expect(mockTaskRepository.deleteTask).toHaveBeenCalledWith(1);
  });

  it('should propagate errors thrown by the repository', async () => {
    mockTaskRepository.deleteTask.mockRejectedValue(
      new Error('You do not have permission to perform this action.')
    );

    await expect(useCase.execute(1)).rejects.toThrow(
      'You do not have permission to perform this action.'
    );
  });
});
