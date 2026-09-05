import { MembershipDataSource } from '@/data/datasources/membership-datasource';
import { BoardMembership, BoardMembershipInput } from '@/domain/models/membership';
import { PaginatedResponse } from '@/domain/models/pagination';
import { MembershipRepository } from '@/domain/repositories/membership-repository';

export class MembershipRepositoryImpl implements MembershipRepository {
  constructor(private readonly dataSource: MembershipDataSource) {}

  fetchMembers(token: string, boardId: number, page: number): Promise<PaginatedResponse<BoardMembership>> {
    return this.dataSource.fetchMembers(token, boardId, page);
  }

  addMember(token: string, boardId: number, input: BoardMembershipInput): Promise<BoardMembership> {
    return this.dataSource.addMember(token, boardId, input);
  }

  removeMember(token: string, boardId: number, membershipId: number): Promise<void> {
    return this.dataSource.removeMember(token, boardId, membershipId);
  }
}
