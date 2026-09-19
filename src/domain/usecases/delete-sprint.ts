import { SprintRepository } from '@/domain/repositories/sprint-repository';

export class DeleteSprintUseCase {
  constructor(private readonly sprintRepository: SprintRepository) {}

  execute(boardId: number, id: number): Promise<void> {
    return this.sprintRepository.deleteSprint(boardId, id);
  }
}
