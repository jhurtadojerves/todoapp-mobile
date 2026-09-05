import { DeleteSprintUseCase } from '@/domain/usecases/delete-sprint';
import { SprintRepository } from '@/domain/repositories/sprint-repository';

const mockSprintRepository: jest.Mocked<SprintRepository> = {
  fetchSprints: jest.fn(),
  createSprint: jest.fn(),
  updateSprint: jest.fn(),
  deleteSprint: jest.fn(),
};

describe('DeleteSprintUseCase', () => {
  let useCase: DeleteSprintUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new DeleteSprintUseCase(mockSprintRepository);
  });

  it('should call sprintRepository.deleteSprint with the given token, board id and sprint id', async () => {
    mockSprintRepository.deleteSprint.mockResolvedValue(undefined);

    await useCase.execute('valid-token', 1, 1);

    expect(mockSprintRepository.deleteSprint).toHaveBeenCalledWith('valid-token', 1, 1);
  });

  it('should propagate errors thrown by the repository', async () => {
    mockSprintRepository.deleteSprint.mockRejectedValue(
      new Error('You do not have permission to perform this action.')
    );

    await expect(useCase.execute('valid-token', 1, 1)).rejects.toThrow(
      'You do not have permission to perform this action.'
    );
  });
});
