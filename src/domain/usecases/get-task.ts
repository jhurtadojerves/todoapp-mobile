import { Task } from '@/domain/models/task';
import { TaskRepository } from '@/domain/repositories/task-repository';

export class GetTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  execute(id: number): Promise<Task> {
    return this.taskRepository.fetchTask(id);
  }
}
