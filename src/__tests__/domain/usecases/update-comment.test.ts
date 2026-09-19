import { UpdateCommentUseCase } from '@/domain/usecases/update-comment';
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
  content: 'Updated comment.',
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-02T00:00:00Z',
};

describe('UpdateCommentUseCase', () => {
  let useCase: UpdateCommentUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateCommentUseCase(mockCommentRepository);
  });

  it('should call commentRepository.updateComment with the given task id, comment id and input', async () => {
    const input: CommentInput = { content: 'Updated comment.' };
    mockCommentRepository.updateComment.mockResolvedValue(comment);

    await useCase.execute(1, 1, input);

    expect(mockCommentRepository.updateComment).toHaveBeenCalledWith(1, 1, input);
  });

  it('should return the updated comment from the repository', async () => {
    const input: CommentInput = { content: 'Updated comment.' };
    mockCommentRepository.updateComment.mockResolvedValue(comment);

    const result = await useCase.execute(1, 1, input);

    expect(result).toEqual(comment);
  });

  it('should propagate errors thrown by the repository', async () => {
    const input: CommentInput = { content: 'Updated comment.' };
    mockCommentRepository.updateComment.mockRejectedValue(
      new Error('You do not have permission to perform this action.')
    );

    await expect(useCase.execute(1, 1, input)).rejects.toThrow(
      'You do not have permission to perform this action.'
    );
  });
});
