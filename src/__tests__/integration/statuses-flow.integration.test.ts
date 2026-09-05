/**
 * Integration tests: Status usecases → StatusRepositoryImpl → StatusDataSource
 * Only `fetch` is mocked (the real external boundary).
 */
import { StatusDataSource } from '@/data/datasources/status-datasource';
import { StatusRepositoryImpl } from '@/data/repositories/status-repository-impl';
import { CreateStatusUseCase } from '@/domain/usecases/create-status';
import { DeleteStatusUseCase } from '@/domain/usecases/delete-status';
import { GetStatusesUseCase } from '@/domain/usecases/get-statuses';
import { UpdateStatusUseCase } from '@/domain/usecases/update-status';
import { BoardStatus } from '@/domain/models/status';

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
  beforeEach(() => jest.clearAllMocks());

  it('should list statuses from a paginated response', async () => {
    const { getStatusesUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(
      mockResponse(200, { count: 2, next: null, previous: null, results: [toDo, inProgress] })
    );

    const result = await getStatusesUseCase.execute('valid-token', 1, 1);

    expect(result.results).toEqual([toDo, inProgress]);
  });

  it('should create a status and return it', async () => {
    const { createStatusUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(mockResponse(201, toDo));

    const result = await createStatusUseCase.execute('valid-token', 1, {
      name: 'To Do',
      order: 0,
      color: '#64748b',
    });

    expect(result).toEqual(toDo);
  });

  it('should update a status', async () => {
    const { updateStatusUseCase } = buildDependencies();
    const renamed = { ...toDo, name: 'Backlog' };
    mockFetch.mockResolvedValue(mockResponse(200, renamed));

    const result = await updateStatusUseCase.execute('valid-token', 1, 1, {
      name: 'Backlog',
      order: 0,
      color: '#64748b',
    });

    expect(result).toEqual(renamed);
  });

  it('should delete a status', async () => {
    const { deleteStatusUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(mockResponse(204, null));

    await expect(deleteStatusUseCase.execute('valid-token', 1, 1)).resolves.toBeUndefined();
  });

  it('should surface a 403 as a permission error when a non-owner tries to create a status', async () => {
    const { createStatusUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(
      mockResponse(403, { detail: 'You do not have permission to perform this action.' })
    );

    await expect(
      createStatusUseCase.execute('valid-token', 1, { name: 'X', order: 0, color: '#000000' })
    ).rejects.toThrow('You do not have permission to perform this action.');
  });
});
