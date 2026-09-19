import { GetSprintsUseCase } from '@/domain/usecases/get-sprints';
import { SprintRepository } from '@/domain/repositories/sprint-repository';
import { Sprint } from '@/domain/models/sprint';
import { PaginatedResponse } from '@/domain/models/pagination';

const mockSprintRepository: jest.Mocked<SprintRepository> = {
  fetchSprints: jest.fn(),
  createSprint: jest.fn(),
  updateSprint: jest.fn(),
  deleteSprint: jest.fn(),
};

const sprint: Sprint = {
  id: 1,
  name: 'Sprint 1',
  startDate: null,
  endDate: null,
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-01T00:00:00Z',
};
const page: PaginatedResponse<Sprint> = { count: 1, next: null, previous: null, results: [sprint] };

describe('GetSprintsUseCase', () => {
  let useCase: GetSprintsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetSprintsUseCase(mockSprintRepository);
  });

  it('should call sprintRepository.fetchSprints with the given board id and page', async () => {
    mockSprintRepository.fetchSprints.mockResolvedValue(page);

    await useCase.execute(1, 1);

    expect(mockSprintRepository.fetchSprints).toHaveBeenCalledWith(1, 1);
  });

  it('should return the paginated response from the repository', async () => {
    mockSprintRepository.fetchSprints.mockResolvedValue(page);

    const result = await useCase.execute(1, 1);

    expect(result).toEqual(page);
  });

  it('should propagate errors thrown by the repository', async () => {
    mockSprintRepository.fetchSprints.mockRejectedValue(new Error('Token is expired.'));

    await expect(useCase.execute(1, 1)).rejects.toThrow('Token is expired.');
  });
});
