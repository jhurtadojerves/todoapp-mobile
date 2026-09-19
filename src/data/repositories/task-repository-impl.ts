import { TaskDataSource } from '@/data/datasources/task-datasource';
import { Task, TaskFilters, TaskInput } from '@/domain/models/task';
import { PaginatedResponse } from '@/domain/models/pagination';
import { TaskRepository } from '@/domain/repositories/task-repository';

export class TaskRepositoryImpl implements TaskRepository {
  constructor(private readonly dataSource: TaskDataSource) {}

  fetchTasks(
    boardId: number,
    page: number,
    filters?: TaskFilters
  ): Promise<PaginatedResponse<Task>> {
    return this.dataSource.fetchTasks(boardId, page, filters);
  }

  fetchTask(id: number): Promise<Task> {
    return this.dataSource.fetchTask(id);
  }

  createTask(boardId: number, input: TaskInput): Promise<Task> {
    return this.dataSource.createTask(boardId, input);
  }

  updateTask(id: number, input: TaskInput): Promise<Task> {
    return this.dataSource.updateTask(id, input);
  }

  deleteTask(id: number): Promise<void> {
    return this.dataSource.deleteTask(id);
  }
}
