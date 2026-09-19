import { Sprint, SprintInput, sprintSchema } from '@/domain/models/sprint';
import { PaginatedResponse, paginatedSchema } from '@/domain/models/pagination';
import { apiFetch } from '@/shared/api/http-client';
import { buildQueryString } from '@/shared/api/query-string';

const sprintsPath = (boardId: number) => `/api/v1/boards/${boardId}/sprints/`;
const sprintDetailPath = (boardId: number, id: number) => `/api/v1/boards/${boardId}/sprints/${id}/`;
const paginatedSprintSchema = paginatedSchema(sprintSchema);

export class SprintDataSource {
  fetchSprints(boardId: number, page: number): Promise<PaginatedResponse<Sprint>> {
    return apiFetch(`${sprintsPath(boardId)}${buildQueryString({ page })}`, {
      schema: paginatedSprintSchema,
    });
  }

  createSprint(boardId: number, input: SprintInput): Promise<Sprint> {
    return apiFetch(sprintsPath(boardId), { method: 'POST', body: input, schema: sprintSchema });
  }

  updateSprint(
    boardId: number,
    id: number,
    input: SprintInput
  ): Promise<Sprint> {
    return apiFetch(sprintDetailPath(boardId, id), {
      method: 'PATCH',
      body: input,
      schema: sprintSchema,
    });
  }

  deleteSprint(boardId: number, id: number): Promise<void> {
    return apiFetch<void>(sprintDetailPath(boardId, id), { method: 'DELETE' });
  }
}
