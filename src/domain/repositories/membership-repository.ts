import { BoardMembership, BoardMembershipInput } from '@/domain/models/membership';
import { PaginatedResponse } from '@/domain/models/pagination';

export interface MembershipRepository {
  fetchMembers(token: string, boardId: number, page: number): Promise<PaginatedResponse<BoardMembership>>;
  addMember(token: string, boardId: number, input: BoardMembershipInput): Promise<BoardMembership>;
  removeMember(token: string, boardId: number, membershipId: number): Promise<void>;
}
