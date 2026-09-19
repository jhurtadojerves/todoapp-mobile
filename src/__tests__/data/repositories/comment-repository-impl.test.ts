import { CommentRepositoryImpl } from '@/data/repositories/comment-repository-impl';
import { CommentDataSource } from '@/data/datasources/comment-datasource';
import { Comment, CommentInput } from '@/domain/models/comment';
import { PaginatedResponse } from '@/domain/models/pagination';

const mockDataSource: jest.Mocked<CommentDataSource> = {
  fetchComments: jest.fn(),
  createComment: jest.fn(),
  updateComment: jest.fn(),
  deleteComment: jest.fn(),
};

const comment: Comment = {
  id: 1,
  taskId: 1,
  userId: 7,
  content: 'Looks good to me.',
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-01T00:00:00Z',
};

describe('CommentRepositoryImpl', () => {
  let repository: CommentRepositoryImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new CommentRepositoryImpl(mockDataSource);
  });

  it('should delegate fetchComments to the data source', async () => {
    const page: PaginatedResponse<Comment> = { count: 1, next: null, previous: null, results: [comment] };
    mockDataSource.fetchComments.mockResolvedValue(page);

    const result = await repository.fetchComments(1, 1);

    expect(mockDataSource.fetchComments).toHaveBeenCalledWith(1, 1);
    expect(result).toEqual(page);
  });

  it('should delegate createComment to the data source', async () => {
    const input: CommentInput = { content: 'Looks good to me.' };
    mockDataSource.createComment.mockResolvedValue(comment);

    const result = await repository.createComment(1, input);

    expect(mockDataSource.createComment).toHaveBeenCalledWith(1, input);
    expect(result).toEqual(comment);
  });

  it('should delegate updateComment to the data source', async () => {
    const input: CommentInput = { content: 'Updated.' };
    mockDataSource.updateComment.mockResolvedValue(comment);

    const result = await repository.updateComment(1, 1, input);

    expect(mockDataSource.updateComment).toHaveBeenCalledWith(1, 1, input);
    expect(result).toEqual(comment);
  });

  it('should delegate deleteComment to the data source', async () => {
    mockDataSource.deleteComment.mockResolvedValue(undefined);

    await repository.deleteComment(1, 1);

    expect(mockDataSource.deleteComment).toHaveBeenCalledWith(1, 1);
  });

  it('should propagate errors from the data source', async () => {
    mockDataSource.fetchComments.mockRejectedValue(new Error('Network error'));

    await expect(repository.fetchComments(1, 1)).rejects.toThrow('Network error');
  });
});
