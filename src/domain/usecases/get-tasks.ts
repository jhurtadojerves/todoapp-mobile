import { Task, TaskFilters } from '@/domain/models/task';
import { PaginatedResponse } from '@/domain/models/pagination';
import { TaskRepository } from '@/domain/repositories/task-repository';

export class GetTasksUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  execute(
    token: string,
    boardId: number,
    page: number,
    filters?: TaskFilters
  ): Promise<PaginatedResponse<Task>> {
    return this.taskRepository.fetchTasks(token, boardId, page, filters);
  }
}
