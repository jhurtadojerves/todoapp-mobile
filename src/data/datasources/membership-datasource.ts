import { BoardMembership, BoardMembershipInput } from '@/domain/models/membership';
import { PaginatedResponse } from '@/domain/models/pagination';
import { apiFetch } from '@/shared/api/http-client';

const membersPath = (boardId: number) => `/api/v1/boards/${boardId}/members/`;
const memberDetailPath = (boardId: number, id: number) => `/api/v1/boards/${boardId}/members/${id}/`;

export class MembershipDataSource {
  async fetchMembers(token: string, boardId: number): Promise<BoardMembership[]> {
    const data = await apiFetch<PaginatedResponse<BoardMembership> | BoardMembership[]>(
      membersPath(boardId),
      { token }
    );
    return Array.isArray(data) ? data : data.results;
  }

  addMember(
    token: string,
    boardId: number,
    input: BoardMembershipInput
  ): Promise<BoardMembership> {
    return apiFetch<BoardMembership>(membersPath(boardId), { method: 'POST', body: input, token });
  }

  removeMember(token: string, boardId: number, membershipId: number): Promise<void> {
    return apiFetch<void>(memberDetailPath(boardId, membershipId), { method: 'DELETE', token });
  }
}
