import { BoardStatus } from '@/domain/models/status';
import { StatusRepository } from '@/domain/repositories/status-repository';

export class GetStatusesUseCase {
  constructor(private readonly statusRepository: StatusRepository) {}

  execute(token: string, boardId: number): Promise<BoardStatus[]> {
    return this.statusRepository.fetchStatuses(token, boardId);
  }
}
