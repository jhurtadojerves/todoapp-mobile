import { RemoveMemberUseCase } from '@/domain/usecases/remove-member';
import { MembershipRepository } from '@/domain/repositories/membership-repository';

const mockMembershipRepository: jest.Mocked<MembershipRepository> = {
  fetchMembers: jest.fn(),
  addMember: jest.fn(),
  removeMember: jest.fn(),
};

describe('RemoveMemberUseCase', () => {
  let useCase: RemoveMemberUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RemoveMemberUseCase(mockMembershipRepository);
  });

  it('should call membershipRepository.removeMember with the given board id and membership id', async () => {
    mockMembershipRepository.removeMember.mockResolvedValue(undefined);

    await useCase.execute(1, 5);

    expect(mockMembershipRepository.removeMember).toHaveBeenCalledWith(1, 5);
  });

  it('should propagate errors thrown by the repository', async () => {
    mockMembershipRepository.removeMember.mockRejectedValue(
      new Error('You do not have permission to perform this action.')
    );

    await expect(useCase.execute(1, 5)).rejects.toThrow(
      'You do not have permission to perform this action.'
    );
  });
});
