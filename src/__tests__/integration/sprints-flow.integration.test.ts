/**
 * Integration tests: Sprint usecases → SprintRepositoryImpl → SprintDataSource
 * Only `fetch` is mocked (the real external boundary).
 */
import { SprintDataSource } from '@/data/datasources/sprint-datasource';
import { SprintRepositoryImpl } from '@/data/repositories/sprint-repository-impl';
import { CreateSprintUseCase } from '@/domain/usecases/create-sprint';
import { DeleteSprintUseCase } from '@/domain/usecases/delete-sprint';
import { GetSprintsUseCase } from '@/domain/usecases/get-sprints';
import { UpdateSprintUseCase } from '@/domain/usecases/update-sprint';
import { Sprint } from '@/domain/models/sprint';

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

function buildDependencies() {
  const dataSource = new SprintDataSource();
  const repository = new SprintRepositoryImpl(dataSource);
  return {
    getSprintsUseCase: new GetSprintsUseCase(repository),
    createSprintUseCase: new CreateSprintUseCase(repository),
    updateSprintUseCase: new UpdateSprintUseCase(repository),
    deleteSprintUseCase: new DeleteSprintUseCase(repository),
  };
}

const sprint1: Sprint = {
  id: 1,
  name: 'Sprint 1',
  start_date: '2026-01-01',
  end_date: '2026-01-14',
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-01T00:00:00Z',
};

const sprint2: Sprint = {
  id: 2,
  name: 'Sprint 2',
  start_date: null,
  end_date: null,
  created: '2026-01-15T00:00:00Z',
  modified: '2026-01-15T00:00:00Z',
};

describe('Board sprints flow (integration)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should list sprints from a paginated response', async () => {
    const { getSprintsUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(
      mockResponse(200, { count: 2, next: null, previous: null, results: [sprint1, sprint2] })
    );

    const result = await getSprintsUseCase.execute('valid-token', 1, 1);

    expect(result.results).toEqual([sprint1, sprint2]);
  });

  it('should create a sprint without dates and return it', async () => {
    const { createSprintUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(mockResponse(201, sprint2));

    const result = await createSprintUseCase.execute('valid-token', 1, {
      name: 'Sprint 2',
      start_date: null,
      end_date: null,
    });

    expect(result).toEqual(sprint2);
  });

  it('should update a sprint', async () => {
    const { updateSprintUseCase } = buildDependencies();
    const renamed = { ...sprint1, name: 'Sprint 1 (extended)' };
    mockFetch.mockResolvedValue(mockResponse(200, renamed));

    const result = await updateSprintUseCase.execute('valid-token', 1, 1, {
      name: 'Sprint 1 (extended)',
      start_date: sprint1.start_date,
      end_date: sprint1.end_date,
    });

    expect(result).toEqual(renamed);
  });

  it('should delete a sprint', async () => {
    const { deleteSprintUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(mockResponse(204, null));

    await expect(deleteSprintUseCase.execute('valid-token', 1, 1)).resolves.toBeUndefined();
  });

  it('should surface a 403 as a permission error when a non-owner tries to create a sprint', async () => {
    const { createSprintUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(
      mockResponse(403, { detail: 'You do not have permission to perform this action.' })
    );

    await expect(
      createSprintUseCase.execute('valid-token', 1, { name: 'X', start_date: null, end_date: null })
    ).rejects.toThrow('You do not have permission to perform this action.');
  });
});
