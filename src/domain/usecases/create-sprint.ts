import { Sprint, SprintInput } from '@/domain/models/sprint';
import { SprintRepository } from '@/domain/repositories/sprint-repository';

export class CreateSprintUseCase {
  constructor(private readonly sprintRepository: SprintRepository) {}

  execute(token: string, boardId: number, input: SprintInput): Promise<Sprint> {
    return this.sprintRepository.createSprint(token, boardId, input);
  }
}
