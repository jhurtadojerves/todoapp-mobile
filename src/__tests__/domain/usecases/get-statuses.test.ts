import { GetStatusesUseCase } from '@/domain/usecases/get-statuses';
import { StatusRepository } from '@/domain/repositories/status-repository';
import { BoardStatus } from '@/domain/models/status';
import { PaginatedResponse } from '@/domain/models/pagination';

const mockStatusRepository: jest.Mocked<StatusRepository> = {
  fetchStatuses: jest.fn(),
  createStatus: jest.fn(),
  updateStatus: jest.fn(),
  deleteStatus: jest.fn(),
};

const boardStatus: BoardStatus = { id: 1, name: 'To Do', order: 0, color: '#64748b' };
const page: PaginatedResponse<BoardStatus> = { count: 1, next: null, previous: null, results: [boardStatus] };

describe('GetStatusesUseCase', () => {
  let useCase: GetStatusesUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetStatusesUseCase(mockStatusRepository);
  });

  it('should call statusRepository.fetchStatuses with the given token, board id and page', async () => {
    mockStatusRepository.fetchStatuses.mockResolvedValue(page);

    await useCase.execute('valid-token', 1, 1);

    expect(mockStatusRepository.fetchStatuses).toHaveBeenCalledWith('valid-token', 1, 1);
  });

  it('should return the paginated response from the repository', async () => {
    mockStatusRepository.fetchStatuses.mockResolvedValue(page);

    const result = await useCase.execute('valid-token', 1, 1);

    expect(result).toEqual(page);
  });

  it('should propagate errors thrown by the repository', async () => {
    mockStatusRepository.fetchStatuses.mockRejectedValue(new Error('Token is expired.'));

    await expect(useCase.execute('expired-token', 1, 1)).rejects.toThrow('Token is expired.');
  });
});
