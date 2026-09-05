import { UpdateBoardUseCase } from '@/domain/usecases/update-board';
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
  name: 'Updated board',
  description: 'Updated description',
  user_id: 7,
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-02T00:00:00Z',
};

describe('UpdateBoardUseCase', () => {
  let useCase: UpdateBoardUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateBoardUseCase(mockBoardRepository);
  });

  it('should call boardRepository.updateBoard with the given token, id and input', async () => {
    const input: BoardInput = { name: 'Updated board', description: 'Updated description' };
    mockBoardRepository.updateBoard.mockResolvedValue(board);

    await useCase.execute('valid-token', 1, input);

    expect(mockBoardRepository.updateBoard).toHaveBeenCalledWith('valid-token', 1, input);
  });

  it('should return the updated board from the repository', async () => {
    const input: BoardInput = { name: 'Updated board', description: 'Updated description' };
    mockBoardRepository.updateBoard.mockResolvedValue(board);

    const result = await useCase.execute('valid-token', 1, input);

    expect(result).toEqual(board);
  });

  it('should propagate errors thrown by the repository', async () => {
    const input: BoardInput = { name: 'Updated board', description: '' };
    mockBoardRepository.updateBoard.mockRejectedValue(
      new Error('You do not have permission to perform this action.')
    );

    await expect(useCase.execute('valid-token', 1, input)).rejects.toThrow(
      'You do not have permission to perform this action.'
    );
  });
});
