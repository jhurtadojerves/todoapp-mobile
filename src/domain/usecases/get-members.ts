import { BoardMembership } from '@/domain/models/membership';
import { PaginatedResponse } from '@/domain/models/pagination';
import { MembershipRepository } from '@/domain/repositories/membership-repository';

export class GetMembersUseCase {
  constructor(private readonly membershipRepository: MembershipRepository) {}

  execute(boardId: number, page: number): Promise<PaginatedResponse<BoardMembership>> {
    return this.membershipRepository.fetchMembers(boardId, page);
  }
}
