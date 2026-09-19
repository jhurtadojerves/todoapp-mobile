import { GetBoardsUseCase } from '@/domain/usecases/get-boards';
import { BoardRepository } from '@/domain/repositories/board-repository';
import { Board } from '@/domain/models/board';
import { PaginatedResponse } from '@/domain/models/pagination';

const mockBoardRepository: jest.Mocked<BoardRepository> = {
  fetchBoards: jest.fn(),
  fetchBoard: jest.fn(),
  createBoard: jest.fn(),
  updateBoard: jest.fn(),
  deleteBoard: jest.fn(),
};

const board: Board = {
  id: 1,
  name: 'Sprint board',
  description: '',
  userId: 7,
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-01T00:00:00Z',
};
const page: PaginatedResponse<Board> = { count: 1, next: null, previous: null, results: [board] };

describe('GetBoardsUseCase', () => {
  let useCase: GetBoardsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetBoardsUseCase(mockBoardRepository);
  });

  it('should call boardRepository.fetchBoards with the given page', async () => {
    mockBoardRepository.fetchBoards.mockResolvedValue(page);

    await useCase.execute(1);

    expect(mockBoardRepository.fetchBoards).toHaveBeenCalledWith(1);
  });

  it('should return the paginated response from the repository', async () => {
    mockBoardRepository.fetchBoards.mockResolvedValue(page);

    const result = await useCase.execute(1);

    expect(result).toEqual(page);
  });

  it('should propagate errors thrown by the repository', async () => {
    mockBoardRepository.fetchBoards.mockRejectedValue(new Error('Token is expired.'));

    await expect(useCase.execute(1)).rejects.toThrow('Token is expired.');
  });
});
