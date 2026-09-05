import { Board, BoardInput } from '@/domain/models/board';
import { PaginatedResponse } from '@/domain/models/pagination';
import { apiFetch } from '@/shared/api/http-client';
import { buildQueryString } from '@/shared/api/query-string';

const BOARDS_PATH = '/api/v1/boards/';
const boardDetailPath = (id: number) => `${BOARDS_PATH}${id}/`;

export class BoardDataSource {
  fetchBoards(token: string, page: number): Promise<PaginatedResponse<Board>> {
    return apiFetch<PaginatedResponse<Board>>(`${BOARDS_PATH}${buildQueryString({ page })}`, { token });
  }

  fetchBoard(token: string, id: number): Promise<Board> {
    return apiFetch<Board>(boardDetailPath(id), { token });
  }

  createBoard(token: string, input: BoardInput): Promise<Board> {
    return apiFetch<Board>(BOARDS_PATH, { method: 'POST', body: input, token });
  }

  updateBoard(token: string, id: number, input: BoardInput): Promise<Board> {
    return apiFetch<Board>(boardDetailPath(id), { method: 'PATCH', body: input, token });
  }

  deleteBoard(token: string, id: number): Promise<void> {
    return apiFetch<void>(boardDetailPath(id), { method: 'DELETE', token });
  }
}
