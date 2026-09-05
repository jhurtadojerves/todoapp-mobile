import { SprintRepository } from '@/domain/repositories/sprint-repository';

export class DeleteSprintUseCase {
  constructor(private readonly sprintRepository: SprintRepository) {}

  execute(token: string, boardId: number, id: number): Promise<void> {
    return this.sprintRepository.deleteSprint(token, boardId, id);
  }
}
