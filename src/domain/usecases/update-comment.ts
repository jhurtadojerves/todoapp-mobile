import { Comment, CommentInput } from '@/domain/models/comment';
import { CommentRepository } from '@/domain/repositories/comment-repository';

export class UpdateCommentUseCase {
  constructor(private readonly commentRepository: CommentRepository) {}

  execute(taskId: number, id: number, input: CommentInput): Promise<Comment> {
    return this.commentRepository.updateComment(taskId, id, input);
  }
}
