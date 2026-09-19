import { CommentRepository } from '@/domain/repositories/comment-repository';

export class DeleteCommentUseCase {
  constructor(private readonly commentRepository: CommentRepository) {}

  execute(taskId: number, id: number): Promise<void> {
    return this.commentRepository.deleteComment(taskId, id);
  }
}
