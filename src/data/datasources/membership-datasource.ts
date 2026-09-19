import { BoardMembership, BoardMembershipInput, boardMembershipSchema } from '@/domain/models/membership';
import { PaginatedResponse, paginatedSchema } from '@/domain/models/pagination';
import { apiFetch } from '@/shared/api/http-client';
import { buildQueryString } from '@/shared/api/query-string';

const membersPath = (boardId: number) => `/api/v1/boards/${boardId}/members/`;
const memberDetailPath = (boardId: number, id: number) => `/api/v1/boards/${boardId}/members/${id}/`;
const paginatedBoardMembershipSchema = paginatedSchema(boardMembershipSchema);

export class MembershipDataSource {
  fetchMembers(boardId: number, page: number): Promise<PaginatedResponse<BoardMembership>> {
    return apiFetch(`${membersPath(boardId)}${buildQueryString({ page })}`, {
      schema: paginatedBoardMembershipSchema,
    });
  }

  addMember(
    boardId: number,
    input: BoardMembershipInput
  ): Promise<BoardMembership> {
    return apiFetch(membersPath(boardId), {
      method: 'POST',
      body: input,
      schema: boardMembershipSchema,
    });
  }

  removeMember(boardId: number, membershipId: number): Promise<void> {
    return apiFetch<void>(memberDetailPath(boardId, membershipId), { method: 'DELETE' });
  }
}
