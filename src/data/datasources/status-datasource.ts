import { BoardStatus, BoardStatusInput, boardStatusSchema } from '@/domain/models/status';
import { PaginatedResponse, paginatedSchema } from '@/domain/models/pagination';
import { apiFetch } from '@/shared/api/http-client';
import { buildQueryString } from '@/shared/api/query-string';

const statusesPath = (boardId: number) => `/api/v1/boards/${boardId}/statuses/`;
const statusDetailPath = (boardId: number, id: number) => `/api/v1/boards/${boardId}/statuses/${id}/`;
const paginatedBoardStatusSchema = paginatedSchema(boardStatusSchema);

export class StatusDataSource {
  fetchStatuses(boardId: number, page: number): Promise<PaginatedResponse<BoardStatus>> {
    return apiFetch(`${statusesPath(boardId)}${buildQueryString({ page })}`, {
      schema: paginatedBoardStatusSchema,
    });
  }

  createStatus(
    boardId: number,
    input: BoardStatusInput
  ): Promise<BoardStatus> {
    return apiFetch(statusesPath(boardId), {
      method: 'POST',
      body: input,
      schema: boardStatusSchema,
    });
  }

  updateStatus(
    boardId: number,
    id: number,
    input: BoardStatusInput
  ): Promise<BoardStatus> {
    return apiFetch(statusDetailPath(boardId, id), {
      method: 'PATCH',
      body: input,
      schema: boardStatusSchema,
    });
  }

  deleteStatus(boardId: number, id: number): Promise<void> {
    return apiFetch<void>(statusDetailPath(boardId, id), { method: 'DELETE' });
  }
}
