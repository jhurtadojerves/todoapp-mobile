import { Board, BoardInput } from '@/domain/models/board';
import { PaginatedResponse } from '@/domain/models/pagination';
import { API_BASE_URL } from '@/shared/config/api';

const BOARDS_ENDPOINT = `${API_BASE_URL}/api/v1/boards/`;
const boardDetailEndpoint = (id: number) => `${BOARDS_ENDPOINT}${id}/`;

export class BoardDataSource {
  async fetchBoards(token: string): Promise<Board[]> {
    const response = await fetch(BOARDS_ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as
        | { detail?: string }
        | null;
      throw new Error(errorPayload?.detail ?? 'No se pudieron cargar los tableros.');
    }

    const data = (await response.json()) as PaginatedResponse<Board> | Board[];
    return Array.isArray(data) ? data : data.results;
  }

  async fetchBoard(token: string, id: number): Promise<Board> {
    const response = await fetch(boardDetailEndpoint(id), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as
        | { detail?: string }
        | null;
      throw new Error(errorPayload?.detail ?? 'No se pudo cargar el tablero.');
    }

    return response.json();
  }

  async createBoard(token: string, input: BoardInput): Promise<Board> {
    const response = await fetch(BOARDS_ENDPOINT, {
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
        errorPayload?.detail ?? errorPayload?.name?.[0] ?? 'No se pudo crear el tablero.'
      );
    }

    return response.json();
  }

  async updateBoard(token: string, id: number, input: BoardInput): Promise<Board> {
    const response = await fetch(boardDetailEndpoint(id), {
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
        errorPayload?.detail ?? errorPayload?.name?.[0] ?? 'No se pudo actualizar el tablero.'
      );
    }

    return response.json();
  }

  async deleteBoard(token: string, id: number): Promise<void> {
    const response = await fetch(boardDetailEndpoint(id), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as
        | { detail?: string }
        | null;
      throw new Error(errorPayload?.detail ?? 'No se pudo eliminar el tablero.');
    }
  }
}
