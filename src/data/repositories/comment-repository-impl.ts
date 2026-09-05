import { CommentDataSource } from '@/data/datasources/comment-datasource';
import { Comment, CommentInput } from '@/domain/models/comment';
import { PaginatedResponse } from '@/domain/models/pagination';
import { CommentRepository } from '@/domain/repositories/comment-repository';

export class CommentRepositoryImpl implements CommentRepository {
  constructor(private readonly dataSource: CommentDataSource) {}

  fetchComments(token: string, taskId: number, page: number): Promise<PaginatedResponse<Comment>> {
    return this.dataSource.fetchComments(token, taskId, page);
  }

  createComment(token: string, taskId: number, input: CommentInput): Promise<Comment> {
    return this.dataSource.createComment(token, taskId, input);
  }

  updateComment(
    token: string,
    taskId: number,
    id: number,
    input: CommentInput
  ): Promise<Comment> {
    return this.dataSource.updateComment(token, taskId, id, input);
  }

  deleteComment(token: string, taskId: number, id: number): Promise<void> {
    return this.dataSource.deleteComment(token, taskId, id);
  }
}
