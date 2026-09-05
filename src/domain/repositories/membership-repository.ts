import { BoardMembership, BoardMembershipInput } from '@/domain/models/membership';

export interface MembershipRepository {
  fetchMembers(token: string, boardId: number): Promise<BoardMembership[]>;
  addMember(token: string, boardId: number, input: BoardMembershipInput): Promise<BoardMembership>;
  removeMember(token: string, boardId: number, membershipId: number): Promise<void>;
}
