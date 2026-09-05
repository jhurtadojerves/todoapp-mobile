import { Sprint } from '@/domain/models/sprint';
import { SprintRepository } from '@/domain/repositories/sprint-repository';

export class GetSprintsUseCase {
  constructor(private readonly sprintRepository: SprintRepository) {}

  execute(token: string, boardId: number): Promise<Sprint[]> {
    return this.sprintRepository.fetchSprints(token, boardId);
  }
}
