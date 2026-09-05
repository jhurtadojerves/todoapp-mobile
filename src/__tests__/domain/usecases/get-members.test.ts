import { GetMembersUseCase } from '@/domain/usecases/get-members';
import { MembershipRepository } from '@/domain/repositories/membership-repository';
import { BoardMembership } from '@/domain/models/membership';

const mockMembershipRepository: jest.Mocked<MembershipRepository> = {
  fetchMembers: jest.fn(),
  addMember: jest.fn(),
  removeMember: jest.fn(),
};

const members: BoardMembership[] = [
  {
    id: 5,
    board_id: 1,
    user: { id: 2, username: 'jane', email: 'jane@example.com' },
    role: 'member',
    created: '2026-01-01T00:00:00Z',
  },
];

describe('GetMembersUseCase', () => {
  let useCase: GetMembersUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetMembersUseCase(mockMembershipRepository);
  });

  it('should call membershipRepository.fetchMembers with the given token and board id', async () => {
    mockMembershipRepository.fetchMembers.mockResolvedValue(members);

    await useCase.execute('valid-token', 1);

    expect(mockMembershipRepository.fetchMembers).toHaveBeenCalledWith('valid-token', 1);
  });

  it('should return the members from the repository', async () => {
    mockMembershipRepository.fetchMembers.mockResolvedValue(members);

    const result = await useCase.execute('valid-token', 1);

    expect(result).toEqual(members);
  });

  it('should propagate errors thrown by the repository', async () => {
    mockMembershipRepository.fetchMembers.mockRejectedValue(
      new Error('You do not have permission to perform this action.')
    );

    await expect(useCase.execute('valid-token', 1)).rejects.toThrow(
      'You do not have permission to perform this action.'
    );
  });
});
