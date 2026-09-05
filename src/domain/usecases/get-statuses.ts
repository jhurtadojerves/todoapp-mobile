import { BoardStatus } from '@/domain/models/status';
import { PaginatedResponse } from '@/domain/models/pagination';
import { StatusRepository } from '@/domain/repositories/status-repository';

export class GetStatusesUseCase {
  constructor(private readonly statusRepository: StatusRepository) {}

  execute(token: string, boardId: number, page: number): Promise<PaginatedResponse<BoardStatus>> {
    return this.statusRepository.fetchStatuses(token, boardId, page);
  }
}
