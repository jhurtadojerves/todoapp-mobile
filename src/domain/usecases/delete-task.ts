import { TaskRepository } from '@/domain/repositories/task-repository';

export class DeleteTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  execute(token: string, id: number): Promise<void> {
    return this.taskRepository.deleteTask(token, id);
  }
}
