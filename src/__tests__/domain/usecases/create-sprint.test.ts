import { CreateSprintUseCase } from '@/domain/usecases/create-sprint';
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
  name: 'Sprint 1',
  startDate: '2026-01-01',
  endDate: '2026-01-14',
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-01T00:00:00Z',
};

describe('CreateSprintUseCase', () => {
  let useCase: CreateSprintUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateSprintUseCase(mockSprintRepository);
  });

  it('should call sprintRepository.createSprint with the given board id and input', async () => {
    const input: SprintInput = { name: 'Sprint 1', startDate: '2026-01-01', endDate: '2026-01-14' };
    mockSprintRepository.createSprint.mockResolvedValue(sprint);

    await useCase.execute(1, input);

    expect(mockSprintRepository.createSprint).toHaveBeenCalledWith(1, input);
  });

  it('should return the created sprint from the repository', async () => {
    const input: SprintInput = { name: 'Sprint 1', startDate: '2026-01-01', endDate: '2026-01-14' };
    mockSprintRepository.createSprint.mockResolvedValue(sprint);

    const result = await useCase.execute(1, input);

    expect(result).toEqual(sprint);
  });

  it('should propagate errors thrown by the repository', async () => {
    const input: SprintInput = { name: '', startDate: null, endDate: null };
    mockSprintRepository.createSprint.mockRejectedValue(new Error('This field may not be blank.'));

    await expect(useCase.execute(1, input)).rejects.toThrow(
      'This field may not be blank.'
    );
  });
});
