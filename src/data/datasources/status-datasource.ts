import { BoardStatus, BoardStatusInput } from '@/domain/models/status';
import { PaginatedResponse } from '@/domain/models/pagination';
import { apiFetch } from '@/shared/api/http-client';

const statusesPath = (boardId: number) => `/api/v1/boards/${boardId}/statuses/`;
const statusDetailPath = (boardId: number, id: number) => `/api/v1/boards/${boardId}/statuses/${id}/`;

export class StatusDataSource {
  async fetchStatuses(token: string, boardId: number): Promise<BoardStatus[]> {
    const data = await apiFetch<PaginatedResponse<BoardStatus> | BoardStatus[]>(
      statusesPath(boardId),
      { token }
    );
    return Array.isArray(data) ? data : data.results;
  }

  createStatus(
    token: string,
    boardId: number,
    input: BoardStatusInput
  ): Promise<BoardStatus> {
    return apiFetch<BoardStatus>(statusesPath(boardId), { method: 'POST', body: input, token });
  }

  updateStatus(
    token: string,
    boardId: number,
    id: number,
    input: BoardStatusInput
  ): Promise<BoardStatus> {
    return apiFetch<BoardStatus>(statusDetailPath(boardId, id), {
      method: 'PATCH',
      body: input,
      token,
    });
  }

  deleteStatus(token: string, boardId: number, id: number): Promise<void> {
    return apiFetch<void>(statusDetailPath(boardId, id), { method: 'DELETE', token });
  }
}
