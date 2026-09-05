import { BoardMembership } from '@/domain/models/membership';
import { MembershipRepository } from '@/domain/repositories/membership-repository';

export class GetMembersUseCase {
  constructor(private readonly membershipRepository: MembershipRepository) {}

  execute(token: string, boardId: number): Promise<BoardMembership[]> {
    return this.membershipRepository.fetchMembers(token, boardId);
  }
}
