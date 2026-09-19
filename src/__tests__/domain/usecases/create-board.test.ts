import { CreateBoardUseCase } from '@/domain/usecases/create-board';
import { BoardRepository } from '@/domain/repositories/board-repository';
import { Board, BoardInput } from '@/domain/models/board';

const mockBoardRepository: jest.Mocked<BoardRepository> = {
  fetchBoards: jest.fn(),
  fetchBoard: jest.fn(),
  createBoard: jest.fn(),
  updateBoard: jest.fn(),
  deleteBoard: jest.fn(),
};

const board: Board = {
  id: 1,
  name: 'New board',
  description: 'A description',
  userId: 7,
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-01T00:00:00Z',
};

describe('CreateBoardUseCase', () => {
  let useCase: CreateBoardUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateBoardUseCase(mockBoardRepository);
  });

  it('should call boardRepository.createBoard with the given input', async () => {
    const input: BoardInput = { name: 'New board', description: 'A description' };
    mockBoardRepository.createBoard.mockResolvedValue(board);

    await useCase.execute(input);

    expect(mockBoardRepository.createBoard).toHaveBeenCalledWith(input);
  });

  it('should return the created board from the repository', async () => {
    const input: BoardInput = { name: 'New board', description: 'A description' };
    mockBoardRepository.createBoard.mockResolvedValue(board);

    const result = await useCase.execute(input);

    expect(result).toEqual(board);
  });

  it('should propagate errors thrown by the repository', async () => {
    const input: BoardInput = { name: '', description: '' };
    mockBoardRepository.createBoard.mockRejectedValue(new Error('This field may not be blank.'));

    await expect(useCase.execute(input)).rejects.toThrow(
      'This field may not be blank.'
    );
  });
});
