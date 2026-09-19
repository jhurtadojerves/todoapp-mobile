import { GetMembersUseCase } from '@/domain/usecases/get-members';
import { MembershipRepository } from '@/domain/repositories/membership-repository';
import { BoardMembership } from '@/domain/models/membership';
import { PaginatedResponse } from '@/domain/models/pagination';

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
const page: PaginatedResponse<BoardMembership> = { count: 1, next: null, previous: null, results: [membership] };

describe('GetMembersUseCase', () => {
  let useCase: GetMembersUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetMembersUseCase(mockMembershipRepository);
  });

  it('should call membershipRepository.fetchMembers with the given board id and page', async () => {
    mockMembershipRepository.fetchMembers.mockResolvedValue(page);

    await useCase.execute(1, 1);

    expect(mockMembershipRepository.fetchMembers).toHaveBeenCalledWith(1, 1);
  });

  it('should return the paginated response from the repository', async () => {
    mockMembershipRepository.fetchMembers.mockResolvedValue(page);

    const result = await useCase.execute(1, 1);

    expect(result).toEqual(page);
  });

  it('should propagate errors thrown by the repository', async () => {
    mockMembershipRepository.fetchMembers.mockRejectedValue(
      new Error('You do not have permission to perform this action.')
    );

    await expect(useCase.execute(1, 1)).rejects.toThrow(
      'You do not have permission to perform this action.'
    );
  });
});
