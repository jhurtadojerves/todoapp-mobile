import { GetStatusesUseCase } from '@/domain/usecases/get-statuses';
import { StatusRepository } from '@/domain/repositories/status-repository';
import { BoardStatus } from '@/domain/models/status';

const mockStatusRepository: jest.Mocked<StatusRepository> = {
  fetchStatuses: jest.fn(),
  createStatus: jest.fn(),
  updateStatus: jest.fn(),
  deleteStatus: jest.fn(),
};

const statuses: BoardStatus[] = [{ id: 1, name: 'To Do', order: 0, color: '#64748b' }];

describe('GetStatusesUseCase', () => {
  let useCase: GetStatusesUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetStatusesUseCase(mockStatusRepository);
  });

  it('should call statusRepository.fetchStatuses with the given token and board id', async () => {
    mockStatusRepository.fetchStatuses.mockResolvedValue(statuses);

    await useCase.execute('valid-token', 1);

    expect(mockStatusRepository.fetchStatuses).toHaveBeenCalledWith('valid-token', 1);
  });

  it('should return the statuses from the repository', async () => {
    mockStatusRepository.fetchStatuses.mockResolvedValue(statuses);

    const result = await useCase.execute('valid-token', 1);

    expect(result).toEqual(statuses);
  });

  it('should propagate errors thrown by the repository', async () => {
    mockStatusRepository.fetchStatuses.mockRejectedValue(new Error('Token is expired.'));

    await expect(useCase.execute('expired-token', 1)).rejects.toThrow('Token is expired.');
  });
});
