import { Task } from '@/domain/models/task';
import { TaskRepository } from '@/domain/repositories/task-repository';

export class GetTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  execute(token: string, id: number): Promise<Task> {
    return this.taskRepository.fetchTask(token, id);
  }
}
