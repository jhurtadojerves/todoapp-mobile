import { BoardStatus, BoardStatusInput } from '@/domain/models/status';

export interface StatusRepository {
  fetchStatuses(token: string, boardId: number): Promise<BoardStatus[]>;
  createStatus(token: string, boardId: number, input: BoardStatusInput): Promise<BoardStatus>;
  updateStatus(
    token: string,
    boardId: number,
    id: number,
    input: BoardStatusInput
  ): Promise<BoardStatus>;
  deleteStatus(token: string, boardId: number, id: number): Promise<void>;
}
