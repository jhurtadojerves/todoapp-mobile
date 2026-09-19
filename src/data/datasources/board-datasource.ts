import { Board, BoardInput, boardSchema } from '@/domain/models/board';
import { PaginatedResponse, paginatedSchema } from '@/domain/models/pagination';
import { apiFetch } from '@/shared/api/http-client';
import { buildQueryString } from '@/shared/api/query-string';

const BOARDS_PATH = '/api/v1/boards/';
const boardDetailPath = (id: number) => `${BOARDS_PATH}${id}/`;
const paginatedBoardSchema = paginatedSchema(boardSchema);

export class BoardDataSource {
  fetchBoards(page: number): Promise<PaginatedResponse<Board>> {
    return apiFetch(`${BOARDS_PATH}${buildQueryString({ page })}`, {
      schema: paginatedBoardSchema,
    });
  }

  fetchBoard(id: number): Promise<Board> {
    return apiFetch(boardDetailPath(id), { schema: boardSchema });
  }

  createBoard(input: BoardInput): Promise<Board> {
    return apiFetch(BOARDS_PATH, { method: 'POST', body: input, schema: boardSchema });
  }

  updateBoard(id: number, input: BoardInput): Promise<Board> {
    return apiFetch(boardDetailPath(id), { method: 'PATCH', body: input, schema: boardSchema });
  }

  deleteBoard(id: number): Promise<void> {
    return apiFetch<void>(boardDetailPath(id), { method: 'DELETE' });
  }
}
