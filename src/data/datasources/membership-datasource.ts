import { BoardMembership, BoardMembershipInput } from '@/domain/models/membership';
import { PaginatedResponse } from '@/domain/models/pagination';
import { API_BASE_URL } from '@/shared/config/api';

const membersEndpoint = (boardId: number) => `${API_BASE_URL}/api/v1/boards/${boardId}/members/`;
const memberDetailEndpoint = (boardId: number, id: number) =>
  `${API_BASE_URL}/api/v1/boards/${boardId}/members/${id}/`;

export class MembershipDataSource {
  async fetchMembers(token: string, boardId: number): Promise<BoardMembership[]> {
    const response = await fetch(membersEndpoint(boardId), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as
        | { detail?: string }
        | null;
      throw new Error(errorPayload?.detail ?? 'No se pudieron cargar los miembros.');
    }

    const data = (await response.json()) as PaginatedResponse<BoardMembership> | BoardMembership[];
    return Array.isArray(data) ? data : data.results;
  }

  async addMember(
    token: string,
    boardId: number,
    input: BoardMembershipInput
  ): Promise<BoardMembership> {
    const response = await fetch(membersEndpoint(boardId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as
        | { detail?: string; email?: string[] }
        | null;
      throw new Error(
        errorPayload?.detail ?? errorPayload?.email?.[0] ?? 'No se pudo agregar al miembro.'
      );
    }

    return response.json();
  }

  async removeMember(token: string, boardId: number, membershipId: number): Promise<void> {
    const response = await fetch(memberDetailEndpoint(boardId, membershipId), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as
        | { detail?: string }
        | null;
      throw new Error(errorPayload?.detail ?? 'No se pudo quitar al miembro.');
    }
  }
}
