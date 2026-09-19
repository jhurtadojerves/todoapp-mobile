import { Comment, CommentInput, commentSchema } from '@/domain/models/comment';
import { PaginatedResponse, paginatedSchema } from '@/domain/models/pagination';
import { apiFetch } from '@/shared/api/http-client';
import { buildQueryString } from '@/shared/api/query-string';

const commentsPath = (taskId: number) => `/api/v1/tasks/${taskId}/comments/`;
const commentDetailPath = (taskId: number, id: number) => `/api/v1/tasks/${taskId}/comments/${id}/`;
const paginatedCommentSchema = paginatedSchema(commentSchema);

export class CommentDataSource {
  fetchComments(taskId: number, page: number): Promise<PaginatedResponse<Comment>> {
    return apiFetch(`${commentsPath(taskId)}${buildQueryString({ page })}`, {
      schema: paginatedCommentSchema,
    });
  }

  createComment(taskId: number, input: CommentInput): Promise<Comment> {
    return apiFetch(commentsPath(taskId), { method: 'POST', body: input, schema: commentSchema });
  }

  updateComment(
    taskId: number,
    id: number,
    input: CommentInput
  ): Promise<Comment> {
    return apiFetch(commentDetailPath(taskId, id), {
      method: 'PATCH',
      body: input,
      schema: commentSchema,
    });
  }

  deleteComment(taskId: number, id: number): Promise<void> {
    return apiFetch<void>(commentDetailPath(taskId, id), { method: 'DELETE' });
  }
}
