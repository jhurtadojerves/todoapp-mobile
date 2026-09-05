import { DeleteBoardUseCase } from '@/domain/usecases/delete-board';
import { BoardRepository } from '@/domain/repositories/board-repository';

const mockBoardRepository: jest.Mocked<BoardRepository> = {
  fetchBoards: jest.fn(),
  fetchBoard: jest.fn(),
  createBoard: jest.fn(),
  updateBoard: jest.fn(),
  deleteBoard: jest.fn(),
};

describe('DeleteBoardUseCase', () => {
  let useCase: DeleteBoardUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new DeleteBoardUseCase(mockBoardRepository);
  });

  it('should call boardRepository.deleteBoard with the given token and id', async () => {
    mockBoardRepository.deleteBoard.mockResolvedValue(undefined);

    await useCase.execute('valid-token', 1);

    expect(mockBoardRepository.deleteBoard).toHaveBeenCalledWith('valid-token', 1);
  });

  it('should propagate errors thrown by the repository', async () => {
    mockBoardRepository.deleteBoard.mockRejectedValue(
      new Error('You do not have permission to perform this action.')
    );

    await expect(useCase.execute('valid-token', 1)).rejects.toThrow(
      'You do not have permission to perform this action.'
    );
  });
});
