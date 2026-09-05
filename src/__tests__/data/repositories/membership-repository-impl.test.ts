import { MembershipRepositoryImpl } from '@/data/repositories/membership-repository-impl';
import { MembershipDataSource } from '@/data/datasources/membership-datasource';
import { BoardMembership, BoardMembershipInput } from '@/domain/models/membership';
import { PaginatedResponse } from '@/domain/models/pagination';

const mockDataSource: jest.Mocked<MembershipDataSource> = {
  fetchMembers: jest.fn(),
  addMember: jest.fn(),
  removeMember: jest.fn(),
};

const membership: BoardMembership = {
  id: 5,
  board_id: 1,
  user: { id: 2, username: 'jane', email: 'jane@example.com' },
  role: 'member',
  created: '2026-01-01T00:00:00Z',
};

describe('MembershipRepositoryImpl', () => {
  let repository: MembershipRepositoryImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new MembershipRepositoryImpl(mockDataSource);
  });

  it('should delegate fetchMembers to the data source', async () => {
    const page: PaginatedResponse<BoardMembership> = { count: 1, next: null, previous: null, results: [membership] };
    mockDataSource.fetchMembers.mockResolvedValue(page);

    const result = await repository.fetchMembers('valid-token', 1, 1);

    expect(mockDataSource.fetchMembers).toHaveBeenCalledWith('valid-token', 1, 1);
    expect(result).toEqual(page);
  });

  it('should delegate addMember to the data source', async () => {
    const input: BoardMembershipInput = { email: 'jane@example.com' };
    mockDataSource.addMember.mockResolvedValue(membership);

    const result = await repository.addMember('valid-token', 1, input);

    expect(mockDataSource.addMember).toHaveBeenCalledWith('valid-token', 1, input);
    expect(result).toEqual(membership);
  });

  it('should delegate removeMember to the data source', async () => {
    mockDataSource.removeMember.mockResolvedValue(undefined);

    await repository.removeMember('valid-token', 1, 5);

    expect(mockDataSource.removeMember).toHaveBeenCalledWith('valid-token', 1, 5);
  });

  it('should propagate errors from the data source', async () => {
    mockDataSource.fetchMembers.mockRejectedValue(new Error('Network error'));

    await expect(repository.fetchMembers('some-token', 1, 1)).rejects.toThrow('Network error');
  });
});
