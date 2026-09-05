import { Board } from '@/domain/models/board';
import { PaginatedResponse } from '@/domain/models/pagination';
import { BoardRepository } from '@/domain/repositories/board-repository';

export class GetBoardsUseCase {
  constructor(private readonly boardRepository: BoardRepository) {}

  execute(token: string, page: number): Promise<PaginatedResponse<Board>> {
    return this.boardRepository.fetchBoards(token, page);
  }
}
