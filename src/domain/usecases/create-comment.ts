import { Comment, CommentInput } from '@/domain/models/comment';
import { CommentRepository } from '@/domain/repositories/comment-repository';

export class CreateCommentUseCase {
  constructor(private readonly commentRepository: CommentRepository) {}

  execute(token: string, taskId: number, input: CommentInput): Promise<Comment> {
    return this.commentRepository.createComment(token, taskId, input);
  }
}
