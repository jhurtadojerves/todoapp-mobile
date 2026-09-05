import { BoardRepository } from '@/domain/repositories/board-repository';

export class DeleteBoardUseCase {
  constructor(private readonly boardRepository: BoardRepository) {}

  execute(token: string, id: number): Promise<void> {
    return this.boardRepository.deleteBoard(token, id);
  }
}
