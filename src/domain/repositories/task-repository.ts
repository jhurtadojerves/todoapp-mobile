import { Task, TaskFilters, TaskInput } from '@/domain/models/task';
import { PaginatedResponse } from '@/domain/models/pagination';

export interface TaskRepository {
  fetchTasks(
    boardId: number,
    page: number,
    filters?: TaskFilters
  ): Promise<PaginatedResponse<Task>>;
  fetchTask(id: number): Promise<Task>;
  createTask(boardId: number, input: TaskInput): Promise<Task>;
  updateTask(id: number, input: TaskInput): Promise<Task>;
  deleteTask(id: number): Promise<void>;
}
