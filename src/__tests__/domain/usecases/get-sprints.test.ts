import { GetSprintsUseCase } from '@/domain/usecases/get-sprints';
import { SprintRepository } from '@/domain/repositories/sprint-repository';
import { Sprint } from '@/domain/models/sprint';

const mockSprintRepository: jest.Mocked<SprintRepository> = {
  fetchSprints: jest.fn(),
  createSprint: jest.fn(),
  updateSprint: jest.fn(),
  deleteSprint: jest.fn(),
};

const sprints: Sprint[] = [
  {
    id: 1,
    name: 'Sprint 1',
    start_date: null,
    end_date: null,
    created: '2026-01-01T00:00:00Z',
    modified: '2026-01-01T00:00:00Z',
  },
];

describe('GetSprintsUseCase', () => {
  let useCase: GetSprintsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetSprintsUseCase(mockSprintRepository);
  });

  it('should call sprintRepository.fetchSprints with the given token and board id', async () => {
    mockSprintRepository.fetchSprints.mockResolvedValue(sprints);

    await useCase.execute('valid-token', 1);

    expect(mockSprintRepository.fetchSprints).toHaveBeenCalledWith('valid-token', 1);
  });

  it('should return the sprints from the repository', async () => {
    mockSprintRepository.fetchSprints.mockResolvedValue(sprints);

    const result = await useCase.execute('valid-token', 1);

    expect(result).toEqual(sprints);
  });

  it('should propagate errors thrown by the repository', async () => {
    mockSprintRepository.fetchSprints.mockRejectedValue(new Error('Token is expired.'));

    await expect(useCase.execute('expired-token', 1)).rejects.toThrow('Token is expired.');
  });
});
