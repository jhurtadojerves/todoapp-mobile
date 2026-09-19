import { UpdateSprintUseCase } from '@/domain/usecases/update-sprint';
import { SprintRepository } from '@/domain/repositories/sprint-repository';
import { Sprint, SprintInput } from '@/domain/models/sprint';

const mockSprintRepository: jest.Mocked<SprintRepository> = {
  fetchSprints: jest.fn(),
  createSprint: jest.fn(),
  updateSprint: jest.fn(),
  deleteSprint: jest.fn(),
};

const sprint: Sprint = {
  id: 1,
  name: 'Sprint 1 renamed',
  startDate: null,
  endDate: null,
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-02T00:00:00Z',
};

describe('UpdateSprintUseCase', () => {
  let useCase: UpdateSprintUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateSprintUseCase(mockSprintRepository);
  });

  it('should call sprintRepository.updateSprint with the given board id, sprint id and input', async () => {
    const input: SprintInput = { name: 'Sprint 1 renamed', startDate: null, endDate: null };
    mockSprintRepository.updateSprint.mockResolvedValue(sprint);

    await useCase.execute(1, 1, input);

    expect(mockSprintRepository.updateSprint).toHaveBeenCalledWith(1, 1, input);
  });

  it('should return the updated sprint from the repository', async () => {
    const input: SprintInput = { name: 'Sprint 1 renamed', startDate: null, endDate: null };
    mockSprintRepository.updateSprint.mockResolvedValue(sprint);

    const result = await useCase.execute(1, 1, input);

    expect(result).toEqual(sprint);
  });

  it('should propagate errors thrown by the repository', async () => {
    const input: SprintInput = { name: 'Sprint 1 renamed', startDate: null, endDate: null };
    mockSprintRepository.updateSprint.mockRejectedValue(
      new Error('You do not have permission to perform this action.')
    );

    await expect(useCase.execute(1, 1, input)).rejects.toThrow(
      'You do not have permission to perform this action.'
    );
  });
});
