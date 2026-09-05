import { Board, BoardInput } from '@/domain/models/board';
import { PaginatedResponse } from '@/domain/models/pagination';

export interface BoardRepository {
  fetchBoards(token: string, page: number): Promise<PaginatedResponse<Board>>;
  fetchBoard(token: string, id: number): Promise<Board>;
  createBoard(token: string, input: BoardInput): Promise<Board>;
  updateBoard(token: string, id: number, input: BoardInput): Promise<Board>;
  deleteBoard(token: string, id: number): Promise<void>;
}
