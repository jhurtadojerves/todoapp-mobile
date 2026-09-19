import { MembershipRepository } from '@/domain/repositories/membership-repository';

export class RemoveMemberUseCase {
  constructor(private readonly membershipRepository: MembershipRepository) {}

  execute(boardId: number, membershipId: number): Promise<void> {
    return this.membershipRepository.removeMember(boardId, membershipId);
  }
}
