import { BoardStatus, BoardStatusInput } from '@/domain/models/status';
import { StatusRepository } from '@/domain/repositories/status-repository';

export class UpdateStatusUseCase {
  constructor(private readonly statusRepository: StatusRepository) {}

  execute(
    token: string,
    boardId: number,
    id: number,
    input: BoardStatusInput
  ): Promise<BoardStatus> {
    return this.statusRepository.updateStatus(token, boardId, id, input);
  }
}
