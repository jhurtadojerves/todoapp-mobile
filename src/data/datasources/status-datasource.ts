import { BoardStatus, BoardStatusInput } from '@/domain/models/status';
import { PaginatedResponse } from '@/domain/models/pagination';
import { API_BASE_URL } from '@/shared/config/api';

const statusesEndpoint = (boardId: number) => `${API_BASE_URL}/api/v1/boards/${boardId}/statuses/`;
const statusDetailEndpoint = (boardId: number, id: number) =>
  `${API_BASE_URL}/api/v1/boards/${boardId}/statuses/${id}/`;

export class StatusDataSource {
  async fetchStatuses(token: string, boardId: number): Promise<BoardStatus[]> {
    const response = await fetch(statusesEndpoint(boardId), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as
        | { detail?: string }
        | null;
      throw new Error(errorPayload?.detail ?? 'No se pudieron cargar los estados.');
    }

    const data = (await response.json()) as PaginatedResponse<BoardStatus> | BoardStatus[];
    return Array.isArray(data) ? data : data.results;
  }

  async createStatus(
    token: string,
    boardId: number,
    input: BoardStatusInput
  ): Promise<BoardStatus> {
    const response = await fetch(statusesEndpoint(boardId), {
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
        errorPayload?.detail ?? errorPayload?.name?.[0] ?? 'No se pudo crear el estado.'
      );
    }

    return response.json();
  }

  async updateStatus(
    token: string,
    boardId: number,
    id: number,
    input: BoardStatusInput
  ): Promise<BoardStatus> {
    const response = await fetch(statusDetailEndpoint(boardId, id), {
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
        errorPayload?.detail ?? errorPayload?.name?.[0] ?? 'No se pudo actualizar el estado.'
      );
    }

    return response.json();
  }

  async deleteStatus(token: string, boardId: number, id: number): Promise<void> {
    const response = await fetch(statusDetailEndpoint(boardId, id), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as
        | { detail?: string }
        | null;
      throw new Error(errorPayload?.detail ?? 'No se pudo eliminar el estado.');
    }
  }
}
