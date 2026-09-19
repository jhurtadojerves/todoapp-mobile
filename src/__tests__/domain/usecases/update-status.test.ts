import { UpdateStatusUseCase } from '@/domain/usecases/update-status';
import { StatusRepository } from '@/domain/repositories/status-repository';
import { BoardStatus, BoardStatusInput } from '@/domain/models/status';

const mockStatusRepository: jest.Mocked<StatusRepository> = {
  fetchStatuses: jest.fn(),
  createStatus: jest.fn(),
  updateStatus: jest.fn(),
  deleteStatus: jest.fn(),
};

const boardStatus: BoardStatus = { id: 1, name: 'Done', order: 2, color: '#22c55e' };

describe('UpdateStatusUseCase', () => {
  let useCase: UpdateStatusUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateStatusUseCase(mockStatusRepository);
  });

  it('should call statusRepository.updateStatus with the given board id, status id and input', async () => {
    const input: BoardStatusInput = { name: 'Done', order: 2, color: '#22c55e' };
    mockStatusRepository.updateStatus.mockResolvedValue(boardStatus);

    await useCase.execute(1, 1, input);

    expect(mockStatusRepository.updateStatus).toHaveBeenCalledWith(1, 1, input);
  });

  it('should return the updated status from the repository', async () => {
    const input: BoardStatusInput = { name: 'Done', order: 2, color: '#22c55e' };
    mockStatusRepository.updateStatus.mockResolvedValue(boardStatus);

    const result = await useCase.execute(1, 1, input);

    expect(result).toEqual(boardStatus);
  });

  it('should propagate errors thrown by the repository', async () => {
    const input: BoardStatusInput = { name: 'Done', order: 2, color: '#22c55e' };
    mockStatusRepository.updateStatus.mockRejectedValue(
      new Error('You do not have permission to perform this action.')
    );

    await expect(useCase.execute(1, 1, input)).rejects.toThrow(
      'You do not have permission to perform this action.'
    );
  });
});
