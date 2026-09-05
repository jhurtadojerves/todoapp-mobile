/**
 * Integration tests: Membership usecases → MembershipRepositoryImpl → MembershipDataSource
 * Only `fetch` is mocked (the real external boundary).
 */
import { MembershipDataSource } from '@/data/datasources/membership-datasource';
import { MembershipRepositoryImpl } from '@/data/repositories/membership-repository-impl';
import { AddMemberUseCase } from '@/domain/usecases/add-member';
import { GetMembersUseCase } from '@/domain/usecases/get-members';
import { RemoveMemberUseCase } from '@/domain/usecases/remove-member';
import { BoardMembership } from '@/domain/models/membership';

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

function buildDependencies() {
  const dataSource = new MembershipDataSource();
  const repository = new MembershipRepositoryImpl(dataSource);
  return {
    getMembersUseCase: new GetMembersUseCase(repository),
    addMemberUseCase: new AddMemberUseCase(repository),
    removeMemberUseCase: new RemoveMemberUseCase(repository),
  };
}

const owner: BoardMembership = {
  id: 1,
  board_id: 1,
  user: { id: 1, username: 'julio', email: 'julio@example.com' },
  role: 'owner',
  created: '2026-01-01T00:00:00Z',
};

const member: BoardMembership = {
  id: 2,
  board_id: 1,
  user: { id: 2, username: 'jane', email: 'jane@example.com' },
  role: 'member',
  created: '2026-01-02T00:00:00Z',
};

describe('Board members flow (integration)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should list the board members from a paginated response', async () => {
    const { getMembersUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(
      mockResponse(200, { count: 2, next: null, previous: null, results: [owner, member] })
    );

    const result = await getMembersUseCase.execute('valid-token', 1, 1);

    expect(result.results).toEqual([owner, member]);
  });

  it('should invite a member by email and return the created membership', async () => {
    const { addMemberUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(mockResponse(201, member));

    const result = await addMemberUseCase.execute('valid-token', 1, { email: 'jane@example.com' });

    expect(result).toEqual(member);
  });

  it('should surface a validation error when the invited email does not exist', async () => {
    const { addMemberUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(mockResponse(400, { email: ['No user found with that email.'] }));

    await expect(
      addMemberUseCase.execute('valid-token', 1, { email: 'ghost@example.com' })
    ).rejects.toThrow('No user found with that email.');
  });

  it('should remove a member', async () => {
    const { removeMemberUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(mockResponse(204, null));

    await expect(removeMemberUseCase.execute('valid-token', 1, 2)).resolves.toBeUndefined();
  });

  it('should surface a 403 as a permission error when a non-owner tries to remove a member', async () => {
    const { removeMemberUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(
      mockResponse(403, { detail: 'You do not have permission to perform this action.' })
    );

    await expect(removeMemberUseCase.execute('valid-token', 1, 2)).rejects.toThrow(
      'You do not have permission to perform this action.'
    );
  });
});
