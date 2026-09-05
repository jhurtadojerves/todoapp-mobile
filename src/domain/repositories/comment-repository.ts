import { Comment, CommentInput } from '@/domain/models/comment';
import { PaginatedResponse } from '@/domain/models/pagination';

export interface CommentRepository {
  fetchComments(token: string, taskId: number, page: number): Promise<PaginatedResponse<Comment>>;
  createComment(token: string, taskId: number, input: CommentInput): Promise<Comment>;
  updateComment(
    token: string,
    taskId: number,
    id: number,
    input: CommentInput
  ): Promise<Comment>;
  deleteComment(token: string, taskId: number, id: number): Promise<void>;
}
