import { DeleteCommentUseCase } from '@/domain/usecases/delete-comment';
import { CommentRepository } from '@/domain/repositories/comment-repository';

const mockCommentRepository: jest.Mocked<CommentRepository> = {
  fetchComments: jest.fn(),
  createComment: jest.fn(),
  updateComment: jest.fn(),
  deleteComment: jest.fn(),
};

describe('DeleteCommentUseCase', () => {
  let useCase: DeleteCommentUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new DeleteCommentUseCase(mockCommentRepository);
  });

  it('should call commentRepository.deleteComment with the given task id and comment id', async () => {
    mockCommentRepository.deleteComment.mockResolvedValue(undefined);

    await useCase.execute(1, 1);

    expect(mockCommentRepository.deleteComment).toHaveBeenCalledWith(1, 1);
  });

  it('should propagate errors thrown by the repository', async () => {
    mockCommentRepository.deleteComment.mockRejectedValue(
      new Error('You do not have permission to perform this action.')
    );

    await expect(useCase.execute(1, 1)).rejects.toThrow(
      'You do not have permission to perform this action.'
    );
  });
});
