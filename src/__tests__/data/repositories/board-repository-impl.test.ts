import { BoardRepositoryImpl } from '@/data/repositories/board-repository-impl';
import { BoardDataSource } from '@/data/datasources/board-datasource';
import { Board, BoardInput } from '@/domain/models/board';

const mockDataSource: jest.Mocked<BoardDataSource> = {
  fetchBoards: jest.fn(),
  fetchBoard: jest.fn(),
  createBoard: jest.fn(),
  updateBoard: jest.fn(),
  deleteBoard: jest.fn(),
};

const board: Board = {
  id: 1,
  name: 'Sprint board',
  description: 'Board for the current sprint',
  user_id: 7,
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-01T00:00:00Z',
};

describe('BoardRepositoryImpl', () => {
  let repository: BoardRepositoryImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new BoardRepositoryImpl(mockDataSource);
  });

  it('should delegate fetchBoards to the data source', async () => {
    mockDataSource.fetchBoards.mockResolvedValue([board]);

    const result = await repository.fetchBoards('valid-token');

    expect(mockDataSource.fetchBoards).toHaveBeenCalledWith('valid-token');
    expect(result).toEqual([board]);
  });

  it('should delegate fetchBoard to the data source', async () => {
    mockDataSource.fetchBoard.mockResolvedValue(board);

    const result = await repository.fetchBoard('valid-token', 1);

    expect(mockDataSource.fetchBoard).toHaveBeenCalledWith('valid-token', 1);
    expect(result).toEqual(board);
  });

  it('should delegate createBoard to the data source', async () => {
    const input: BoardInput = { name: 'New board', description: '' };
    mockDataSource.createBoard.mockResolvedValue(board);

    const result = await repository.createBoard('valid-token', input);

    expect(mockDataSource.createBoard).toHaveBeenCalledWith('valid-token', input);
    expect(result).toEqual(board);
  });

  it('should delegate updateBoard to the data source', async () => {
    const input: BoardInput = { name: 'Updated', description: '' };
    mockDataSource.updateBoard.mockResolvedValue(board);

    const result = await repository.updateBoard('valid-token', 1, input);

    expect(mockDataSource.updateBoard).toHaveBeenCalledWith('valid-token', 1, input);
    expect(result).toEqual(board);
  });

  it('should delegate deleteBoard to the data source', async () => {
    mockDataSource.deleteBoard.mockResolvedValue(undefined);

    await repository.deleteBoard('valid-token', 1);

    expect(mockDataSource.deleteBoard).toHaveBeenCalledWith('valid-token', 1);
  });

  it('should propagate errors from the data source', async () => {
    mockDataSource.fetchBoards.mockRejectedValue(new Error('Network error'));

    await expect(repository.fetchBoards('some-token')).rejects.toThrow('Network error');
  });
});
