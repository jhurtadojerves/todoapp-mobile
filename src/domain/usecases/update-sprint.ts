import { Sprint, SprintInput } from '@/domain/models/sprint';
import { SprintRepository } from '@/domain/repositories/sprint-repository';

export class UpdateSprintUseCase {
  constructor(private readonly sprintRepository: SprintRepository) {}

  execute(token: string, boardId: number, id: number, input: SprintInput): Promise<Sprint> {
    return this.sprintRepository.updateSprint(token, boardId, id, input);
  }
}
