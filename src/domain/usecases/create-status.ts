import { BoardStatus, BoardStatusInput } from '@/domain/models/status';
import { StatusRepository } from '@/domain/repositories/status-repository';

export class CreateStatusUseCase {
  constructor(private readonly statusRepository: StatusRepository) {}

  execute(token: string, boardId: number, input: BoardStatusInput): Promise<BoardStatus> {
    return this.statusRepository.createStatus(token, boardId, input);
  }
}
