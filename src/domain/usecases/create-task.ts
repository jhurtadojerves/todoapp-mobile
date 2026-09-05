import { Task, TaskInput } from '@/domain/models/task';
import { TaskRepository } from '@/domain/repositories/task-repository';

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  execute(token: string, boardId: number, input: TaskInput): Promise<Task> {
    return this.taskRepository.createTask(token, boardId, input);
  }
}
