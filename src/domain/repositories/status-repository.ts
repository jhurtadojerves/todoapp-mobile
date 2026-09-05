import { BoardStatus, BoardStatusInput } from '@/domain/models/status';
import { PaginatedResponse } from '@/domain/models/pagination';

export interface StatusRepository {
  fetchStatuses(token: string, boardId: number, page: number): Promise<PaginatedResponse<BoardStatus>>;
  createStatus(token: string, boardId: number, input: BoardStatusInput): Promise<BoardStatus>;
  updateStatus(
    token: string,
    boardId: number,
    id: number,
    input: BoardStatusInput
  ): Promise<BoardStatus>;
  deleteStatus(token: string, boardId: number, id: number): Promise<void>;
}
