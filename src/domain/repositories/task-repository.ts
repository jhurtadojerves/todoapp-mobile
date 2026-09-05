import { Task, TaskFilters, TaskInput } from '@/domain/models/task';
import { PaginatedResponse } from '@/domain/models/pagination';

export interface TaskRepository {
  fetchTasks(
    token: string,
    boardId: number,
    page: number,
    filters?: TaskFilters
  ): Promise<PaginatedResponse<Task>>;
  fetchTask(token: string, id: number): Promise<Task>;
  createTask(token: string, boardId: number, input: TaskInput): Promise<Task>;
  updateTask(token: string, id: number, input: TaskInput): Promise<Task>;
  deleteTask(token: string, id: number): Promise<void>;
}
