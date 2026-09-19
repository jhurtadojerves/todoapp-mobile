import { BoardRepositoryImpl } from '@/data/repositories/board-repository-impl';
import { BoardDataSource } from '@/data/datasources/board-datasource';
import { Board, BoardInput } from '@/domain/models/board';
import { PaginatedResponse } from '@/domain/models/pagination';

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
  userId: 7,
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
    const page: PaginatedResponse<Board> = { count: 1, next: null, previous: null, results: [board] };
    mockDataSource.fetchBoards.mockResolvedValue(page);

    const result = await repository.fetchBoards(1);

    expect(mockDataSource.fetchBoards).toHaveBeenCalledWith(1);
    expect(result).toEqual(page);
  });

  it('should delegate fetchBoard to the data source', async () => {
    mockDataSource.fetchBoard.mockResolvedValue(board);

    const result = await repository.fetchBoard(1);

    expect(mockDataSource.fetchBoard).toHaveBeenCalledWith(1);
    expect(result).toEqual(board);
  });

  it('should delegate createBoard to the data source', async () => {
    const input: BoardInput = { name: 'New board', description: '' };
    mockDataSource.createBoard.mockResolvedValue(board);

    const result = await repository.createBoard(input);

    expect(mockDataSource.createBoard).toHaveBeenCalledWith(input);
    expect(result).toEqual(board);
  });

  it('should delegate updateBoard to the data source', async () => {
    const input: BoardInput = { name: 'Updated', description: '' };
    mockDataSource.updateBoard.mockResolvedValue(board);

    const result = await repository.updateBoard(1, input);

    expect(mockDataSource.updateBoard).toHaveBeenCalledWith(1, input);
    expect(result).toEqual(board);
  });

  it('should delegate deleteBoard to the data source', async () => {
    mockDataSource.deleteBoard.mockResolvedValue(undefined);

    await repository.deleteBoard(1);

    expect(mockDataSource.deleteBoard).toHaveBeenCalledWith(1);
  });

  it('should propagate errors from the data source', async () => {
    mockDataSource.fetchBoards.mockRejectedValue(new Error('Network error'));

    await expect(repository.fetchBoards(1)).rejects.toThrow('Network error');
  });
});
