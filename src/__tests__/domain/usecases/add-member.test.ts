import { AddMemberUseCase } from '@/domain/usecases/add-member';
import { MembershipRepository } from '@/domain/repositories/membership-repository';
import { BoardMembership, BoardMembershipInput } from '@/domain/models/membership';

const mockMembershipRepository: jest.Mocked<MembershipRepository> = {
  fetchMembers: jest.fn(),
  addMember: jest.fn(),
  removeMember: jest.fn(),
};

const membership: BoardMembership = {
  id: 5,
  boardId: 1,
  user: { id: 2, username: 'jane', email: 'jane@example.com' },
  role: 'member',
  created: '2026-01-01T00:00:00Z',
};

describe('AddMemberUseCase', () => {
  let useCase: AddMemberUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new AddMemberUseCase(mockMembershipRepository);
  });

  it('should call membershipRepository.addMember with the given board id and input', async () => {
    const input: BoardMembershipInput = { email: 'jane@example.com' };
    mockMembershipRepository.addMember.mockResolvedValue(membership);

    await useCase.execute(1, input);

    expect(mockMembershipRepository.addMember).toHaveBeenCalledWith(1, input);
  });

  it('should return the created membership from the repository', async () => {
    const input: BoardMembershipInput = { email: 'jane@example.com' };
    mockMembershipRepository.addMember.mockResolvedValue(membership);

    const result = await useCase.execute(1, input);

    expect(result).toEqual(membership);
  });

  it('should propagate errors thrown by the repository', async () => {
    const input: BoardMembershipInput = { email: 'unknown@example.com' };
    mockMembershipRepository.addMember.mockRejectedValue(
      new Error('No user found with that email.')
    );

    await expect(useCase.execute(1, input)).rejects.toThrow(
      'No user found with that email.'
    );
  });
});
