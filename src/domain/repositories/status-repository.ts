import { BoardStatus, BoardStatusInput } from '@/domain/models/status';
import { PaginatedResponse } from '@/domain/models/pagination';

export interface StatusRepository {
  fetchStatuses(boardId: number, page: number): Promise<PaginatedResponse<BoardStatus>>;
  createStatus(boardId: number, input: BoardStatusInput): Promise<BoardStatus>;
  updateStatus(
    boardId: number,
    id: number,
    input: BoardStatusInput
  ): Promise<BoardStatus>;
  deleteStatus(boardId: number, id: number): Promise<void>;
}
