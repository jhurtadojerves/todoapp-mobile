import { Task, TaskFilters, TaskInput, taskSchema } from '@/domain/models/task';
import { PaginatedResponse, paginatedSchema } from '@/domain/models/pagination';
import { apiFetch } from '@/shared/api/http-client';
import { buildQueryString } from '@/shared/api/query-string';

const tasksPath = (boardId: number) => `/api/v1/boards/${boardId}/tasks/`;
const taskDetailPath = (id: number) => `/api/v1/tasks/${id}/`;
const paginatedTaskSchema = paginatedSchema(taskSchema);

export class TaskDataSource {
  fetchTasks(
    boardId: number,
    page: number,
    filters: TaskFilters = {}
  ): Promise<PaginatedResponse<Task>> {
    // Query params go straight in the URL, not through a JSON body, so they
    // bypass http-client's camelCase<->snake_case conversion — this key must
    // stay snake_case to match what the DRF filter backend expects.
    const query = buildQueryString({
      page,
      status: filters.status,
      sprint: filters.sprint,
      assigned_to: filters.assignedTo,
    });
    return apiFetch(`${tasksPath(boardId)}${query}`, { schema: paginatedTaskSchema });
  }

  fetchTask(id: number): Promise<Task> {
    return apiFetch(taskDetailPath(id), { schema: taskSchema });
  }

  createTask(boardId: number, input: TaskInput): Promise<Task> {
    return apiFetch(tasksPath(boardId), { method: 'POST', body: input, schema: taskSchema });
  }

  updateTask(id: number, input: TaskInput): Promise<Task> {
    return apiFetch(taskDetailPath(id), { method: 'PATCH', body: input, schema: taskSchema });
  }

  deleteTask(id: number): Promise<void> {
    return apiFetch<void>(taskDetailPath(id), { method: 'DELETE' });
  }
}
