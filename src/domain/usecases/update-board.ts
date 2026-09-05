import { Board, BoardInput } from '@/domain/models/board';
import { BoardRepository } from '@/domain/repositories/board-repository';

export class UpdateBoardUseCase {
  constructor(private readonly boardRepository: BoardRepository) {}

  execute(token: string, id: number, input: BoardInput): Promise<Board> {
    return this.boardRepository.updateBoard(token, id, input);
  }
}
