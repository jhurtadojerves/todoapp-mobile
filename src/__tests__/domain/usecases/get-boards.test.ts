import { GetBoardsUseCase } from '@/domain/usecases/get-boards';
import { BoardRepository } from '@/domain/repositories/board-repository';
import { Board } from '@/domain/models/board';

const mockBoardRepository: jest.Mocked<BoardRepository> = {
  fetchBoards: jest.fn(),
  fetchBoard: jest.fn(),
  createBoard: jest.fn(),
  updateBoard: jest.fn(),
  deleteBoard: jest.fn(),
};

const boards: Board[] = [
  {
    id: 1,
    name: 'Sprint board',
    description: '',
    user_id: 7,
    created: '2026-01-01T00:00:00Z',
    modified: '2026-01-01T00:00:00Z',
  },
];

describe('GetBoardsUseCase', () => {
  let useCase: GetBoardsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetBoardsUseCase(mockBoardRepository);
  });

  it('should call boardRepository.fetchBoards with the given token', async () => {
    mockBoardRepository.fetchBoards.mockResolvedValue(boards);

    await useCase.execute('valid-token');

    expect(mockBoardRepository.fetchBoards).toHaveBeenCalledWith('valid-token');
  });

  it('should return the boards from the repository', async () => {
    mockBoardRepository.fetchBoards.mockResolvedValue(boards);

    const result = await useCase.execute('valid-token');

    expect(result).toEqual(boards);
  });

  it('should propagate errors thrown by the repository', async () => {
    mockBoardRepository.fetchBoards.mockRejectedValue(new Error('Token is expired.'));

    await expect(useCase.execute('expired-token')).rejects.toThrow('Token is expired.');
  });
});
