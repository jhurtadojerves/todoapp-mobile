/**
 * Integration tests: Board usecases → BoardRepositoryImpl → BoardDataSource
 * Only `fetch` is mocked (the real external boundary).
 */
import MockAdapter from 'axios-mock-adapter';

import { BoardDataSource } from '@/data/datasources/board-datasource';
import { BoardRepositoryImpl } from '@/data/repositories/board-repository-impl';
import { CreateBoardUseCase } from '@/domain/usecases/create-board';
import { DeleteBoardUseCase } from '@/domain/usecases/delete-board';
import { GetBoardUseCase } from '@/domain/usecases/get-board';
import { GetBoardsUseCase } from '@/domain/usecases/get-boards';
import { UpdateBoardUseCase } from '@/domain/usecases/update-board';
import { Board } from '@/domain/models/board';
import { apiClient } from '@/shared/api/http-client';

const apiMock = new MockAdapter(apiClient);

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
  userId: 7,
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-01T00:00:00Z',
};

describe('Boards CRUD flow (integration)', () => {
  beforeEach(() => {
    apiMock.reset();
    jest.clearAllMocks();
  });

  it('should list boards from a paginated response', async () => {
    const { getBoardsUseCase } = buildDependencies();
    apiMock.onAny().reply(200, { count: 1, next: null, previous: null, results: [board] });

    const result = await getBoardsUseCase.execute(1);

    expect(result.results).toEqual([board]);
  });

  it('should create a board and return it', async () => {
    const { createBoardUseCase } = buildDependencies();
    apiMock.onAny().reply(201, board);

    const result = await createBoardUseCase.execute({
      name: board.name,
      description: board.description,
    });

    expect(result).toEqual(board);
  });

  it('should fetch a single board by id', async () => {
    const { getBoardUseCase } = buildDependencies();
    apiMock.onAny().reply(200, board);

    const result = await getBoardUseCase.execute(1);

    expect(result).toEqual(board);
  });

  it('should update a board', async () => {
    const { updateBoardUseCase } = buildDependencies();
    const updated = { ...board, name: 'Renamed board' };
    apiMock.onAny().reply(200, updated);

    const result = await updateBoardUseCase.execute(1, {
      name: 'Renamed board',
      description: board.description,
    });

    expect(result).toEqual(updated);
  });

  it('should delete a board', async () => {
    const { deleteBoardUseCase } = buildDependencies();
    apiMock.onAny().reply(204);

    await expect(deleteBoardUseCase.execute(1)).resolves.toBeUndefined();
  });

  it('should surface a 403 as a permission error when updating a board owned by someone else', async () => {
    const { updateBoardUseCase } = buildDependencies();
    apiMock.onAny().reply(403, { detail: 'You do not have permission to perform this action.' });

    await expect(
      updateBoardUseCase.execute(1, { name: 'X', description: '' })
    ).rejects.toThrow('You do not have permission to perform this action.');
  });
});
