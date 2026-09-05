import { CreateStatusUseCase } from '@/domain/usecases/create-status';
import { StatusRepository } from '@/domain/repositories/status-repository';
import { BoardStatus, BoardStatusInput } from '@/domain/models/status';

const mockStatusRepository: jest.Mocked<StatusRepository> = {
  fetchStatuses: jest.fn(),
  createStatus: jest.fn(),
  updateStatus: jest.fn(),
  deleteStatus: jest.fn(),
};

const boardStatus: BoardStatus = { id: 1, name: 'To Do', order: 0, color: '#64748b' };

describe('CreateStatusUseCase', () => {
  let useCase: CreateStatusUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateStatusUseCase(mockStatusRepository);
  });

  it('should call statusRepository.createStatus with the given token, board id and input', async () => {
    const input: BoardStatusInput = { name: 'To Do', order: 0, color: '#64748b' };
    mockStatusRepository.createStatus.mockResolvedValue(boardStatus);

    await useCase.execute('valid-token', 1, input);

    expect(mockStatusRepository.createStatus).toHaveBeenCalledWith('valid-token', 1, input);
  });

  it('should return the created status from the repository', async () => {
    const input: BoardStatusInput = { name: 'To Do', order: 0, color: '#64748b' };
    mockStatusRepository.createStatus.mockResolvedValue(boardStatus);

    const result = await useCase.execute('valid-token', 1, input);

    expect(result).toEqual(boardStatus);
  });

  it('should propagate errors thrown by the repository', async () => {
    const input: BoardStatusInput = { name: '', order: 0, color: '' };
    mockStatusRepository.createStatus.mockRejectedValue(new Error('This field may not be blank.'));

    await expect(useCase.execute('valid-token', 1, input)).rejects.toThrow(
      'This field may not be blank.'
    );
  });
});
