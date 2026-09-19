import { Sprint } from '@/domain/models/sprint';
import { PaginatedResponse } from '@/domain/models/pagination';
import { SprintRepository } from '@/domain/repositories/sprint-repository';

export class GetSprintsUseCase {
  constructor(private readonly sprintRepository: SprintRepository) {}

  execute(boardId: number, page: number): Promise<PaginatedResponse<Sprint>> {
    return this.sprintRepository.fetchSprints(boardId, page);
  }
}
