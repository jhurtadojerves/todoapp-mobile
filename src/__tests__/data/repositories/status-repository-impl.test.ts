import { StatusRepositoryImpl } from '@/data/repositories/status-repository-impl';
import { StatusDataSource } from '@/data/datasources/status-datasource';
import { BoardStatus, BoardStatusInput } from '@/domain/models/status';

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
    mockDataSource.fetchStatuses.mockResolvedValue([boardStatus]);

    const result = await repository.fetchStatuses('valid-token', 1);

    expect(mockDataSource.fetchStatuses).toHaveBeenCalledWith('valid-token', 1);
    expect(result).toEqual([boardStatus]);
  });

  it('should delegate createStatus to the data source', async () => {
    const input: BoardStatusInput = { name: 'To Do', order: 0, color: '#64748b' };
    mockDataSource.createStatus.mockResolvedValue(boardStatus);

    const result = await repository.createStatus('valid-token', 1, input);

    expect(mockDataSource.createStatus).toHaveBeenCalledWith('valid-token', 1, input);
    expect(result).toEqual(boardStatus);
  });

  it('should delegate updateStatus to the data source', async () => {
    const input: BoardStatusInput = { name: 'Done', order: 2, color: '#22c55e' };
    mockDataSource.updateStatus.mockResolvedValue(boardStatus);

    const result = await repository.updateStatus('valid-token', 1, 1, input);

    expect(mockDataSource.updateStatus).toHaveBeenCalledWith('valid-token', 1, 1, input);
    expect(result).toEqual(boardStatus);
  });

  it('should delegate deleteStatus to the data source', async () => {
    mockDataSource.deleteStatus.mockResolvedValue(undefined);

    await repository.deleteStatus('valid-token', 1, 1);

    expect(mockDataSource.deleteStatus).toHaveBeenCalledWith('valid-token', 1, 1);
  });

  it('should propagate errors from the data source', async () => {
    mockDataSource.fetchStatuses.mockRejectedValue(new Error('Network error'));

    await expect(repository.fetchStatuses('some-token', 1)).rejects.toThrow('Network error');
  });
});
