import { DeleteStatusUseCase } from '@/domain/usecases/delete-status';
import { StatusRepository } from '@/domain/repositories/status-repository';

const mockStatusRepository: jest.Mocked<StatusRepository> = {
  fetchStatuses: jest.fn(),
  createStatus: jest.fn(),
  updateStatus: jest.fn(),
  deleteStatus: jest.fn(),
};

describe('DeleteStatusUseCase', () => {
  let useCase: DeleteStatusUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new DeleteStatusUseCase(mockStatusRepository);
  });

  it('should call statusRepository.deleteStatus with the given board id and status id', async () => {
    mockStatusRepository.deleteStatus.mockResolvedValue(undefined);

    await useCase.execute(1, 1);

    expect(mockStatusRepository.deleteStatus).toHaveBeenCalledWith(1, 1);
  });

  it('should propagate errors thrown by the repository', async () => {
    mockStatusRepository.deleteStatus.mockRejectedValue(
      new Error('You do not have permission to perform this action.')
    );

    await expect(useCase.execute(1, 1)).rejects.toThrow(
      'You do not have permission to perform this action.'
    );
  });
});
