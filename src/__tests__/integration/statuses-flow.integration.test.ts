/**
 * Integration tests: Status usecases → StatusRepositoryImpl → StatusDataSource
 * Only `fetch` is mocked (the real external boundary).
 */
import MockAdapter from 'axios-mock-adapter';

import { StatusDataSource } from '@/data/datasources/status-datasource';
import { StatusRepositoryImpl } from '@/data/repositories/status-repository-impl';
import { CreateStatusUseCase } from '@/domain/usecases/create-status';
import { DeleteStatusUseCase } from '@/domain/usecases/delete-status';
import { GetStatusesUseCase } from '@/domain/usecases/get-statuses';
import { UpdateStatusUseCase } from '@/domain/usecases/update-status';
import { BoardStatus } from '@/domain/models/status';
import { apiClient } from '@/shared/api/http-client';

const apiMock = new MockAdapter(apiClient);

function buildDependencies() {
  const dataSource = new StatusDataSource();
  const repository = new StatusRepositoryImpl(dataSource);
  return {
    getStatusesUseCase: new GetStatusesUseCase(repository),
    createStatusUseCase: new CreateStatusUseCase(repository),
    updateStatusUseCase: new UpdateStatusUseCase(repository),
    deleteStatusUseCase: new DeleteStatusUseCase(repository),
  };
}

const toDo: BoardStatus = { id: 1, name: 'To Do', order: 0, color: '#64748b' };
const inProgress: BoardStatus = { id: 2, name: 'In Progress', order: 1, color: '#3b82f6' };

describe('Board statuses flow (integration)', () => {
  beforeEach(() => {
    apiMock.reset();
    jest.clearAllMocks();
  });

  it('should list statuses from a paginated response', async () => {
    const { getStatusesUseCase } = buildDependencies();
    apiMock.onAny().reply(200, { count: 2, next: null, previous: null, results: [toDo, inProgress] });

    const result = await getStatusesUseCase.execute(1, 1);

    expect(result.results).toEqual([toDo, inProgress]);
  });

  it('should create a status and return it', async () => {
    const { createStatusUseCase } = buildDependencies();
    apiMock.onAny().reply(201, toDo);

    const result = await createStatusUseCase.execute(1, {
      name: 'To Do',
      order: 0,
      color: '#64748b',
    });

    expect(result).toEqual(toDo);
  });

  it('should update a status', async () => {
    const { updateStatusUseCase } = buildDependencies();
    const renamed = { ...toDo, name: 'Backlog' };
    apiMock.onAny().reply(200, renamed);

    const result = await updateStatusUseCase.execute(1, 1, {
      name: 'Backlog',
      order: 0,
      color: '#64748b',
    });

    expect(result).toEqual(renamed);
  });

  it('should delete a status', async () => {
    const { deleteStatusUseCase } = buildDependencies();
    apiMock.onAny().reply(204);

    await expect(deleteStatusUseCase.execute(1, 1)).resolves.toBeUndefined();
  });

  it('should surface a 403 as a permission error when a non-owner tries to create a status', async () => {
    const { createStatusUseCase } = buildDependencies();
    apiMock.onAny().reply(403, { detail: 'You do not have permission to perform this action.' });

    await expect(
      createStatusUseCase.execute(1, { name: 'X', order: 0, color: '#000000' })
    ).rejects.toThrow('You do not have permission to perform this action.');
  });
});
