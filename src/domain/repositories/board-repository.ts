import { Board, BoardInput } from '@/domain/models/board';
import { PaginatedResponse } from '@/domain/models/pagination';

export interface BoardRepository {
  fetchBoards(page: number): Promise<PaginatedResponse<Board>>;
  fetchBoard(id: number): Promise<Board>;
  createBoard(input: BoardInput): Promise<Board>;
  updateBoard(id: number, input: BoardInput): Promise<Board>;
  deleteBoard(id: number): Promise<void>;
}
