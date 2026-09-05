/**
 * Integration tests: Comment usecases → CommentRepositoryImpl → CommentDataSource
 * Only `fetch` is mocked (the real external boundary).
 */
import { CommentDataSource } from '@/data/datasources/comment-datasource';
import { CommentRepositoryImpl } from '@/data/repositories/comment-repository-impl';
import { CreateCommentUseCase } from '@/domain/usecases/create-comment';
import { DeleteCommentUseCase } from '@/domain/usecases/delete-comment';
import { GetCommentsUseCase } from '@/domain/usecases/get-comments';
import { UpdateCommentUseCase } from '@/domain/usecases/update-comment';
import { Comment } from '@/domain/models/comment';

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
  const dataSource = new CommentDataSource();
  const repository = new CommentRepositoryImpl(dataSource);
  return {
    getCommentsUseCase: new GetCommentsUseCase(repository),
    createCommentUseCase: new CreateCommentUseCase(repository),
    updateCommentUseCase: new UpdateCommentUseCase(repository),
    deleteCommentUseCase: new DeleteCommentUseCase(repository),
  };
}

const comment1: Comment = {
  id: 1,
  task_id: 1,
  user_id: 7,
  content: 'First comment.',
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-01T00:00:00Z',
};

const comment2: Comment = {
  id: 2,
  task_id: 1,
  user_id: 3,
  content: 'Second comment.',
  created: '2026-01-02T00:00:00Z',
  modified: '2026-01-02T00:00:00Z',
};

describe('Comments flow (integration)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should list comments for a task', async () => {
    const { getCommentsUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(
      mockResponse(200, { count: 2, next: null, previous: null, results: [comment1, comment2] })
    );

    const result = await getCommentsUseCase.execute('valid-token', 1, 1);

    expect(result.results).toEqual([comment1, comment2]);
  });

  it('should create a comment', async () => {
    const { createCommentUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(mockResponse(201, comment1));

    const result = await createCommentUseCase.execute('valid-token', 1, { content: comment1.content });

    expect(result).toEqual(comment1);
  });

  it('should update a comment', async () => {
    const { updateCommentUseCase } = buildDependencies();
    const updated = { ...comment1, content: 'Edited comment.' };
    mockFetch.mockResolvedValue(mockResponse(200, updated));

    const result = await updateCommentUseCase.execute('valid-token', 1, 1, { content: 'Edited comment.' });

    expect(result).toEqual(updated);
  });

  it('should delete a comment', async () => {
    const { deleteCommentUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(mockResponse(204, null));

    await expect(deleteCommentUseCase.execute('valid-token', 1, 1)).resolves.toBeUndefined();
  });

  it('should surface a 403 as a permission error when a non-author, non-owner tries to edit a comment', async () => {
    const { updateCommentUseCase } = buildDependencies();
    mockFetch.mockResolvedValue(
      mockResponse(403, { detail: 'You do not have permission to perform this action.' })
    );

    await expect(
      updateCommentUseCase.execute('valid-token', 1, 2, { content: 'Trying to edit someone else\'s comment' })
    ).rejects.toThrow('You do not have permission to perform this action.');
  });
});
