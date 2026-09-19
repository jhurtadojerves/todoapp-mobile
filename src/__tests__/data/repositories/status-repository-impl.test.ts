import { StatusRepositoryImpl } from '@/data/repositories/status-repository-impl';
import { StatusDataSource } from '@/data/datasources/status-datasource';
import { BoardStatus, BoardStatusInput } from '@/domain/models/status';
import { PaginatedResponse } from '@/domain/models/pagination';

const mockDataSource: jest.Mocked<StatusDataSource> = {
  fetchStatuses: jest.fn(),
  createStatus: jest.fn(),
  updateStatus: jest.fn(),
  deleteStatus: jest.fn(),
};

const boardStatus: BoardStatus = { id: 1, name: 'To Do', order: 0, color: '#64748b' };

describe('StatusRepositoryImpl', () => {
  let repository: StatusRepositoryImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new StatusRepositoryImpl(mockDataSource);
  });

  it('should delegate fetchStatuses to the data source', async () => {
    const page: PaginatedResponse<BoardStatus> = { count: 1, next: null, previous: null, results: [boardStatus] };
    mockDataSource.fetchStatuses.mockResolvedValue(page);

    const result = await repository.fetchStatuses(1, 1);

    expect(mockDataSource.fetchStatuses).toHaveBeenCalledWith(1, 1);
    expect(result).toEqual(page);
  });

  it('should delegate createStatus to the data source', async () => {
    const input: BoardStatusInput = { name: 'To Do', order: 0, color: '#64748b' };
    mockDataSource.createStatus.mockResolvedValue(boardStatus);

    const result = await repository.createStatus(1, input);

    expect(mockDataSource.createStatus).toHaveBeenCalledWith(1, input);
    expect(result).toEqual(boardStatus);
  });

  it('should delegate updateStatus to the data source', async () => {
    const input: BoardStatusInput = { name: 'Done', order: 2, color: '#22c55e' };
    mockDataSource.updateStatus.mockResolvedValue(boardStatus);

    const result = await repository.updateStatus(1, 1, input);

    expect(mockDataSource.updateStatus).toHaveBeenCalledWith(1, 1, input);
    expect(result).toEqual(boardStatus);
  });

  it('should delegate deleteStatus to the data source', async () => {
    mockDataSource.deleteStatus.mockResolvedValue(undefined);

    await repository.deleteStatus(1, 1);

    expect(mockDataSource.deleteStatus).toHaveBeenCalledWith(1, 1);
  });

  it('should propagate errors from the data source', async () => {
    mockDataSource.fetchStatuses.mockRejectedValue(new Error('Network error'));

    await expect(repository.fetchStatuses(1, 1)).rejects.toThrow('Network error');
  });
});
