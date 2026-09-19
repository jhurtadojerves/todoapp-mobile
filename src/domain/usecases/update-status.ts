import { BoardStatus, BoardStatusInput } from '@/domain/models/status';
import { StatusRepository } from '@/domain/repositories/status-repository';

export class UpdateStatusUseCase {
  constructor(private readonly statusRepository: StatusRepository) {}

  execute(
    boardId: number,
    id: number,
    input: BoardStatusInput
  ): Promise<BoardStatus> {
    return this.statusRepository.updateStatus(boardId, id, input);
  }
}
