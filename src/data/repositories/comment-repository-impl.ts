import { CommentDataSource } from '@/data/datasources/comment-datasource';
import { Comment, CommentInput } from '@/domain/models/comment';
import { PaginatedResponse } from '@/domain/models/pagination';
import { CommentRepository } from '@/domain/repositories/comment-repository';

export class CommentRepositoryImpl implements CommentRepository {
  constructor(private readonly dataSource: CommentDataSource) {}

  fetchComments(taskId: number, page: number): Promise<PaginatedResponse<Comment>> {
    return this.dataSource.fetchComments(taskId, page);
  }

  createComment(taskId: number, input: CommentInput): Promise<Comment> {
    return this.dataSource.createComment(taskId, input);
  }

  updateComment(
    taskId: number,
    id: number,
    input: CommentInput
  ): Promise<Comment> {
    return this.dataSource.updateComment(taskId, id, input);
  }

  deleteComment(taskId: number, id: number): Promise<void> {
    return this.dataSource.deleteComment(taskId, id);
  }
}
