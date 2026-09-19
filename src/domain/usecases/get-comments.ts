import { Comment } from '@/domain/models/comment';
import { PaginatedResponse } from '@/domain/models/pagination';
import { CommentRepository } from '@/domain/repositories/comment-repository';

export class GetCommentsUseCase {
  constructor(private readonly commentRepository: CommentRepository) {}

  execute(taskId: number, page: number): Promise<PaginatedResponse<Comment>> {
    return this.commentRepository.fetchComments(taskId, page);
  }
}
