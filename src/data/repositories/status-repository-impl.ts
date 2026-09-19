import { StatusDataSource } from '@/data/datasources/status-datasource';
import { BoardStatus, BoardStatusInput } from '@/domain/models/status';
import { PaginatedResponse } from '@/domain/models/pagination';
import { StatusRepository } from '@/domain/repositories/status-repository';

export class StatusRepositoryImpl implements StatusRepository {
  constructor(private readonly dataSource: StatusDataSource) {}

  fetchStatuses(boardId: number, page: number): Promise<PaginatedResponse<BoardStatus>> {
    return this.dataSource.fetchStatuses(boardId, page);
  }

  createStatus(boardId: number, input: BoardStatusInput): Promise<BoardStatus> {
    return this.dataSource.createStatus(boardId, input);
  }

  updateStatus(
    boardId: number,
    id: number,
    input: BoardStatusInput
  ): Promise<BoardStatus> {
    return this.dataSource.updateStatus(boardId, id, input);
  }

  deleteStatus(boardId: number, id: number): Promise<void> {
    return this.dataSource.deleteStatus(boardId, id);
  }
}
