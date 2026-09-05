import { SprintRepositoryImpl } from '@/data/repositories/sprint-repository-impl';
import { SprintDataSource } from '@/data/datasources/sprint-datasource';
import { Sprint, SprintInput } from '@/domain/models/sprint';
import { PaginatedResponse } from '@/domain/models/pagination';

const mockDataSource: jest.Mocked<SprintDataSource> = {
  fetchSprints: jest.fn(),
  createSprint: jest.fn(),
  updateSprint: jest.fn(),
  deleteSprint: jest.fn(),
};

const sprint: Sprint = {
  id: 1,
  name: 'Sprint 1',
  start_date: '2026-01-01',
  end_date: '2026-01-14',
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-01T00:00:00Z',
};

describe('SprintRepositoryImpl', () => {
  let repository: SprintRepositoryImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new SprintRepositoryImpl(mockDataSource);
  });

  it('should delegate fetchSprints to the data source', async () => {
    const page: PaginatedResponse<Sprint> = { count: 1, next: null, previous: null, results: [sprint] };
    mockDataSource.fetchSprints.mockResolvedValue(page);

    const result = await repository.fetchSprints('valid-token', 1, 1);

    expect(mockDataSource.fetchSprints).toHaveBeenCalledWith('valid-token', 1, 1);
    expect(result).toEqual(page);
  });

  it('should delegate createSprint to the data source', async () => {
    const input: SprintInput = { name: 'Sprint 1', start_date: null, end_date: null };
    mockDataSource.createSprint.mockResolvedValue(sprint);

    const result = await repository.createSprint('valid-token', 1, input);

    expect(mockDataSource.createSprint).toHaveBeenCalledWith('valid-token', 1, input);
    expect(result).toEqual(sprint);
  });

  it('should delegate updateSprint to the data source', async () => {
    const input: SprintInput = { name: 'Sprint 1 renamed', start_date: null, end_date: null };
    mockDataSource.updateSprint.mockResolvedValue(sprint);

    const result = await repository.updateSprint('valid-token', 1, 1, input);

    expect(mockDataSource.updateSprint).toHaveBeenCalledWith('valid-token', 1, 1, input);
    expect(result).toEqual(sprint);
  });

  it('should delegate deleteSprint to the data source', async () => {
    mockDataSource.deleteSprint.mockResolvedValue(undefined);

    await repository.deleteSprint('valid-token', 1, 1);

    expect(mockDataSource.deleteSprint).toHaveBeenCalledWith('valid-token', 1, 1);
  });

  it('should propagate errors from the data source', async () => {
    mockDataSource.fetchSprints.mockRejectedValue(new Error('Network error'));

    await expect(repository.fetchSprints('some-token', 1, 1)).rejects.toThrow('Network error');
  });
});
