import { Board, BoardInput } from '@/domain/models/board';
import { BoardRepository } from '@/domain/repositories/board-repository';

export class CreateBoardUseCase {
  constructor(private readonly boardRepository: BoardRepository) {}

  execute(input: BoardInput): Promise<Board> {
    return this.boardRepository.createBoard(input);
  }
}
