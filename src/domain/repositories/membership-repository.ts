import { BoardMembership, BoardMembershipInput } from '@/domain/models/membership';
import { PaginatedResponse } from '@/domain/models/pagination';

export interface MembershipRepository {
  fetchMembers(boardId: number, page: number): Promise<PaginatedResponse<BoardMembership>>;
  addMember(boardId: number, input: BoardMembershipInput): Promise<BoardMembership>;
  removeMember(boardId: number, membershipId: number): Promise<void>;
}
