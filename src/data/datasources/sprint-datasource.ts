import { Sprint, SprintInput } from '@/domain/models/sprint';
import { PaginatedResponse } from '@/domain/models/pagination';
import { API_BASE_URL } from '@/shared/config/api';

const sprintsEndpoint = (boardId: number) => `${API_BASE_URL}/api/v1/boards/${boardId}/sprints/`;
const sprintDetailEndpoint = (boardId: number, id: number) =>
  `${API_BASE_URL}/api/v1/boards/${boardId}/sprints/${id}/`;

export class SprintDataSource {
  async fetchSprints(token: string, boardId: number): Promise<Sprint[]> {
    const response = await fetch(sprintsEndpoint(boardId), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as
        | { detail?: string }
        | null;
      throw new Error(errorPayload?.detail ?? 'No se pudieron cargar los sprints.');
    }

    const data = (await response.json()) as PaginatedResponse<Sprint> | Sprint[];
    return Array.isArray(data) ? data : data.results;
  }

  async createSprint(token: string, boardId: number, input: SprintInput): Promise<Sprint> {
    const response = await fetch(sprintsEndpoint(boardId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as
        | { detail?: string; name?: string[] }
        | null;
      throw new Error(
        errorPayload?.detail ?? errorPayload?.name?.[0] ?? 'No se pudo crear el sprint.'
      );
    }

    return response.json();
  }

  async updateSprint(
    token: string,
    boardId: number,
    id: number,
    input: SprintInput
  ): Promise<Sprint> {
    const response = await fetch(sprintDetailEndpoint(boardId, id), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as
        | { detail?: string; name?: string[] }
        | null;
      throw new Error(
        errorPayload?.detail ?? errorPayload?.name?.[0] ?? 'No se pudo actualizar el sprint.'
      );
    }

    return response.json();
  }

  async deleteSprint(token: string, boardId: number, id: number): Promise<void> {
    const response = await fetch(sprintDetailEndpoint(boardId, id), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as
        | { detail?: string }
        | null;
      throw new Error(errorPayload?.detail ?? 'No se pudo eliminar el sprint.');
    }
  }
}
