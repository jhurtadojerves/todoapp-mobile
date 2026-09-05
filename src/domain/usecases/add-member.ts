import { BoardMembership, BoardMembershipInput } from '@/domain/models/membership';
import { MembershipRepository } from '@/domain/repositories/membership-repository';

export class AddMemberUseCase {
  constructor(private readonly membershipRepository: MembershipRepository) {}

  execute(token: string, boardId: number, input: BoardMembershipInput): Promise<BoardMembership> {
    return this.membershipRepository.addMember(token, boardId, input);
  }
}
