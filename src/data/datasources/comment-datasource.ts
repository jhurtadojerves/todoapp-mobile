import { Comment, CommentInput } from '@/domain/models/comment';
import { PaginatedResponse } from '@/domain/models/pagination';
import { apiFetch } from '@/shared/api/http-client';
import { buildQueryString } from '@/shared/api/query-string';

const commentsPath = (taskId: number) => `/api/v1/tasks/${taskId}/comments/`;
const commentDetailPath = (taskId: number, id: number) => `/api/v1/tasks/${taskId}/comments/${id}/`;

export class CommentDataSource {
  fetchComments(token: string, taskId: number, page: number): Promise<PaginatedResponse<Comment>> {
    return apiFetch<PaginatedResponse<Comment>>(`${commentsPath(taskId)}${buildQueryString({ page })}`, {
      token,
    });
  }

  createComment(token: string, taskId: number, input: CommentInput): Promise<Comment> {
    return apiFetch<Comment>(commentsPath(taskId), { method: 'POST', body: input, token });
  }

  updateComment(
    token: string,
    taskId: number,
    id: number,
    input: CommentInput
  ): Promise<Comment> {
    return apiFetch<Comment>(commentDetailPath(taskId, id), { method: 'PATCH', body: input, token });
  }

  deleteComment(token: string, taskId: number, id: number): Promise<void> {
    return apiFetch<void>(commentDetailPath(taskId, id), { method: 'DELETE', token });
  }
}
