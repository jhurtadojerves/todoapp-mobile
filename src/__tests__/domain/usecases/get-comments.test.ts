import { GetCommentsUseCase } from '@/domain/usecases/get-comments';
import { CommentRepository } from '@/domain/repositories/comment-repository';
import { Comment } from '@/domain/models/comment';
import { PaginatedResponse } from '@/domain/models/pagination';

const mockCommentRepository: jest.Mocked<CommentRepository> = {
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
const page: PaginatedResponse<Comment> = { count: 1, next: null, previous: null, results: [comment] };

describe('GetCommentsUseCase', () => {
  let useCase: GetCommentsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetCommentsUseCase(mockCommentRepository);
  });

  it('should call commentRepository.fetchComments with the given task id and page', async () => {
    mockCommentRepository.fetchComments.mockResolvedValue(page);

    await useCase.execute(1, 1);

    expect(mockCommentRepository.fetchComments).toHaveBeenCalledWith(1, 1);
  });

  it('should return the paginated response from the repository', async () => {
    mockCommentRepository.fetchComments.mockResolvedValue(page);

    const result = await useCase.execute(1, 1);

    expect(result).toEqual(page);
  });

  it('should propagate errors thrown by the repository', async () => {
    mockCommentRepository.fetchComments.mockRejectedValue(new Error('Token is expired.'));

    await expect(useCase.execute(1, 1)).rejects.toThrow('Token is expired.');
  });
});
