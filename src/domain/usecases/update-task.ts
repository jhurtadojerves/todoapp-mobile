import { Task, TaskInput } from '@/domain/models/task';
import { TaskRepository } from '@/domain/repositories/task-repository';

export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  execute(token: string, id: number, input: TaskInput): Promise<Task> {
    return this.taskRepository.updateTask(token, id, input);
  }
}
