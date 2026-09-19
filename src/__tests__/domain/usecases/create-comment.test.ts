import { CreateCommentUseCase } from '@/domain/usecases/create-comment';
import { CommentRepository } from '@/domain/repositories/comment-repository';
import { Comment, CommentInput } from '@/domain/models/comment';

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

describe('CreateCommentUseCase', () => {
  let useCase: CreateCommentUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateCommentUseCase(mockCommentRepository);
  });

  it('should call commentRepository.createComment with the given task id and input', async () => {
    const input: CommentInput = { content: 'Looks good to me.' };
    mockCommentRepository.createComment.mockResolvedValue(comment);

    await useCase.execute(1, input);

    expect(mockCommentRepository.createComment).toHaveBeenCalledWith(1, input);
  });

  it('should return the created comment from the repository', async () => {
    const input: CommentInput = { content: 'Looks good to me.' };
    mockCommentRepository.createComment.mockResolvedValue(comment);

    const result = await useCase.execute(1, input);

    expect(result).toEqual(comment);
  });

  it('should propagate errors thrown by the repository', async () => {
    const input: CommentInput = { content: '' };
    mockCommentRepository.createComment.mockRejectedValue(new Error('This field may not be blank.'));

    await expect(useCase.execute(1, input)).rejects.toThrow(
      'This field may not be blank.'
    );
  });
});
