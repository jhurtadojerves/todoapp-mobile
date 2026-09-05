import { Sprint, SprintInput } from '@/domain/models/sprint';
import { PaginatedResponse } from '@/domain/models/pagination';
import { apiFetch } from '@/shared/api/http-client';
import { buildQueryString } from '@/shared/api/query-string';

const sprintsPath = (boardId: number) => `/api/v1/boards/${boardId}/sprints/`;
const sprintDetailPath = (boardId: number, id: number) => `/api/v1/boards/${boardId}/sprints/${id}/`;

export class SprintDataSource {
  fetchSprints(token: string, boardId: number, page: number): Promise<PaginatedResponse<Sprint>> {
    return apiFetch<PaginatedResponse<Sprint>>(`${sprintsPath(boardId)}${buildQueryString({ page })}`, {
      token,
    });
  }

  createSprint(token: string, boardId: number, input: SprintInput): Promise<Sprint> {
    return apiFetch<Sprint>(sprintsPath(boardId), { method: 'POST', body: input, token });
  }

  updateSprint(
    token: string,
    boardId: number,
    id: number,
    input: SprintInput
  ): Promise<Sprint> {
    return apiFetch<Sprint>(sprintDetailPath(boardId, id), { method: 'PATCH', body: input, token });
  }

  deleteSprint(token: string, boardId: number, id: number): Promise<void> {
    return apiFetch<void>(sprintDetailPath(boardId, id), { method: 'DELETE', token });
  }
}
