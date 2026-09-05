import { Board } from '@/domain/models/board';
import { BoardRepository } from '@/domain/repositories/board-repository';

export class GetBoardsUseCase {
  constructor(private readonly boardRepository: BoardRepository) {}

  execute(token: string): Promise<Board[]> {
    return this.boardRepository.fetchBoards(token);
  }
}
