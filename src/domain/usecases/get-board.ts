import { Board } from '@/domain/models/board';
import { BoardRepository } from '@/domain/repositories/board-repository';

export class GetBoardUseCase {
  constructor(private readonly boardRepository: BoardRepository) {}

  execute(token: string, id: number): Promise<Board> {
    return this.boardRepository.fetchBoard(token, id);
  }
}
