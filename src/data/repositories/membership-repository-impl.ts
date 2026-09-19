import { MembershipDataSource } from '@/data/datasources/membership-datasource';
import { BoardMembership, BoardMembershipInput } from '@/domain/models/membership';
import { PaginatedResponse } from '@/domain/models/pagination';
import { MembershipRepository } from '@/domain/repositories/membership-repository';

export class MembershipRepositoryImpl implements MembershipRepository {
  constructor(private readonly dataSource: MembershipDataSource) {}

  fetchMembers(boardId: number, page: number): Promise<PaginatedResponse<BoardMembership>> {
    return this.dataSource.fetchMembers(boardId, page);
  }

  addMember(boardId: number, input: BoardMembershipInput): Promise<BoardMembership> {
    return this.dataSource.addMember(boardId, input);
  }

  removeMember(boardId: number, membershipId: number): Promise<void> {
    return this.dataSource.removeMember(boardId, membershipId);
  }
}
