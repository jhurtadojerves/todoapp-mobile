import { Sprint, SprintInput } from '@/domain/models/sprint';
import { SprintRepository } from '@/domain/repositories/sprint-repository';

export class CreateSprintUseCase {
  constructor(private readonly sprintRepository: SprintRepository) {}

  execute(boardId: number, input: SprintInput): Promise<Sprint> {
    return this.sprintRepository.createSprint(boardId, input);
  }
}
