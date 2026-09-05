import { Task, TaskFilters, TaskInput } from '@/domain/models/task';
import { PaginatedResponse } from '@/domain/models/pagination';
import { apiFetch } from '@/shared/api/http-client';
import { buildQueryString } from '@/shared/api/query-string';

const tasksPath = (boardId: number) => `/api/v1/boards/${boardId}/tasks/`;
const taskDetailPath = (id: number) => `/api/v1/tasks/${id}/`;

export class TaskDataSource {
  fetchTasks(
    token: string,
    boardId: number,
    page: number,
    filters: TaskFilters = {}
  ): Promise<PaginatedResponse<Task>> {
    const query = buildQueryString({
      page,
      status: filters.status,
      sprint: filters.sprint,
      assigned_to: filters.assigned_to,
    });
    return apiFetch<PaginatedResponse<Task>>(`${tasksPath(boardId)}${query}`, { token });
  }

  fetchTask(token: string, id: number): Promise<Task> {
    return apiFetch<Task>(taskDetailPath(id), { token });
  }

  createTask(token: string, boardId: number, input: TaskInput): Promise<Task> {
    return apiFetch<Task>(tasksPath(boardId), { method: 'POST', body: input, token });
  }

  updateTask(token: string, id: number, input: TaskInput): Promise<Task> {
    return apiFetch<Task>(taskDetailPath(id), { method: 'PATCH', body: input, token });
  }

  deleteTask(token: string, id: number): Promise<void> {
    return apiFetch<void>(taskDetailPath(id), { method: 'DELETE', token });
  }
}
