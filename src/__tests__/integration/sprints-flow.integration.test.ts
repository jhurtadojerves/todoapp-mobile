/**
 * Integration tests: Sprint usecases → SprintRepositoryImpl → SprintDataSource
 * Only `fetch` is mocked (the real external boundary).
 */
import MockAdapter from 'axios-mock-adapter';

import { SprintDataSource } from '@/data/datasources/sprint-datasource';
import { SprintRepositoryImpl } from '@/data/repositories/sprint-repository-impl';
import { CreateSprintUseCase } from '@/domain/usecases/create-sprint';
import { DeleteSprintUseCase } from '@/domain/usecases/delete-sprint';
import { GetSprintsUseCase } from '@/domain/usecases/get-sprints';
import { UpdateSprintUseCase } from '@/domain/usecases/update-sprint';
import { Sprint } from '@/domain/models/sprint';
import { apiClient } from '@/shared/api/http-client';

const apiMock = new MockAdapter(apiClient);

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
  startDate: '2026-01-01',
  endDate: '2026-01-14',
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-01T00:00:00Z',
};

const sprint2: Sprint = {
  id: 2,
  name: 'Sprint 2',
  startDate: null,
  endDate: null,
  created: '2026-01-15T00:00:00Z',
  modified: '2026-01-15T00:00:00Z',
};

describe('Board sprints flow (integration)', () => {
  beforeEach(() => {
    apiMock.reset();
    jest.clearAllMocks();
  });

  it('should list sprints from a paginated response', async () => {
    const { getSprintsUseCase } = buildDependencies();
    apiMock.onAny().reply(200, { count: 2, next: null, previous: null, results: [sprint1, sprint2] });

    const result = await getSprintsUseCase.execute(1, 1);

    expect(result.results).toEqual([sprint1, sprint2]);
  });

  it('should create a sprint without dates and return it', async () => {
    const { createSprintUseCase } = buildDependencies();
    apiMock.onAny().reply(201, sprint2);

    const result = await createSprintUseCase.execute(1, {
      name: 'Sprint 2',
      startDate: null,
      endDate: null,
    });

    expect(result).toEqual(sprint2);
  });

  it('should update a sprint', async () => {
    const { updateSprintUseCase } = buildDependencies();
    const renamed = { ...sprint1, name: 'Sprint 1 (extended)' };
    apiMock.onAny().reply(200, renamed);

    const result = await updateSprintUseCase.execute(1, 1, {
      name: 'Sprint 1 (extended)',
      startDate: sprint1.startDate,
      endDate: sprint1.endDate,
    });

    expect(result).toEqual(renamed);
  });

  it('should delete a sprint', async () => {
    const { deleteSprintUseCase } = buildDependencies();
    apiMock.onAny().reply(204);

    await expect(deleteSprintUseCase.execute(1, 1)).resolves.toBeUndefined();
  });

  it('should surface a 403 as a permission error when a non-owner tries to create a sprint', async () => {
    const { createSprintUseCase } = buildDependencies();
    apiMock.onAny().reply(403, { detail: 'You do not have permission to perform this action.' });

    await expect(
      createSprintUseCase.execute(1, { name: 'X', startDate: null, endDate: null })
    ).rejects.toThrow('You do not have permission to perform this action.');
  });
});
