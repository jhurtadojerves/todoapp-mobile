import { Comment, CommentInput } from '@/domain/models/comment';
import { CommentRepository } from '@/domain/repositories/comment-repository';

export class UpdateCommentUseCase {
  constructor(private readonly commentRepository: CommentRepository) {}

  execute(token: string, taskId: number, id: number, input: CommentInput): Promise<Comment> {
    return this.commentRepository.updateComment(token, taskId, id, input);
  }
}
