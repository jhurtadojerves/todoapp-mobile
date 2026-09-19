import { Comment, CommentInput } from '@/domain/models/comment';
import { PaginatedResponse } from '@/domain/models/pagination';

export interface CommentRepository {
  fetchComments(taskId: number, page: number): Promise<PaginatedResponse<Comment>>;
  createComment(taskId: number, input: CommentInput): Promise<Comment>;
  updateComment(
    taskId: number,
    id: number,
    input: CommentInput
  ): Promise<Comment>;
  deleteComment(taskId: number, id: number): Promise<void>;
}
