import { GetBoardUseCase } from '@/domain/usecases/get-board';
import { BoardRepository } from '@/domain/repositories/board-repository';
import { Board } from '@/domain/models/board';

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

describe('GetBoardUseCase', () => {
  let useCase: GetBoardUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetBoardUseCase(mockBoardRepository);
  });

  it('should call boardRepository.fetchBoard with the given id', async () => {
    mockBoardRepository.fetchBoard.mockResolvedValue(board);

    await useCase.execute(1);

    expect(mockBoardRepository.fetchBoard).toHaveBeenCalledWith(1);
  });

  it('should return the board from the repository', async () => {
    mockBoardRepository.fetchBoard.mockResolvedValue(board);

    const result = await useCase.execute(1);

    expect(result).toEqual(board);
  });

  it('should propagate errors thrown by the repository', async () => {
    mockBoardRepository.fetchBoard.mockRejectedValue(new Error('Not found.'));

    await expect(useCase.execute(999)).rejects.toThrow('Not found.');
  });
});
