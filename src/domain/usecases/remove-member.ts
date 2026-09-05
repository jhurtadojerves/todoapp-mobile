import { MembershipRepository } from '@/domain/repositories/membership-repository';

export class RemoveMemberUseCase {
  constructor(private readonly membershipRepository: MembershipRepository) {}

  execute(token: string, boardId: number, membershipId: number): Promise<void> {
    return this.membershipRepository.removeMember(token, boardId, membershipId);
  }
}
