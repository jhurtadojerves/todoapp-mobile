import { CommentRepository } from '@/domain/repositories/comment-repository';

export class DeleteCommentUseCase {
  constructor(private readonly commentRepository: CommentRepository) {}

  execute(token: string, taskId: number, id: number): Promise<void> {
    return this.commentRepository.deleteComment(token, taskId, id);
  }
}
