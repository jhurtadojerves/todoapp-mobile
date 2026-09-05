/**
 * Integration tests: Board usecases → BoardRepositoryImpl → BoardDataSource
 * Only `fetch` is mocked (the real external boundary).
 */
import { BoardDataSource } from '@/data/datasources/board-datasource';
import { BoardRepositoryImpl } from '@/data/repositories/board-repository-impl';
import { CreateBoardUseCase } from '@/domain/usecases/create-board';
import { DeleteBoardUseCase } from '@/domain/usecases/delete-board';
import { GetBoardUseCase } from '@/domain/usecases/get-board';
import { GetBoardsUseCase } from '@/domain/usecases/get-boards';
import { UpdateBoardUseCase } from '@/domain/usecases/update-board';
import { Board } from '@/domain/models/board';

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
  const dataSource = new BoardDataSource();
  const repository = new BoardRepositoryImpl(dataSource);
  return {
    getBoardsUseCase: new GetBoardsUseCase(repository),
    getBoardUseCase: new GetBoardUseCase(repository),
    createBoardUseCase: new CreateBoardUseCase(repository),
    updateBoardUseCase: new UpdateBoardUseCase(repository),
    deleteBoardUseCase: new DeleteBoardUseCase(repository),
  };
}

const board: Board = {
  id: 1,
  name: 'Sprint board',
  description: 'Board for the current sprint',
  user_id: 7,
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-01T00:00:00Z',
};

describe('Boards CRUD flow (integration)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should list boards from a paginated response', async () => {
    const { getBoardsUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(
      mockResponse(200, { count: 1, next: null, previous: null, results: [board] })
    );

    const result = await getBoardsUseCase.execute('valid-token', 1);

    expect(result.results).toEqual([board]);
  });

  it('should create a board and return it', async () => {
    const { createBoardUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(mockResponse(201, board));

    const result = await createBoardUseCase.execute('valid-token', {
      name: board.name,
      description: board.description,
    });

    expect(result).toEqual(board);
  });

  it('should fetch a single board by id', async () => {
    const { getBoardUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(mockResponse(200, board));

    const result = await getBoardUseCase.execute('valid-token', 1);

    expect(result).toEqual(board);
  });

  it('should update a board', async () => {
    const { updateBoardUseCase } = buildDependencies();
    const updated = { ...board, name: 'Renamed board' };
    mockFetch.mockResolvedValue(mockResponse(200, updated));

    const result = await updateBoardUseCase.execute('valid-token', 1, {
      name: 'Renamed board',
      description: board.description,
    });

    expect(result).toEqual(updated);
  });

  it('should delete a board', async () => {
    const { deleteBoardUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(mockResponse(204, null));

    await expect(deleteBoardUseCase.execute('valid-token', 1)).resolves.toBeUndefined();
  });

  it('should surface a 403 as a permission error when updating a board owned by someone else', async () => {
    const { updateBoardUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(
      mockResponse(403, { detail: 'You do not have permission to perform this action.' })
    );

    await expect(
      updateBoardUseCase.execute('valid-token', 1, { name: 'X', description: '' })
    ).rejects.toThrow('You do not have permission to perform this action.');
  });
});
