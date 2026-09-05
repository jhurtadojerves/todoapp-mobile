import { StatusDataSource } from '@/data/datasources/status-datasource';
import { BoardStatus, BoardStatusInput } from '@/domain/models/status';
import { PaginatedResponse } from '@/domain/models/pagination';
import { StatusRepository } from '@/domain/repositories/status-repository';

export class StatusRepositoryImpl implements StatusRepository {
  constructor(private readonly dataSource: StatusDataSource) {}

  fetchStatuses(token: string, boardId: number, page: number): Promise<PaginatedResponse<BoardStatus>> {
    return this.dataSource.fetchStatuses(token, boardId, page);
  }

  createStatus(token: string, boardId: number, input: BoardStatusInput): Promise<BoardStatus> {
    return this.dataSource.createStatus(token, boardId, input);
  }

  updateStatus(
    token: string,
    boardId: number,
    id: number,
    input: BoardStatusInput
  ): Promise<BoardStatus> {
    return this.dataSource.updateStatus(token, boardId, id, input);
  }

  deleteStatus(token: string, boardId: number, id: number): Promise<void> {
    return this.dataSource.deleteStatus(token, boardId, id);
  }
}
