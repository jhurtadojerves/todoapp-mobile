import { TaskDataSource } from '@/data/datasources/task-datasource';
import { Task, TaskFilters, TaskInput } from '@/domain/models/task';
import { PaginatedResponse } from '@/domain/models/pagination';
import { TaskRepository } from '@/domain/repositories/task-repository';

export class TaskRepositoryImpl implements TaskRepository {
  constructor(private readonly dataSource: TaskDataSource) {}

  fetchTasks(
    token: string,
    boardId: number,
    page: number,
    filters?: TaskFilters
  ): Promise<PaginatedResponse<Task>> {
    return this.dataSource.fetchTasks(token, boardId, page, filters);
  }

  fetchTask(token: string, id: number): Promise<Task> {
    return this.dataSource.fetchTask(token, id);
  }

  createTask(token: string, boardId: number, input: TaskInput): Promise<Task> {
    return this.dataSource.createTask(token, boardId, input);
  }

  updateTask(token: string, id: number, input: TaskInput): Promise<Task> {
    return this.dataSource.updateTask(token, id, input);
  }

  deleteTask(token: string, id: number): Promise<void> {
    return this.dataSource.deleteTask(token, id);
  }
}
